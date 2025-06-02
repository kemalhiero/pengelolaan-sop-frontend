<script setup>
import { onMounted, ref, nextTick, watch } from 'vue';

const props = defineProps({
  connection: {
    type: Object,
    required: true
  },
  idarrow: {
    type: String,
    required: true
  },
  idcontainer: {
    type: String,
    required: true
  }
});

const emit = defineEmits(['mounted']);

// State untuk menyimpan path data
const pathData = ref('');
const labelPosition = ref(null);

// Fungsi untuk mendapatkan posisi elemen dengan pengecekan null
const getElementPosition = (elementId) => {
  const element = document.getElementById(elementId);
  const container = document.querySelector(`#${props.idcontainer}`);

  if (!element || !container) {
    console.warn('Element not found:', {
      elementId,
      containerId: props.idcontainer,
      connection: props.connection
    });
    return null;
  }

  const rect = element.getBoundingClientRect();
  const containerRect = container.getBoundingClientRect();

  const position = {
    left: rect.left - containerRect.left,
    right: rect.right - containerRect.left,
    top: rect.top - containerRect.top,
    bottom: rect.bottom - containerRect.top,
    width: rect.width,
    height: rect.height
  };

  // console.info(`Position for ${elementId}:`, position);
  return position;
};

const calculatePath = async () => {
  await nextTick();

  requestAnimationFrame(() => {
    const fromPos = getElementPosition(props.connection.from);
    const toPos = getElementPosition(props.connection.to);

    if (!fromPos || !toPos) {
      pathData.value = '';
      return;
    }

    let calculatedPath = '';
    let finalStart = {}; // Untuk posisi label
    let finalEnd = {};   // Untuk posisi label
    let pathType = ''; // Untuk posisi label: 'direct', 'one_bend_vh', 'one_bend_hv', 'two_bend_vhv', 'two_bend_hvh'
    let bendPoints = []; // Untuk posisi label

    if (props.connection.isOpcConnection) {
      // Logika OPC Connection tetap sama
      if (props.connection.direction === 'down') {
        finalStart = { x: fromPos.left + fromPos.width / 2, y: fromPos.bottom };
        finalEnd = { x: toPos.left + toPos.width / 2, y: toPos.top };
        const midY = (finalStart.y + finalEnd.y) / 2;
        calculatedPath = `M ${finalStart.x} ${finalStart.y} L ${finalStart.x} ${midY} L ${finalEnd.x} ${midY} L ${finalEnd.x} ${finalEnd.y}`;
      } else {
        finalStart = { x: fromPos.left + fromPos.width / 2, y: fromPos.bottom }; // Perlu penyesuaian jika OPC atas
        finalEnd = { x: toPos.left + toPos.width / 2, y: toPos.top };
        const midY = (finalStart.y + finalEnd.y) / 2;
        calculatedPath = `M ${finalStart.x} ${finalStart.y} L ${finalStart.x} ${midY} L ${finalEnd.x} ${midY} L ${finalEnd.x} ${finalEnd.y}`;
      }
      pathType = 'two_bend_vhv'; // Asumsi OPC selalu VHV
      bendPoints = [{x: finalStart.x, y: (finalStart.y + finalEnd.y) / 2}, {x: finalEnd.x, y: (finalStart.y + finalEnd.y) / 2}];
    } else {
      // Koneksi Normal - Logika Refaktorisasi
      const alignmentTolerance = 10; // Toleransi yang lebih ketat mungkin lebih baik

      const fromPoints = {
        top: { x: fromPos.left + fromPos.width / 2, y: fromPos.top },
        bottom: { x: fromPos.left + fromPos.width / 2, y: fromPos.bottom },
        left: { x: fromPos.left, y: fromPos.top + fromPos.height / 2 },
        right: { x: fromPos.right, y: fromPos.top + fromPos.height / 2 }
      };
      const toPoints = {
        top: { x: toPos.left + toPos.width / 2, y: toPos.top },
        bottom: { x: toPos.left + toPos.width / 2, y: toPos.bottom },
        left: { x: toPos.left, y: toPos.top + toPos.height / 2 },
        right: { x: toPos.right, y: toPos.top + toPos.height / 2 }
      };

      // Pusat elemen
      const fromCenter = { x: fromPos.left + fromPos.width / 2, y: fromPos.top + fromPos.height / 2 };
      const toCenter = { x: toPos.left + toPos.width / 2, y: toPos.top + toPos.height / 2 };

      // Perbedaan posisi pusat
      const deltaX = toCenter.x - fromCenter.x;
      const deltaY = toCenter.y - fromCenter.y;

      // 1. Coba Jalur Langsung (0 belokan)
      if (Math.abs(fromCenter.x - toCenter.x) < alignmentTolerance && toPos.top >= fromPos.bottom - alignmentTolerance) { // Langsung di bawah
        finalStart = fromPoints.bottom;
        finalEnd = toPoints.top;
        calculatedPath = `M ${finalStart.x} ${finalStart.y} L ${finalEnd.x} ${finalEnd.y}`;
        pathType = 'direct';
      } else if (Math.abs(fromCenter.x - toCenter.x) < alignmentTolerance && fromPos.top >= toPos.bottom - alignmentTolerance) { // Langsung di atas
        finalStart = fromPoints.top;
        finalEnd = toPoints.bottom;
        calculatedPath = `M ${finalStart.x} ${finalStart.y} L ${finalEnd.x} ${finalEnd.y}`;
        pathType = 'direct';
      } else if (Math.abs(fromCenter.y - toCenter.y) < alignmentTolerance && toPos.left >= fromPos.right - alignmentTolerance) { // Langsung di kanan
        finalStart = fromPoints.right;
        finalEnd = toPoints.left;
        calculatedPath = `M ${finalStart.x} ${finalStart.y} L ${finalEnd.x} ${finalEnd.y}`;
        pathType = 'direct';
      } else if (Math.abs(fromCenter.y - toCenter.y) < alignmentTolerance && fromPos.left >= toPos.right - alignmentTolerance) { // Langsung di kiri
        finalStart = fromPoints.left;
        finalEnd = toPoints.right;
        calculatedPath = `M ${finalStart.x} ${finalStart.y} L ${finalEnd.x} ${finalEnd.y}`;
        pathType = 'direct';
      }

      // 2. Coba Jalur Satu Belokan (jika tidak ada jalur langsung)
      if (!calculatedPath) {
        // Coba V-H (Vertikal dulu, lalu Horizontal)
        if (deltaY > 0) { // Target di bawah
          finalStart = fromPoints.bottom;
          if (deltaX > 0) { // Target di kanan bawah
            finalEnd = toPoints.left;
            calculatedPath = `M ${finalStart.x} ${finalStart.y} L ${finalStart.x} ${finalEnd.y} L ${finalEnd.x} ${finalEnd.y}`;
            bendPoints = [{x: finalStart.x, y: finalEnd.y}];
          } else { // Target di kiri bawah
            finalEnd = toPoints.right;
            calculatedPath = `M ${finalStart.x} ${finalStart.y} L ${finalStart.x} ${finalEnd.y} L ${finalEnd.x} ${finalEnd.y}`;
            bendPoints = [{x: finalStart.x, y: finalEnd.y}];
          }
          pathType = 'one_bend_vh';
        } else if (deltaY < 0) { // Target di atas
          finalStart = fromPoints.top;
          if (deltaX > 0) { // Target di kanan atas
            finalEnd = toPoints.left;
            calculatedPath = `M ${finalStart.x} ${finalStart.y} L ${finalStart.x} ${finalEnd.y} L ${finalEnd.x} ${finalEnd.y}`;
            bendPoints = [{x: finalStart.x, y: finalEnd.y}];
          } else { // Target di kiri atas
            finalEnd = toPoints.right;
            calculatedPath = `M ${finalStart.x} ${finalStart.y} L ${finalStart.x} ${finalEnd.y} L ${finalEnd.x} ${finalEnd.y}`;
            bendPoints = [{x: finalStart.x, y: finalEnd.y}];
          }
          pathType = 'one_bend_vh';
        }

        // Coba H-V (Horizontal dulu, lalu Vertikal) - Jika V-H tidak cocok atau sebagai alternatif
        // Kondisi ini mungkin perlu disempurnakan agar tidak selalu menimpa V-H jika V-H sudah valid
        // Untuk sekarang, kita coba jika V-H belum menghasilkan path atau jika H-V lebih "langsung"
        let canTryHV = false;
        if (!calculatedPath) canTryHV = true;
        // Heuristik: jika perpindahan horizontal lebih dominan, H-V mungkin lebih baik
        else if (Math.abs(deltaX) > Math.abs(deltaY) * 1.5) canTryHV = true;


        if (canTryHV) {
            let tempHVPath = '';
            let tempHVStart = {};
            let tempHVEnd = {};
            let tempHVBend = {};

            if (deltaX > 0) { // Target di kanan
              tempHVStart = fromPoints.right;
              if (deltaY > 0) { // Target di kanan bawah
                tempHVEnd = toPoints.top;
                tempHVPath = `M ${tempHVStart.x} ${tempHVStart.y} L ${tempHVEnd.x} ${tempHVStart.y} L ${tempHVEnd.x} ${tempHVEnd.y}`;
                tempHVBend = {x: tempHVEnd.x, y: tempHVStart.y};
              } else { // Target di kanan atas
                tempHVEnd = toPoints.bottom;
                tempHVPath = `M ${tempHVStart.x} ${tempHVStart.y} L ${tempHVEnd.x} ${tempHVStart.y} L ${tempHVEnd.x} ${tempHVEnd.y}`;
                tempHVBend = {x: tempHVEnd.x, y: tempHVStart.y};
              }
            } else if (deltaX < 0) { // Target di kiri
              tempHVStart = fromPoints.left;
              if (deltaY > 0) { // Target di kiri bawah
                tempHVEnd = toPoints.top;
                tempHVPath = `M ${tempHVStart.x} ${tempHVStart.y} L ${tempHVEnd.x} ${tempHVStart.y} L ${tempHVEnd.x} ${tempHVEnd.y}`;
                tempHVBend = {x: tempHVEnd.x, y: tempHVStart.y};
              } else { // Target di kiri atas
                tempHVEnd = toPoints.bottom;
                tempHVPath = `M ${tempHVStart.x} ${tempHVStart.y} L ${tempHVEnd.x} ${tempHVStart.y} L ${tempHVEnd.x} ${tempHVEnd.y}`;
                tempHVBend = {x: tempHVEnd.x, y: tempHVStart.y};
              }
            }
            if (tempHVPath) {
                // Jika V-H belum ada, atau jika H-V dianggap lebih baik (misal, lebih pendek - logika ini belum ada)
                // Untuk sekarang, jika V-H ada, kita tidak menimpaanya kecuali ada kriteria kuat.
                // Jika V-H tidak ada, kita gunakan H-V.
                if(!calculatedPath || (calculatedPath && Math.abs(deltaX) > Math.abs(deltaY) * 1.2) ){ // Prefer H-V if more horizontal
                    calculatedPath = tempHVPath;
                    finalStart = tempHVStart;
                    finalEnd = tempHVEnd;
                    bendPoints = [tempHVBend];
                    pathType = 'one_bend_hv';
                }
            }
        }
      }

      // 3. Jalur Dua Belokan (Fallback jika 0 atau 1 belokan tidak ditemukan/cocok)
      if (!calculatedPath) {
        // Pilih antara V-H-V atau H-V-H berdasarkan perpindahan dominan
        if (Math.abs(deltaY) >= Math.abs(deltaX)) { // Perpindahan vertikal dominan atau sama -> V-H-V
          if (deltaY >= 0) { // Target di bawah (atau sejajar secara vertikal tapi beda kolom)
            finalStart = fromPoints.bottom;
            finalEnd = toPoints.top;
          } else { // Target di atas
            finalStart = fromPoints.top;
            finalEnd = toPoints.bottom;
          }
          const midY = (finalStart.y + finalEnd.y) / 2;
          // Tambahkan sedikit offset jika midY terlalu dekat dengan start atau end untuk menghindari garis pendek
          let effectiveMidY = midY;
          if (Math.abs(finalStart.y - midY) < 10 && finalStart.y !== finalEnd.y) effectiveMidY = finalStart.y + Math.sign(finalEnd.y - finalStart.y) * 20;
          else if (Math.abs(finalEnd.y - midY) < 10 && finalStart.y !== finalEnd.y) effectiveMidY = finalEnd.y - Math.sign(finalEnd.y - finalStart.y) * 20;


          calculatedPath = `M ${finalStart.x} ${finalStart.y} L ${finalStart.x} ${effectiveMidY} L ${finalEnd.x} ${effectiveMidY} L ${finalEnd.x} ${finalEnd.y}`;
          pathType = 'two_bend_vhv';
          bendPoints = [{x: finalStart.x, y: effectiveMidY}, {x: finalEnd.x, y: effectiveMidY}];
        } else { // Perpindahan horizontal dominan -> H-V-H
          if (deltaX >= 0) { // Target di kanan (atau sejajar secara horizontal tapi beda baris)
            finalStart = fromPoints.right;
            finalEnd = toPoints.left;
          } else { // Target di kiri
            finalStart = fromPoints.left;
            finalEnd = toPoints.right;
          }
          const midX = (finalStart.x + finalEnd.x) / 2;
          let effectiveMidX = midX;
          if (Math.abs(finalStart.x - midX) < 10 && finalStart.x !== finalEnd.x) effectiveMidX = finalStart.x + Math.sign(finalEnd.x - finalStart.x) * 20;
          else if (Math.abs(finalEnd.x - midX) < 10 && finalStart.x !== finalEnd.x) effectiveMidX = finalEnd.x - Math.sign(finalEnd.x - finalStart.x) * 20;

          calculatedPath = `M ${finalStart.x} ${finalStart.y} L ${effectiveMidX} ${finalStart.y} L ${effectiveMidX} ${finalEnd.y} L ${finalEnd.x} ${finalEnd.y}`;
          pathType = 'two_bend_hvh';
          bendPoints = [{x: effectiveMidX, y: finalStart.y}, {x: effectiveMidX, y: finalEnd.y}];
        }
      }
    }

    pathData.value = calculatedPath;

    // Sesuaikan posisi label
    if (props.connection.label && finalStart.x !== undefined) {
      const offset = 15; // Jarak label dari garis
      let lx = 0, ly = 0;

      if (pathType === 'direct') {
        lx = (finalStart.x + finalEnd.x) / 2;
        ly = (finalStart.y + finalEnd.y) / 2;
        // Geser label sedikit dari garis lurus
        if (Math.abs(finalStart.x - finalEnd.x) < Math.abs(finalStart.y - finalEnd.y)) { // Garis lebih vertikal
          lx += offset;
        } else { // Garis lebih horizontal
          ly -= offset;
        }
      } else if (pathType === 'one_bend_vh' || pathType === 'one_bend_hv' && bendPoints.length > 0) {
        // Dekat titik belokan
        lx = bendPoints[0].x;
        ly = bendPoints[0].y;
        if (pathType === 'one_bend_vh') { // Belokan dari vertikal ke horizontal
            lx += (finalEnd.x > finalStart.x ? offset : -offset); // Geser horizontal dari segmen vertikal
            ly += (finalEnd.y > finalStart.y ? offset/2 : -offset/2); // Sedikit vertikal
        } else { // Belokan dari horizontal ke vertikal
            lx += (finalEnd.x > finalStart.x ? offset/2 : -offset/2);
            ly += (finalEnd.y > finalStart.y ? offset : -offset); // Geser vertikal dari segmen horizontal
        }
      } else if ((pathType === 'two_bend_vhv' || pathType === 'two_bend_hvh') && bendPoints.length === 2) {
        // Di tengah segmen tengah
        lx = (bendPoints[0].x + bendPoints[1].x) / 2;
        ly = (bendPoints[0].y + bendPoints[1].y) / 2;
        if (pathType === 'two_bend_vhv') { // Segmen tengah horizontal
          ly -= offset; // Di atas segmen tengah
        } else { // Segmen tengah vertikal
          lx += offset; // Di kanan segmen tengah
        }
      } else { // Fallback jika pathType tidak dikenali atau bendPoints kosong
          lx = (finalStart.x + finalEnd.x) / 2;
          ly = (finalStart.y + finalEnd.y) / 2 - offset;
      }
      labelPosition.value = { x: lx, y: ly };
    } else {
      labelPosition.value = null;
    }

    emit('mounted');
  });
};

onMounted(() => {
  calculatePath();
});

// Tambahkan watch untuk connection
watch(() => props.connection, () => {
  calculatePath();
}, { deep: true });
</script>

<template>
  <g v-if="pathData">
    <!-- Definisi marker panah -->
    <defs>
      <marker :id="`arrowhead-${idarrow}`" markerWidth="10" markerHeight="8" refX="7" refY="4" orient="auto">
        <path d="M0,0 L8,4 L0,8 L2,4 Z" fill="black" />
      </marker>
    </defs>

    <!-- Path panah -->
    <path :d="pathData" fill="none" stroke="black" stroke-width="2" :marker-end="`url(#arrowhead-${idarrow})`" />

    <!-- Label -->
    <text v-if="labelPosition && props.connection.label" :x="labelPosition.x" :y="labelPosition.y"
      class="text-sm font-medium fill-black" text-anchor="middle" alignment-baseline="middle">
      {{ props.connection.label }}
    </text>
  </g>
</template>
