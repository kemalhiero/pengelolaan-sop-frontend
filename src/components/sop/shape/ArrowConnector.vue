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
  },
  obstacles: {
    type: Array,
    default: () => []
  },
  usedSides: {
    type: Object,
    default: () => ({})
  }
});

const emit = defineEmits(['mounted', 'path-updated']);

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

    // --- LOGIKA BARU: Cek koneksi lurus yang optimal terlebih dahulu ---
    const dynamicTypes = ['process', 'terminator', 'connector'];
    const sourceType = props.connection.sourceType;
    const targetType = props.connection.targetType;

    if (sourceType && targetType && dynamicTypes.includes(sourceType) && dynamicTypes.includes(targetType)) {
        // Cek untuk kesejajaran vertikal
        const verticallyAligned = fromPos.left < toPos.right && fromPos.right > toPos.left;
        if (verticallyAligned && Math.abs(fromPos.top - toPos.bottom) > 0 && Math.abs(fromPos.bottom - toPos.top) > 0) {
            const overlapLeft = Math.max(fromPos.left, toPos.left);
            const overlapRight = Math.min(fromPos.right, toPos.right);
            const commonX = overlapLeft + (overlapRight - overlapLeft) / 2;
            
            let fromY, toY, sSide, eSide;
            if (toPos.top > fromPos.bottom) { // Target di bawah sumber
                fromY = fromPos.bottom; toY = toPos.top; sSide = 'bottom'; eSide = 'top';
            } else if (fromPos.top > toPos.bottom) { // Target di atas sumber
                fromY = fromPos.top; toY = toPos.bottom; sSide = 'top'; eSide = 'bottom';
            }
            
            if (fromY && toY) {
                const points = [{ x: commonX, y: fromY }, { x: commonX, y: toY }];
                if (!isPathColliding(points, obstacleRects)) {
                    potentialPaths.push({ points, start: points[0], end: points[1], bendPoints: [], type: 'straight_optimal_v', sSide, eSide, length: Math.abs(fromY - toY), score: 1 });
                }
            }
        }

        // Cek untuk kesejajaran horizontal
        const horizontallyAligned = fromPos.top < toPos.bottom && fromPos.bottom > toPos.top;
        if (horizontallyAligned && Math.abs(fromPos.left - toPos.right) > 0 && Math.abs(fromPos.right - toPos.left) > 0) {
            const overlapTop = Math.max(fromPos.top, toPos.top);
            const overlapBottom = Math.min(fromPos.bottom, toPos.bottom);
            const commonY = overlapTop + (overlapBottom - overlapTop) / 2;

            let fromX, toX, sSide, eSide;
            if (toPos.left > fromPos.right) { // Target di kanan sumber
                fromX = fromPos.right; toX = toPos.left; sSide = 'right'; eSide = 'left';
            } else if (fromPos.left > toPos.right) { // Target di kiri sumber
                fromX = fromPos.left; toX = toPos.right; sSide = 'left'; eSide = 'right';
            }

            if (fromX && toX) {
                const points = [{ x: fromX, y: commonY }, { x: toX, y: commonY }];
                if (!isPathColliding(points, obstacleRects)) {
                    potentialPaths.push({ points, start: points[0], end: points[1], bendPoints: [], type: 'straight_optimal_h', sSide, eSide, length: Math.abs(fromX - toX), score: 1 });
                }
            }
        }
    }
    // --- AKHIR DARI LOGIKA BARU ---

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
    const alignmentTolerance = 5;

    const startSides = ['bottom', 'right', 'left', 'top'];
    const endSides = ['top', 'left', 'bottom', 'right'];

    for (const sSide of startSides) {
      for (const eSide of endSides) {
        const start = fromPoints[sSide];
        const end = toPoints[eSide];

        // 0-Bend Paths (Lurus)
        if (Math.abs(start.x - end.x) < alignmentTolerance) { // Vertikal
          const alignedEnd = { x: start.x, y: end.y };
          potentialPaths.push({ points: [start, alignedEnd], start, end: alignedEnd, bendPoints: [], type: 'zero_bend_v', sSide, eSide, length: Math.abs(start.y - end.y) });
        }
        if (Math.abs(start.y - end.y) < alignmentTolerance) { // Horizontal
          const alignedEnd = { x: end.x, y: start.y };
          potentialPaths.push({ points: [start, alignedEnd], start, end: alignedEnd, bendPoints: [], type: 'zero_bend_h', sSide, eSide, length: Math.abs(start.x - end.x) });
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
        const escapeOffset = 40; // Jarak "keluar" dari shape sebelum berbelok
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

    // 4. Beri skor pada setiap jalur untuk menemukan yang paling efisien - LOGIKA SKOR DIPERBAIKI
    potentialPaths.forEach(p => {
      let score = p.length; // Dasar skor adalah panjang jalur
      
      // Penalti berdasarkan jumlah belokan
      if (p.type.startsWith('one_bend')) score += 20;
      if (p.type.startsWith('two_bend')) score += 50;

      // Penalti untuk arah keluar (sSide) yang tidak wajar
      if ((p.sSide === 'right' && deltaX < -10) || (p.sSide === 'left' && deltaX > 10)) score += 150;
      if ((p.sSide === 'bottom' && deltaY < -10) || (p.sSide === 'top' && deltaY > 10)) score += 150;

      // Penalti untuk arah mendarat (eSide) yang TIDAK LOGIS - LOGIKA DIPERBAIKI
      // Jika target di KANAN (deltaX > 0), mendarat di sisi KANAN itu aneh.
      if (p.eSide === 'right' && deltaX > 10) score += 100;
      // Jika target di KIRI (deltaX < 0), mendarat di sisi KIRI itu aneh.
      if (p.eSide === 'left' && deltaX < -10) score += 100;
      // Jika target di BAWAH (deltaY > 0), mendarat di sisi BAWAH itu aneh.
      if (p.eSide === 'bottom' && deltaY > 10) score += 100;
      // Jika target di ATAS (deltaY < 0), mendarat di sisi ATAS itu aneh.
      if (p.eSide === 'top' && deltaY < -10) score += 100;

      // Prioritas khusus untuk shape Decision berdasarkan sisi yang sudah digunakan
      const sourceIsDecision = props.connection.sourceType === 'decision';
      const targetIsDecision = props.connection.targetType === 'decision';

      if (sourceIsDecision) {
        const sourceUsed = props.usedSides[props.connection.from] || { in: {}, out: {} };
        // Penalti TINGGI jika sisi KELUAR (p.sSide) ini dipakai oleh panah MASUK
        if (p.sSide in sourceUsed.in) {
          score += 500; 
        }
        // Penalti SEDANG jika sisi KELUAR ini sudah dipakai panah KELUAR lain (mendorong cari sisi kosong dulu)
        if (p.sSide in sourceUsed.out) {
          score += 100;
        }
      }
      
      if (targetIsDecision) {
        const targetUsed = props.usedSides[props.connection.to] || { in: {}, out: {} };
        // Penalti TINGGI jika sisi MASUK (p.eSide) ini dipakai oleh panah KELUAR
        if (p.eSide in targetUsed.out) {
          score += 500;
        }
        // Penalti SEDANG jika sisi MASUK ini sudah dipakai panah MASUK lain
        if (p.eSide in targetUsed.in) {
          score += 100;
        }
      }

      // Jika bukan decision, atau jika decision tapi tidak ada aturan khusus, gunakan prioritas umum
      if (!sourceIsDecision) {
        // Prioritas umum: keluar dari bawah jika target di bawah, keluar dari kanan jika target di kanan
        if (p.sSide === 'bottom' && deltaY > 0) score -= 10;
        if (p.sSide === 'top' && deltaY < 0) score -= 10;
        if (p.sSide === 'right' && deltaX > 0) score -= 10;
        if (p.sSide === 'left' && deltaX < 0) score -= 10;
        // console.log(fromOffsets, toOffsets)
      }
      p.score = score;
    });

    // Hapus duplikat dan urutkan berdasarkan skor (terendah lebih baik)
    const uniquePaths = Array.from(new Map(potentialPaths.map(p => [JSON.stringify(p.points), p])).values());
    uniquePaths.sort((a, b) => a.score - b.score);

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
      emit('path-updated', {
        connectionId: props.connection.id,
        sSide: bestPath.sSide,
        eSide: bestPath.eSide
      });

      finalStart = bestPath.start;
      finalEnd = bestPath.end;
      bendPoints = bestPath.bendPoints || [];

      calculatedPath = `M ${bestPath.points[0].x} ${bestPath.points[0].y}`;
      for (let i = 1; i < bestPath.points.length; i++) {
        calculatedPath += ` L ${bestPath.points[i].x} ${bestPath.points[i].y}`;
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
