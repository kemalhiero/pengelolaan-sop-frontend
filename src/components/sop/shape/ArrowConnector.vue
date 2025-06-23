<script setup>
import { onMounted, ref, nextTick, watch } from 'vue';

const props = defineProps({
  connection: {
    type: Object,
    required: true
  },
  idarrow: {
    type: [String, Number],
    required: true
  },
  idcontainer: {
    type: String,
    required: true
  },
  redrawKey: {
    type: [String, Number],
    default: 0
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
    let finalStart = {};
    let finalEnd = {};
    let pathType = '';
    let bendPoints = [];

    // Check if this is a segment of an OPC connection
    if (props.connection.isOpcConnectionSegment) {
      finalStart = {
        x: fromPos.left + fromPos.width / 2,
        y: props.connection.flowDirection === 'up' ? fromPos.top : fromPos.bottom
      };
      finalEnd = {
        x: toPos.left + toPos.width / 2,
        y: props.connection.flowDirection === 'down' ? toPos.top : toPos.bottom
      };

      // Standard VHV path for OPC connections using the calculated finalStart and finalEnd
      const midY = (finalStart.y + finalEnd.y) / 2;
      calculatedPath = `M ${finalStart.x} ${finalStart.y} L ${finalStart.x} ${midY} L ${finalEnd.x} ${midY} L ${finalEnd.x} ${finalEnd.y}`;
      pathType = 'two_bend_vhv'; // For label positioning, OPCs typically use VHV
      bendPoints = [{ x: finalStart.x, y: midY }, { x: finalEnd.x, y: midY }];

      // === Perbaiki penempatan label agar konsisten ===
      if (props.connection.label) {
        const labelDistance = 30; // Atur sesuai kebutuhan
        const offset = 19;
        // Gunakan segmen pertama: dari finalStart ke bendPoints[0]
        function getFixedDistancePoint(start, target, distance, offset = 19) {
          const dx = target.x - start.x;
          const dy = target.y - start.y;
          const length = Math.sqrt(dx * dx + dy * dy);
          if (length === 0) return { x: start.x, y: start.y };
          const px = start.x + (dx / length) * distance;
          const py = start.y + (dy / length) * distance;
          if (Math.abs(dx) > Math.abs(dy)) {
            return { x: px, y: py - offset };
          } else {
            return { x: px + offset, y: py };
          }
        }
        const targetPoint = bendPoints[0];
        const p = getFixedDistancePoint(finalStart, targetPoint, labelDistance, offset);
        labelPosition.value = { x: p.x, y: p.y };
      } else {
        labelPosition.value = null;
      }

    } else {
      // Koneksi Normal - Logika Refaktorisasi (existing logic for non-OPC connections)
      const alignmentTolerance = 10;

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

      const fromCenter = { x: fromPos.left + fromPos.width / 2, y: fromPos.top + fromPos.height / 2 };
      const toCenter = { x: toPos.left + toPos.width / 2, y: toPos.top + toPos.height / 2 };
      const deltaX = toCenter.x - fromCenter.x;
      const deltaY = toCenter.y - fromCenter.y;

      // 1. Coba Jalur Langsung (0 belokan)
      if (Math.abs(fromCenter.x - toCenter.x) < alignmentTolerance && toPos.top >= fromPos.bottom - alignmentTolerance) {
        finalStart = fromPoints.bottom;
        finalEnd = toPoints.top;
        calculatedPath = `M ${finalStart.x} ${finalStart.y} L ${finalEnd.x} ${finalEnd.y}`;
        pathType = 'direct';
      } else if (Math.abs(fromCenter.x - toCenter.x) < alignmentTolerance && fromPos.top >= toPos.bottom - alignmentTolerance) {
        finalStart = fromPoints.top;
        finalEnd = toPoints.bottom;
        calculatedPath = `M ${finalStart.x} ${finalStart.y} L ${finalEnd.x} ${finalEnd.y}`;
        pathType = 'direct';
      } else if (Math.abs(fromCenter.y - toCenter.y) < alignmentTolerance && toPos.left >= fromPos.right - alignmentTolerance) {
        finalStart = fromPoints.right;
        finalEnd = toPoints.left;
        calculatedPath = `M ${finalStart.x} ${finalStart.y} L ${finalEnd.x} ${finalEnd.y}`;
        pathType = 'direct';
      } else if (Math.abs(fromCenter.y - toCenter.y) < alignmentTolerance && fromPos.left >= toPos.right - alignmentTolerance) {
        finalStart = fromPoints.left;
        finalEnd = toPoints.right;
        calculatedPath = `M ${finalStart.x} ${finalStart.y} L ${finalEnd.x} ${finalEnd.y}`;
        pathType = 'direct';
      }

      // 2. Coba Jalur Satu Belokan
      if (!calculatedPath) {
        let vhPath = '', hvPath = '';
        let vhStart, vhEnd, vhBend, hvStart, hvEnd, hvBend;

        // Try V-H
        if (deltaY > 0) {
          vhStart = fromPoints.bottom;
          vhEnd = (deltaX > 0) ? toPoints.left : toPoints.right;
        } else if (deltaY < 0) {
          vhStart = fromPoints.top;
          vhEnd = (deltaX > 0) ? toPoints.left : toPoints.right;
        }
        if (vhStart && vhEnd) {
          vhPath = `M ${vhStart.x} ${vhStart.y} L ${vhStart.x} ${vhEnd.y} L ${vhEnd.x} ${vhEnd.y}`;
          vhBend = { x: vhStart.x, y: vhEnd.y };
        }

        // Try H-V
        if (deltaX > 0) {
          hvStart = fromPoints.right;
          hvEnd = (deltaY > 0) ? toPoints.top : toPoints.bottom;
        } else if (deltaX < 0) {
          hvStart = fromPoints.left;
          hvEnd = (deltaY > 0) ? toPoints.top : toPoints.bottom;
        }
        if (hvStart && hvEnd) {
          hvPath = `M ${hvStart.x} ${hvStart.y} L ${hvEnd.x} ${hvStart.y} L ${hvEnd.x} ${hvEnd.y}`;
          hvBend = { x: hvEnd.x, y: hvStart.y };
        }

        // Prefer path with shorter first segment or based on dominant direction
        if (vhPath && hvPath) {
          if (Math.abs(deltaY) >= Math.abs(deltaX)) { // Vertical move is dominant or equal
            calculatedPath = vhPath; finalStart = vhStart; finalEnd = vhEnd; bendPoints = [vhBend]; pathType = 'one_bend_vh';
          } else { // Horizontal move is dominant
            calculatedPath = hvPath; finalStart = hvStart; finalEnd = hvEnd; bendPoints = [hvBend]; pathType = 'one_bend_hv';
          }
        } else if (vhPath) {
          calculatedPath = vhPath; finalStart = vhStart; finalEnd = vhEnd; bendPoints = [vhBend]; pathType = 'one_bend_vh';
        } else if (hvPath) {
          calculatedPath = hvPath; finalStart = hvStart; finalEnd = hvEnd; bendPoints = [hvBend]; pathType = 'one_bend_hv';
        }
      }

      // 3. Jalur Dua Belokan (Fallback)
      if (!calculatedPath) {
        if (Math.abs(deltaY) >= Math.abs(deltaX)) {
          finalStart = (deltaY >= 0) ? fromPoints.bottom : fromPoints.top;
          finalEnd = (deltaY >= 0) ? toPoints.top : toPoints.bottom;
          const midY = (finalStart.y + finalEnd.y) / 2;
          calculatedPath = `M ${finalStart.x} ${finalStart.y} L ${finalStart.x} ${midY} L ${finalEnd.x} ${midY} L ${finalEnd.x} ${finalEnd.y}`;
          pathType = 'two_bend_vhv';
          bendPoints = [{ x: finalStart.x, y: midY }, { x: finalEnd.x, y: midY }];
        } else {
          finalStart = (deltaX >= 0) ? fromPoints.right : fromPoints.left;
          finalEnd = (deltaX >= 0) ? toPoints.left : toPoints.right;
          const midX = (finalStart.x + finalEnd.x) / 2;
          calculatedPath = `M ${finalStart.x} ${finalStart.y} L ${midX} ${finalStart.y} L ${midX} ${finalEnd.y} L ${finalEnd.x} ${finalEnd.y}`;
          pathType = 'two_bend_hvh';
          bendPoints = [{ x: midX, y: finalStart.y }, { x: midX, y: finalEnd.y }];
        }
      }

      // Tempatkan label di sepertiga jarak dari garis lurus pertama, dengan sedikit offset dari garis
      if (props.connection.label && finalStart.x !== undefined && finalEnd.x !== undefined) {
        const labelDistance = 30; // Jarak label dari shape asal dalam piksel (ubah sesuai kebutuhan)
        let lx = 0, ly = 0;
      
        // Fungsi untuk menghitung titik offset dari garis (finalStart ke target) sejauh labelDistance piksel
        function getFixedDistancePoint(start, target, distance, offset = 19) {
          const dx = target.x - start.x;
          const dy = target.y - start.y;
          const length = Math.sqrt(dx * dx + dy * dy);
          if (length === 0) return { x: start.x, y: start.y };
      
          // Ambil titik sejauh 'distance' piksel dari start ke target
          const px = start.x + (dx / length) * distance;
          const py = start.y + (dy / length) * distance;
      
          // Offset label agar tidak menumpuk garis
          if (Math.abs(dx) > Math.abs(dy)) {
            return { x: px, y: py - offset }; // Garis horizontal, offset vertikal
          } else {
            return { x: px + offset, y: py }; // Garis vertikal, offset horizontal
          }
        }
      
        // Selalu gunakan segmen pertama (dari finalStart ke bendPoints[0] jika ada, jika tidak ke finalEnd)
        const targetPoint = bendPoints.length > 0 ? bendPoints[0] : finalEnd;
        const p = getFixedDistancePoint(finalStart, targetPoint, labelDistance, 19);
        lx = p.x;
        ly = p.y;
      
        labelPosition.value = { x: lx, y: ly };
      } else {
        labelPosition.value = null;
      }
    }
    pathData.value = calculatedPath;
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

// Tambahkan watch untuk redrawKey
watch(() => props.redrawKey, () => {
  calculatePath();
});
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
