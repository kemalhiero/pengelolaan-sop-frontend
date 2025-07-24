<script setup>
import { onMounted, ref, watch, inject } from 'vue';

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
  },
  obstacles: {
    type: Array,
    default: () => []
  },
  usedSides: {
    type: Object,
    default: () => ({})
  },
  manualConfig: {
    type: Object,
    default: null
  },
  // BARU: Props untuk mode edit
  editMode: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['mounted', 'path-updated', 'manual-edit']);

// BARU: State untuk mode edit
const isDragging = ref(false);
const dragTarget = ref(null);
const dragIndex = ref(-1);
const localPoints = ref([]);

// State untuk menyimpan path data
const pathData = ref('');
const labelPosition = ref(null);

// BARU: State untuk menyimpan konfigurasi algoritma (fallback)
const algorithmConfig = ref(null);

// BARU: State untuk menampilkan koordinat saat drag
const showCoordinates = ref(false);
const dragCoordinates = ref({ x: 0, y: 0 });

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
  // console.log(`[ArrowConnector] ID ${props.connection.id}: Checking manual config:`, props.manualConfig);
  
  // PERBAIKAN: Validasi konfigurasi manual lebih ketat
  const hasValidManualConfig = props.manualConfig && 
    props.manualConfig.startPoint && 
    props.manualConfig.endPoint &&
    typeof props.manualConfig.startPoint.x === 'number' &&
    typeof props.manualConfig.startPoint.y === 'number' &&
    typeof props.manualConfig.endPoint.x === 'number' &&
    typeof props.manualConfig.endPoint.y === 'number' &&
    !isNaN(props.manualConfig.startPoint.x) &&
    !isNaN(props.manualConfig.startPoint.y) &&
    !isNaN(props.manualConfig.endPoint.x) &&
    !isNaN(props.manualConfig.endPoint.y);

  if (hasValidManualConfig) {
    console.log(`[ArrowConnector] ID ${props.connection.id}: Menggunakan konfigurasi manual.`);
    const { startPoint, endPoint, bendPoints = [] } = props.manualConfig;
    
    // Set local points untuk editing
    localPoints.value = [
      { ...startPoint, type: 'start' },
      ...bendPoints.map(p => ({ ...p, type: 'bend' })),
      { ...endPoint, type: 'end' }
    ];
    
    let d = `M ${startPoint.x} ${startPoint.y}`;
    bendPoints.forEach(p => { d += ` L ${p.x} ${p.y}`; });
    d += ` L ${endPoint.x} ${endPoint.y}`;
    
    pathData.value = d;
    
    // PERBAIKAN: Hitung posisi label untuk konfigurasi manual
    if (props.connection.label) {
      const labelDistance = 30;
      const start = startPoint;
      const end = bendPoints.length > 0 ? bendPoints[0] : endPoint;
      
      const p = getFixedDistancePoint(start, end, labelDistance, 19);
      if (p) {
        labelPosition.value = { x: p.x, y: p.y };
      } else {
        labelPosition.value = null;
      }
    }
    
    emit('path-updated', {
        connectionId: props.connection.id,
        ...props.manualConfig
    });
    emit('mounted');
    return;
  }

  console.log(`[ArrowConnector] ID ${props.connection.id}: Menggunakan algoritma untuk menghitung jalur.`);
  requestAnimationFrame(() => {
    const fromPos = getElementPosition(props.connection.from);
    const toPos = getElementPosition(props.connection.to);

    if (!fromPos || !toPos) {
      return;
    }

    let calculatedPath = '';
    let finalStart = {};
    let finalEnd = {};
    let bendPoints = [];
    let potentialPaths = []; // Inisialisasi potentialPaths di sini

    // 1. Dapatkan semua shape lain sebagai obstacle
    const obstacleRects = (props.obstacles || [])
      .map(obs => obs.id)
      .filter(id => id && id !== props.connection.from && id !== props.connection.to)
      .map(id => getElementPosition(id))
      .filter(rect => rect !== null);

    // 2. Fungsi untuk deteksi tabrakan
    const isPathColliding = (points, obstacles) => {
      const isPointInRect = (p, rect) => {
        const padding = 15;
        return p.x >= rect.left - padding && p.x <= rect.right + padding &&
          p.y >= rect.top - padding && p.y <= rect.bottom + padding;
      };

      for (let i = 0; i < points.length - 1; i++) {
        const p1 = points[i];
        const p2 = points[i + 1];
        const distance = Math.hypot(p2.x - p1.x, p2.y - p1.y);
        if (distance < 1) continue;

        const numSamples = Math.max(2, Math.ceil(distance / 10));

        for (let j = 1; j < numSamples; j++) {
          const t = j / numSamples;
          const samplePoint = {
            x: p1.x + t * (p2.x - p1.x),
            y: p1.y + t * (p2.y - p1.y),
          };
          for (const obs of obstacles) {
            if (isPointInRect(samplePoint, obs)) return true;
          }
        }
      }
      return false;
    };


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

    // 3. Hasilkan semua kemungkinan jalur ortogonal (0, 1, dan 2 belokan)
    const fromCenter = { x: fromPos.left + fromPos.width / 2, y: fromPos.top + fromPos.height / 2 };
    const toCenter = { x: toPos.left + toPos.width / 2, y: toPos.top + toPos.height / 2 };
    const deltaX = toCenter.x - fromCenter.x;
    const deltaY = toCenter.y - fromCenter.y;

    const startSides = ['right', 'left', 'bottom',  'top'];
    const endSides = ['top', 'left', 'right', 'bottom'];

    for (const sSide of startSides) {
      for (const eSide of endSides) {
        const start = fromPoints[sSide];
        const end = toPoints[eSide];

        // Tipe shape yang memerlukan koneksi di tengah
        const centeredConnectionTypes = ['connector', 'decision'];
        const isSourceCentered = centeredConnectionTypes.includes(props.connection.sourceType);
        const isTargetCentered = centeredConnectionTypes.includes(props.connection.targetType);

        // 0-Bend Paths (Lurus) - LOGIKA DIMODIFIKASI
        // Cek kesejajaran vertikal (kolom yang sama)
        if ((sSide === 'bottom' && eSide === 'top' && fromPos.bottom <= toPos.top) || (sSide === 'top' && eSide === 'bottom' && fromPos.top >= toPos.bottom)) {
          const overlapLeft = Math.max(fromPos.left, toPos.left);
          const overlapRight = Math.min(fromPos.right, toPos.right);
          if (overlapRight > overlapLeft) { // Jika ada tumpang tindih horizontal
            // Tentukan X berdasarkan tipe shape
            let finalX;
            if (isSourceCentered) {
              finalX = fromPoints[sSide].x; // Prioritaskan titik tengah sumber
            } else if (isTargetCentered) {
              finalX = toPoints[eSide].x; // Prioritaskan titik tengah target
            } else {
              finalX = overlapLeft + (overlapRight - overlapLeft) / 2; // Gunakan titik tengah tumpang tindih
            }

            const points = [{ x: finalX, y: start.y }, { x: finalX, y: end.y }];
            potentialPaths.push({ points, start: points[0], end: points[1], bendPoints: [], type: 'straight_optimal_v', sSide, eSide, length: Math.abs(start.y - end.y), score: 1 });
          }
        }
        // Cek kesejajaran horizontal (baris yang sama)
        if ((sSide === 'right' && eSide === 'left' && fromPos.right <= toPos.left) || (sSide === 'left' && eSide === 'right' && fromPos.left >= toPos.right)) {
          const overlapTop = Math.max(fromPos.top, toPos.top);
          const overlapBottom = Math.min(fromPos.bottom, toPos.bottom);
          if (overlapBottom > overlapTop) { // Jika ada tumpang tindih vertikal
            // Tentukan Y berdasarkan tipe shape
            let finalY;
            if (isSourceCentered) {
              finalY = fromPoints[sSide].y; // Prioritaskan titik tengah sumber
            } else if (isTargetCentered) {
              finalY = toPoints[eSide].y; // Prioritaskan titik tengah target
            } else {
              finalY = overlapTop + (overlapBottom - overlapTop) / 2; // Gunakan titik tengah tumpang tindih
            }

            const points = [{ x: start.x, y: finalY }, { x: end.x, y: finalY }];
            potentialPaths.push({ points, start: points[0], end: points[1], bendPoints: [], type: 'straight_optimal_h', sSide, eSide, length: Math.abs(start.x - end.x), score: 1 });
          }
        }

        // 1-Bend Paths (Bentuk L)
        if ((sSide === 'top' || sSide === 'bottom') && (eSide === 'left' || eSide === 'right')) { // V-H
          const bend = { x: start.x, y: end.y };
          potentialPaths.push({ points: [start, bend, end], start, end, bendPoints: [bend], type: 'one_bend_vh', sSide, eSide, length: Math.abs(start.y - bend.y) + Math.abs(bend.x - end.x) });
        }
        if ((sSide === 'left' || sSide === 'right') && (eSide === 'top' || eSide === 'bottom')) { // H-V
          const bend = { x: end.x, y: start.y };
          potentialPaths.push({ points: [start, bend, end], start, end, bendPoints: [bend], type: 'one_bend_hv', sSide, eSide, length: Math.abs(start.x - bend.x) + Math.abs(bend.y - end.y) });
        }

        // 2-Bend Paths (Bentuk U) - Logika Baru yang Lebih Cerdas
        const escapeOffset = 30; // Jarak "keluar" dari shape sebelum berbelok
        if (sSide === eSide) { // Hanya buat jalur U jika keluar dan masuk dari sisi yang sama (misal: right -> right)
            if (sSide === 'top' || sSide === 'bottom') { // V-H-V
                const b1 = { x: start.x, y: sSide === 'top' ? Math.min(start.y, end.y) - escapeOffset : Math.max(start.y, end.y) + escapeOffset };
                const b2 = { x: end.x, y: b1.y };
                potentialPaths.push({ points: [start, b1, b2, end], start, end, bendPoints: [b1, b2], type: 'two_bend_vhv', sSide, eSide, length: Math.abs(start.y - b1.y) + Math.abs(b1.x - b2.x) + Math.abs(b2.y - end.y) });
            }
            if (sSide === 'left' || sSide === 'right') { // H-V-H
                const b1 = { x: sSide === 'left' ? Math.min(start.x, end.x) - escapeOffset : Math.max(start.x, end.x) + escapeOffset, y: start.y };
                const b2 = { x: b1.x, y: end.y };
                potentialPaths.push({ points: [start, b1, b2, end], start, end, bendPoints: [b1, b2], type: 'two_bend_hvh', sSide, eSide, length: Math.abs(start.x - b1.x) + Math.abs(b1.y - b2.y) + Math.abs(b2.x - end.x) });
            }
        }
      }
    }

    // 4. Beri skor pada setiap jalur untuk menemukan yang paling efisien
    potentialPaths.forEach(p => {
      let score = p.length; // Dasar skor adalah panjang jalur
      
      // Penalti untuk jumlah belokan (dikurangi untuk lebih fleksibel)
      if (p.type.startsWith('one_bend')) score += 10;
      if (p.type.startsWith('two_bend')) score += 30;

      // Penalti untuk arah yang tidak wajar
      if ((p.sSide === 'right' && deltaX < -10) || (p.sSide === 'left' && deltaX > 10)) score += 150;
      if ((p.sSide === 'bottom' && deltaY < -10) || (p.sSide === 'top' && deltaY > 10)) score += 150;

      // Penalti untuk mendarat di sisi yang tidak logis
      if (p.eSide === 'right' && deltaX > 10) score += 100;
      if (p.eSide === 'left' && deltaX < -10) score += 100;
      if (p.eSide === 'bottom' && deltaY > 10) score += 100;
      if (p.eSide === 'top' && deltaY < -10) score += 100;

      // BARU: Penalti tambahan berdasarkan posisi kolom
      // Jika target ada di kolom paling kiri, jangan mendarat di kiri
      if (props.connection.isTargetFirstColumn && p.eSide === 'left') {
        score += 500;
      }
      // Jika target ada di kolom paling kanan, jangan mendarat di kanan
      if (props.connection.isTargetLastColumn && p.eSide === 'right') {
        score += 500;
      }
      // Jika target adalah langkah pertama (pojok kiri atas), beri penalti SANGAT TINGGI
      // untuk pendaratan di sisi atas atau kiri untuk mencegah panah "mundur" yang aneh.
      if (props.connection.isTargetFirstStep) {
        if (p.eSide === 'left') score += 1000;
        if (p.eSide === 'top') score += 1000;
      }

      // Penalti berlebih untuk sisi yang sudah digunakan
      const sourceUsed = props.usedSides[props.connection.from] || { in: {}, out: {} };
      const targetUsed = props.usedSides[props.connection.to] || { in: {}, out: {} };

      // Penalti SANGAT TINGGI jika ada panah berlawanan arah pada sisi yang sama
      if (sourceUsed.in && sourceUsed.in[p.sSide]) score += 800;
      if (targetUsed.out && targetUsed.out[p.eSide]) score += 800;

      // Penalti untuk sisi yang sudah dipakai dengan arah yang sama
      if (sourceUsed.out && sourceUsed.out[p.sSide]) score += 100; // Turunkan dari 400 ke 100
      if (targetUsed.in && targetUsed.in[p.eSide]) score += 100;   // Turunkan dari 400 ke 100

      // Bonus untuk sisi yang masih kosong (tetap tinggi)
      if (!sourceUsed.in?.[p.sSide] && !sourceUsed.out?.[p.sSide]) score -= 150;
      if (!targetUsed.in?.[p.eSide] && !targetUsed.out?.[p.eSide]) score -= 150;
      
      // BARU: Bonus BESAR untuk menggunakan sisi yang sama dengan koneksi sejenis
      // yang arahnya sama (masuk ke target atau keluar dari source)
      if (props.connection.fromDirection === 'out' && targetUsed.in && targetUsed.in[p.eSide]) {
        // Jika ada panah lain yang masuk ke sisi yang sama pada target
        score -= 500; // Bonus sangat besar
      }
      
      if (props.connection.fromDirection === 'in' && sourceUsed.out && sourceUsed.out[p.sSide]) {
        // Jika ada panah lain yang keluar dari sisi yang sama pada source
        score -= 500; // Bonus sangat besar
      }
      
      p.score = score;
    });

    // Hapus duplikat dan urutkan berdasarkan skor (terendah lebih baik)
    const uniquePaths = Array.from(new Map(potentialPaths.map(p => [JSON.stringify(p.points), p])).values());
    uniquePaths.sort((a, b) => a.score - b.score);
    // console.info('Potential paths:', uniquePaths);

    // 5. Cari jalur valid pertama (tidak menabrak) dari daftar kandidat
    let bestPath = null;
    for (const path of uniquePaths) {
      if (!isPathColliding(path.points, obstacleRects)) {
        bestPath = path;
        break;
      }
    }

    // 6. Jika tidak ada jalur yang bebas, gunakan jalur dengan skor terbaik sebagai fallback
    if (!bestPath && uniquePaths.length > 0) {
      bestPath = uniquePaths[0];
    }

    // 7. Atur data path final dari jalur terbaik yang ditemukan
    if (bestPath) {
      // Tambahkan offset untuk titik koneksi pada shape tertentu
      const typesNeedOffset = ['flowchart-terminator', 'flowchart-process', 'bpmn-task'];
      const sourceType = props.connection.sourceType;
      const targetType = props.connection.targetType;
      
      // Dapatkan total koneksi untuk sisi shape yang sama dan indeks koneksi ini
      // Buat deep copy dari titik awal dan akhir untuk menghindari modifikasi objek asli
      let finalStart = { x: bestPath.start.x, y: bestPath.start.y };
      let finalEnd = { x: bestPath.end.x, y: bestPath.end.y };

      // Di bagian akhir algorithm calculation, setelah finalStart dan finalEnd dihitung
      algorithmConfig.value = {
        connectionId: props.connection.id,
        sSide: bestPath.sSide,
        eSide: bestPath.eSide,
        startPoint: finalStart,
        endPoint: finalEnd,
        bendPoints: bestPath.bendPoints || []
      };

      // PERBAIKAN: Tambahkan informasi label dalam emit
      const emitConfig = {
        connectionId: props.connection.id,
        sSide: bestPath.sSide,
        eSide: bestPath.eSide,
        startPoint: finalStart,
        endPoint: finalEnd,
        bendPoints: bestPath.bendPoints || []
      };

      // BARU: Simpan posisi label jika ada
      if (props.connection.label && labelPosition.value) {
        emitConfig.label = props.connection.label;
        emitConfig.labelPosition = labelPosition.value;
      }

      emit('path-updated', emitConfig);
      
      // Offset untuk titik awal (shape sumber)
      if (typesNeedOffset.includes(sourceType)) {
        const sourceShape = props.usedSides[props.connection.from] || { in: {}, out: {} };
        const connections = sourceShape.out && sourceShape.out[bestPath.sSide] ? sourceShape.out[bestPath.sSide] : [];
        const connCount = connections.length;
        
        if (connCount > 1) {
          // Hitung posisi relatif koneksi ini 
          const connIndex = connections.indexOf(props.connection.id);
          if (connIndex !== -1) { // Pastikan koneksi ini ada dalam daftar
            // Hitung offset yang lebih konsisten berdasarkan lebar/tinggi sisi
            let offsetRatio = 0;
            
            if (connCount === 2) {
              // Untuk 2 koneksi, bagi jadi -0.25 dan 0.25
              offsetRatio = connIndex === 0 ? -0.25 : 0.25;
            } else if (connCount > 2) {
              // Untuk 3+ koneksi, distribusikan merata
              offsetRatio = (connIndex / (connCount - 1) - 0.5) * 0.8;
            }
            
            // Aplikasikan offset berdasarkan sisi
            if (bestPath.sSide === 'top' || bestPath.sSide === 'bottom') {
              finalStart.x += fromPos.width * offsetRatio;
            } else {
              finalStart.y += fromPos.height * offsetRatio;
            }
          }
        }
      }
      
      // Offset untuk titik akhir (shape target)
      if (typesNeedOffset.includes(targetType)) {
        const targetShape = props.usedSides[props.connection.to] || { in: {}, out: {} };
        const connections = targetShape.in && targetShape.in[bestPath.eSide] ? targetShape.in[bestPath.eSide] : [];
        const connCount = connections.length;
        
        if (connCount > 1) {
          const connIndex = connections.indexOf(props.connection.id);
          if (connIndex !== -1) { // Pastikan koneksi ini ada dalam daftar
            let offsetRatio = 0;
            
            if (connCount === 2) {
              // Untuk 2 koneksi, bagi jadi -0.25 dan 0.25
              offsetRatio = connIndex === 0 ? -0.25 : 0.25;
            } else if (connCount > 2) {
              // Untuk 3+ koneksi, distribusikan merata
              offsetRatio = (connIndex / (connCount - 1) - 0.5) * 0.8;
            }
            
            if (bestPath.eSide === 'top' || bestPath.eSide === 'bottom') {
              finalEnd.x += toPos.width * offsetRatio;
            } else {
              finalEnd.y += toPos.height * offsetRatio;
            }
          }
        }
      }

      bendPoints = bestPath.bendPoints || [];

      // PERBAIKAN: Set localPoints untuk mode edit dari hasil algoritma
      localPoints.value = [
        { x: finalStart.x, y: finalStart.y, type: 'start' },
        ...bendPoints.map(p => ({ x: p.x, y: p.y, type: 'bend' })),
        { x: finalEnd.x, y: finalEnd.y, type: 'end' }
      ];

      // Pastikan semua nilai valid sebelum membuat path
      if (!isNaN(finalStart.x) && !isNaN(finalStart.y) && !isNaN(finalEnd.x) && !isNaN(finalEnd.y)) {
        // Recalculate path dengan titik koneksi yang sudah di-offset
        calculatedPath = `M ${finalStart.x} ${finalStart.y}`;
        
        if (bendPoints.length > 0) {
          for (const bendPoint of bendPoints) {
            if (!isNaN(bendPoint.x) && !isNaN(bendPoint.y)) {
              calculatedPath += ` L ${bendPoint.x} ${bendPoint.y}`;
            }
          }
        }
        
        calculatedPath += ` L ${finalEnd.x} ${finalEnd.y}`;
      } else {
        console.error('Invalid path coordinates detected:', {
          start: finalStart,
          end: finalEnd,
          connection: props.connection
        });
        // Fallback ke path tanpa offset jika ada nilai NaN
        calculatedPath = `M ${bestPath.start.x} ${bestPath.start.y}`;
        if (bendPoints.length > 0) {
          for (const bendPoint of bendPoints) {
            calculatedPath += ` L ${bendPoint.x} ${bendPoint.y}`;
          }
        }
        calculatedPath += ` L ${bestPath.end.x} ${bestPath.end.y}`;
      }
    }

    // Tempatkan label di sepertiga jarak dari garis lurus pertama, dengan sedikit offset dari garis
    if (props.connection.label) {
      const labelDistance = 30; // Jarak label dari shape asal dalam piksel
      let lx = 0, ly = 0;
      let start = null, end = null;

      // Gunakan bestPath points jika finalStart/finalEnd undefined
      if (bestPath) {
        // Pastikan start dan end tidak null dengan pengecekan yang tepat
        start = (finalStart && !isNaN(finalStart.x) && !isNaN(finalStart.y))
          ? finalStart
          : bestPath.start;
        
        const firstBendPoint = (bendPoints && bendPoints.length > 0)
          ? bendPoints[0] 
          : null;
        
        end = (firstBendPoint && !isNaN(firstBendPoint.x) && !isNaN(firstBendPoint.y))
          ? firstBendPoint
          : ((finalEnd && !isNaN(finalEnd.x) && !isNaN(finalEnd.y))
              ? finalEnd
              : bestPath.end);

        // Fungsi untuk menghitung titik offset dari garis (start ke end) sejauh labelDistance piksel
        function getFixedDistancePoint(startPoint, endPoint, distance, offset = 19) {
          if (!startPoint || !endPoint || 
              isNaN(startPoint.x) || isNaN(startPoint.y) || 
              isNaN(endPoint.x) || isNaN(endPoint.y)) {
            return null;
          }
          
          const dx = endPoint.x - startPoint.x;
          const dy = endPoint.y - startPoint.y;
          const length = Math.sqrt(dx * dx + dy * dy);
          if (length === 0) return { x: startPoint.x, y: startPoint.y };

          // Ambil titik sejauh 'distance' piksel dari start ke end
          const px = startPoint.x + (dx / length) * distance;
          const py = startPoint.y + (dy / length) * distance;

          // Offset label agar tidak menumpuk garis
          if (Math.abs(dx) > Math.abs(dy)) {
            // Garis horizontal, offset vertikal
            return { x: px, y: py - offset };
          } else {
            // Garis vertikal, offset horizontal
            return { x: px + offset, y: py };
          }
        }

        if (start && end) {
          const p = getFixedDistancePoint(start, end, labelDistance, 19);
          if (p) {
            lx = p.x;
            ly = p.y;
            labelPosition.value = { x: lx, y: ly };
          } else {
            labelPosition.value = null;
          }
        } else {
          labelPosition.value = null;
        }
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

// BARU: Fungsi untuk handle drag
const startDrag = (event, pointIndex, pointType) => {
  if (!props.editMode) return;
  
  event.preventDefault();
  event.stopPropagation();
  
  isDragging.value = true;
  dragTarget.value = pointType;
  dragIndex.value = pointIndex;
  
  document.addEventListener('mousemove', handleDrag);
  document.addEventListener('mouseup', stopDrag);
};

const handleDrag = (event) => {
  if (!isDragging.value || dragIndex.value === -1) return;
  
  const container = document.querySelector(`#${props.idcontainer}`);
  if (!container) return;
  
  const containerRect = container.getBoundingClientRect();
  const newX = event.clientX - containerRect.left;
  const newY = event.clientY - containerRect.top;
  
  // BARU: Update koordinat untuk tooltip
  dragCoordinates.value = { x: Math.round(newX), y: Math.round(newY) };
  showCoordinates.value = true;
  
  // Update local points
  localPoints.value[dragIndex.value] = {
    ...localPoints.value[dragIndex.value],
    x: newX,
    y: newY
  };
  
  // Update path
  updatePathFromLocalPoints();
};

const stopDrag = () => {
  if (!isDragging.value) return;
  
  isDragging.value = false;
  dragTarget.value = null;
  dragIndex.value = -1;
  
  // BARU: Sembunyikan koordinat
  showCoordinates.value = false;
  
  document.removeEventListener('mousemove', handleDrag);
  document.removeEventListener('mouseup', stopDrag);
  
  // Emit perubahan manual
  emitManualEdit();
};

const updatePathFromLocalPoints = () => {
  if (localPoints.value.length < 2) return;
  
  let d = `M ${localPoints.value[0].x} ${localPoints.value[0].y}`;
  for (let i = 1; i < localPoints.value.length; i++) {
    d += ` L ${localPoints.value[i].x} ${localPoints.value[i].y}`;
  }
  pathData.value = d;
};

// PERBAIKAN: Fungsi helper untuk menghitung posisi label yang konsisten
const getFixedDistancePoint = (startPoint, endPoint, distance, offset = 19) => {
  if (!startPoint || !endPoint || 
      isNaN(startPoint.x) || isNaN(startPoint.y) || 
      isNaN(endPoint.x) || isNaN(endPoint.y)) {
    return null;
  }
  
  const dx = endPoint.x - startPoint.x;
  const dy = endPoint.y - startPoint.y;
  const length = Math.sqrt(dx * dx + dy * dy);
  if (length === 0) return { x: startPoint.x, y: startPoint.y };

  // Ambil titik sejauh 'distance' piksel dari start ke end
  const px = startPoint.x + (dx / length) * distance;
  const py = startPoint.y + (dy / length) * distance;

  // Offset label agar tidak menumpuk garis
  if (Math.abs(dx) > Math.abs(dy)) {
    // Garis horizontal, offset vertikal
    return { x: px, y: py - offset };
  } else {
    // Garis vertikal, offset horizontal
    return { x: px + offset, y: py };
  }
};

const emitManualEdit = () => {
  if (localPoints.value.length < 2) return;
  
  const startPoint = localPoints.value[0];
  const endPoint = localPoints.value[localPoints.value.length - 1];
  const bendPoints = localPoints.value.slice(1, -1);
  
  // PERBAIKAN: Simpan informasi label dalam konfigurasi manual
  const config = {
    connectionId: props.connection.id,
    startPoint: { x: startPoint.x, y: startPoint.y },
    endPoint: { x: endPoint.x, y: endPoint.y },
    bendPoints: bendPoints.map(p => ({ x: p.x, y: p.y })),
    sSide: props.manualConfig?.sSide || algorithmConfig.value?.sSide || 'right',
    eSide: props.manualConfig?.eSide || algorithmConfig.value?.eSide || 'left'
  };
  
  // BARU: Tambahkan informasi label jika ada
  if (props.connection.label) {
    config.label = props.connection.label;
    
    // Hitung dan simpan posisi label
    const labelDistance = 30;
    const start = startPoint;
    const end = bendPoints.length > 0 ? bendPoints[0] : endPoint;
    
    const labelPos = getFixedDistancePoint(start, end, labelDistance, 19);
    if (labelPos) {
      config.labelPosition = labelPos;
    }
  }
  
  emit('manual-edit', config);
};

// Fungsi untuk menambah titik belok dengan posisi yang tepat
const addBendPoint = (event) => {
  if (!props.editMode) return;
  
  event.preventDefault();
  event.stopPropagation();
  
  const container = document.querySelector(`#${props.idcontainer}`);
  if (!container) return;
  
  const containerRect = container.getBoundingClientRect();
  const clickX = event.clientX - containerRect.left;
  const clickY = event.clientY - containerRect.top;
  
  if (localPoints.value.length < 2) return;
  
  // Cari segmen path terdekat dengan klik
  let insertIndex = localPoints.value.length - 1; // Default: sebelum titik akhir
  let minDistance = Infinity;
  
  for (let i = 0; i < localPoints.value.length - 1; i++) {
    const p1 = localPoints.value[i];
    const p2 = localPoints.value[i + 1];
    
    // Hitung jarak dari titik klik ke garis segment
    const distance = getDistanceToLineSegment(clickX, clickY, p1.x, p1.y, p2.x, p2.y);
    
    if (distance < minDistance) {
      minDistance = distance;
      insertIndex = i + 1; // Insert setelah titik i
    }
  }
  
  // Tambah titik belok di posisi yang tepat dalam array
  const newPoint = { x: clickX, y: clickY, type: 'bend' };
  localPoints.value.splice(insertIndex, 0, newPoint);
  
  updatePathFromLocalPoints();
  emitManualEdit();
};

// Fungsi helper untuk menghitung jarak titik ke garis
const getDistanceToLineSegment = (px, py, x1, y1, x2, y2) => {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const length = Math.sqrt(dx * dx + dy * dy);
  
  if (length === 0) {
    // Jika titik1 dan titik2 sama, hitung jarak ke titik
    return Math.sqrt((px - x1) * (px - x1) + (py - y1) * (py - y1));
  }
  
  // Proyeksi titik klik ke garis
  const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / (length * length)));
  const projectionX = x1 + t * dx;
  const projectionY = y1 + t * dy;
  
  // Hitung jarak dari titik klik ke proyeksi
  return Math.sqrt((px - projectionX) * (px - projectionX) + (py - projectionY) * (py - projectionY));
};

// Force recalculation saat tidak ada manual config
watch(() => props.manualConfig, (newConfig, oldConfig) => {
  // console.log(`[ArrowConnector] ID ${props.connection.id}: Manual config changed from:`, oldConfig, 'to:', newConfig);
  if (!newConfig || Object.keys(newConfig).length === 0) {
    console.log(`[ArrowConnector] ID ${props.connection.id}: No manual config, will use algorithm`);
    calculatePath();
  }
}, { deep: true });

// PERBAIKAN: Watch untuk editMode dan manualConfig
watch(() => [props.editMode, props.manualConfig], ([newEditMode, newManualConfig]) => {
  if (newEditMode) {
    if (newManualConfig && newManualConfig.startPoint && newManualConfig.endPoint) {
      // Gunakan konfigurasi manual jika ada
      const { startPoint, endPoint, bendPoints = [] } = newManualConfig;
      localPoints.value = [
        { ...startPoint, type: 'start' },
        ...bendPoints.map(p => ({ ...p, type: 'bend' })),
        { ...endPoint, type: 'end' }
      ];
    } else if (algorithmConfig.value) {
      // Fallback ke konfigurasi algoritma jika tidak ada konfigurasi manual
      const { startPoint, endPoint, bendPoints = [] } = algorithmConfig.value;
      localPoints.value = [
        { ...startPoint, type: 'start' },
        ...bendPoints.map(p => ({ ...p, type: 'bend' })),
        { ...endPoint, type: 'end' }
      ];
    }
  }
}, { immediate: true });
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
    <path 
      :d="pathData" 
      fill="none" 
      stroke="black" 
      stroke-width="2" 
      :marker-end="`url(#arrowhead-${idarrow})`"
      :class="{ 'cursor-pointer': editMode }"
      @dblclick="addBendPoint"
    />

    <!-- Titik kontrol untuk mode edit -->
    <template v-if="editMode && localPoints.length > 0">
      <circle
        v-for="(point, index) in localPoints"
        :key="`control-${index}`"
        :cx="point.x"
        :cy="point.y"
        :r="point.type === 'bend' ? 6 : 8"
        :fill="point.type === 'start' ? '#22c55e' : point.type === 'end' ? '#ef4444' : '#3b82f6'"
        :stroke="point.type === 'bend' ? '#1e40af' : '#ffffff'"
        stroke-width="2"
        class="cursor-move hover:opacity-80 print:hidden"
        style="pointer-events: all;"
        @mousedown="startDrag($event, index, point.type)"
      />
      
      <!-- Tombol hapus titik belok -->
      <g v-for="(point, index) in localPoints" :key="`delete-${index}`" class="print:hidden">
        <circle
          v-if="point.type === 'bend'"
          :cx="point.x + 10"
          :cy="point.y - 10"
          r="8"
          fill="#ef4444"
          stroke="#ffffff"
          stroke-width="1"
          class="cursor-pointer hover:opacity-80"
          style="pointer-events: all;"
          @click="localPoints.splice(index, 1); updatePathFromLocalPoints(); emitManualEdit();"
        />
        <text
          v-if="point.type === 'bend'"
          :x="point.x + 10"
          :y="point.y - 6"
          text-anchor="middle"
          fill="white"
          font-size="10"
          class="pointer-events-none"
        >×</text>
      </g>
    </template>

    <!-- Tooltip koordinat saat drag -->
    <g v-if="showCoordinates && isDragging" class="print:hidden">
      <rect
        :x="dragCoordinates.x + 15"
        :y="dragCoordinates.y - 25"
        width="80"
        height="20"
        fill="rgba(0, 0, 0, 0.8)"
        rx="4"
        ry="4"
      />
      <text
        :x="dragCoordinates.x + 55"
        :y="dragCoordinates.y - 10"
        text-anchor="middle"
        fill="white"
        font-size="12"
        font-family="monospace"
        class="pointer-events-none"
      >
        {{ `${dragCoordinates.x}, ${dragCoordinates.y}` }}
      </text>
    </g>

    <!-- PERBAIKAN: Label dengan fallback ke konfigurasi manual -->
    <text v-if="props.connection.label" 
          :x="(props.manualConfig?.labelPosition?.x) || labelPosition?.x" 
          :y="(props.manualConfig?.labelPosition?.y) || labelPosition?.y"
          class="text-sm font-medium fill-black print:hidden" 
          text-anchor="middle" 
          alignment-baseline="middle">
      {{ props.connection.label }}
    </text>
  </g>
</template>
