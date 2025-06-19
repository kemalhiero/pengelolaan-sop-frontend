<script setup>
import { onMounted, ref, nextTick, watch } from 'vue';
import PF from 'pathfinding';

const props = defineProps({
  connection: { type: Object, required: true },
  idarrow: { type: [String, Number], required: true },
  idcontainer: { type: String, required: true },
  redrawKey: { type: [String, Number], default: 0 },
  gridData: { type: Object, required: true },
  // Props baru dari SopStepTemplate
  fromType: { type: String, default: 'rect' },
  toType: { type: String, default: 'rect' },
  fromSideProp: { type: String, default: null },
  toSideProp: { type: String, default: null },
  fromIdx: { type: Number, default: 0 },
  fromTotal: { type: Number, default: 1 },
  toIdx: { type: Number, default: 0 },
  toTotal: { type: Number, default: 1 },
});

const pathData = ref('');
const labelPosition = ref(null);

// Konversi pixel ke grid cell
const toGrid = (x, y) => [
  Math.floor(x / props.gridData.cellSize),
  Math.floor(y / props.gridData.cellSize)
];
// Konversi grid cell ke pixel tengah cell
const toPixel = (gx, gy) => [
  gx * props.gridData.cellSize + props.gridData.cellSize / 2,
  gy * props.gridData.cellSize + props.gridData.cellSize / 2
];

function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

function getClosestSide(fromRect, toRect, containerRect) {
  const fromSides = [
    { x: fromRect.left - containerRect.left + fromRect.width / 2, y: fromRect.top - containerRect.top, side: 'top' },
    { x: fromRect.left - containerRect.left + fromRect.width / 2, y: fromRect.bottom - containerRect.top, side: 'bottom' },
    { x: fromRect.left - containerRect.left, y: fromRect.top - containerRect.top + fromRect.height / 2, side: 'left' },
    { x: fromRect.right - containerRect.left, y: fromRect.top - containerRect.top + fromRect.height / 2, side: 'right' }
  ];
  const toSides = [
    { x: toRect.left - containerRect.left + toRect.width / 2, y: toRect.top - containerRect.top, side: 'top' },
    { x: toRect.left - containerRect.left + toRect.width / 2, y: toRect.bottom - containerRect.top, side: 'bottom' },
    { x: toRect.left - containerRect.left, y: toRect.top - containerRect.top + toRect.height / 2, side: 'left' },
    { x: toRect.right - containerRect.left, y: toRect.top - containerRect.top + toRect.height / 2, side: 'right' }
  ];
  let minDist = Infinity, best = {};
  for (const fs of fromSides) {
    for (const ts of toSides) {
      const dist = Math.abs(fs.x - ts.x) + Math.abs(fs.y - ts.y);
      if (dist < minDist) {
        minDist = dist;
        best = { from: fs, to: ts };
      }
    }
  }
  return best;
}

function simplifyPath(path) {
  if (path.length < 3) return path;
  const result = [path[0]];
  let [dx, dy] = [path[1][0] - path[0][0], path[1][1] - path[0][1]];
  for (let i = 2; i < path.length; i++) {
    const [ndx, ndy] = [path[i][0] - path[i-1][0], path[i][1] - path[i-1][1]];
    if (ndx !== dx || ndy !== dy) {
      result.push(path[i-1]);
      [dx, dy] = [ndx, ndy];
    }
  }
  result.push(path[path.length-1]);
  return result;
}

// Cek apakah segmen garis (x1,y1)-(x2,y2) melewati obstacle di grid
function isSegmentClear(grid, x1, y1, x2, y2) {
  if (x1 < 0 || x1 >= grid.width || y1 < 0 || y1 >= grid.height ||
      x2 < 0 || x2 >= grid.width || y2 < 0 || y2 >= grid.height) {
    return false;
  }
  if (x1 === x2) { // Vertikal
    const [sy, ey] = [Math.min(y1, y2), Math.max(y1, y2)];
    for (let y = sy; y <= ey; y++) {
      if (!grid.isWalkableAt(x1, y)) return false;
    }
  } else if (y1 === y2) { // Horizontal
    const [sx, ex] = [Math.min(x1, x2), Math.max(x1, x2)];
    for (let x = sx; x <= ex; x++) {
      if (!grid.isWalkableAt(x, y1)) return false;
    }
  } else {
    return false; // hanya orthogonal
  }
  return true;
}

// Cari jalur orthogonal dengan tikungan minimal (0, 1, atau 2)
function findOptimalOrthogonalPath(grid, sx, sy, ex, ey) {
  // Cek 0 tikungan (garis lurus)
  if ((sx === ex || sy === ey) && isSegmentClear(grid, sx, sy, ex, ey)) {
    return { path: [[sx, sy], [ex, ey]], bends: 0 };
  }

  // Cek 1 tikungan (L-shape)
  const l_candidates = [
    [[sx, sy], [sx, ey], [ex, ey]],
    [[sx, sy], [ex, sy], [ex, ey]]
  ];
  for (const path of l_candidates) {
    if (isSegmentClear(grid, path[0][0], path[0][1], path[1][0], path[1][1]) &&
        isSegmentClear(grid, path[1][0], path[1][1], path[2][0], path[2][1])) {
      return { path, bends: 1 };
    }
  }

  // Cek 2 tikungan (Z-shape) - Horizontal-Vertical-Horizontal
  for (let my = Math.min(sy, ey); my <= Math.max(sy, ey); my++) {
    const path = [[sx, sy], [sx, my], [ex, my], [ex, ey]];
    if (isSegmentClear(grid, path[0][0], path[0][1], path[1][0], path[1][1]) &&
        isSegmentClear(grid, path[1][0], path[1][1], path[2][0], path[2][1]) &&
        isSegmentClear(grid, path[2][0], path[2][1], path[3][0], path[3][1])) {
      return { path, bends: 2 };
    }
  }
  // Cek 2 tikungan (Z-shape) - Vertical-Horizontal-Vertical
  for (let mx = Math.min(sx, ex); mx <= Math.max(sx, ex); mx++) {
    const path = [[sx, sy], [mx, sy], [mx, ey], [ex, ey]];
    if (isSegmentClear(grid, path[0][0], path[0][1], path[1][0], path[1][1]) &&
        isSegmentClear(grid, path[1][0], path[1][1], path[2][0], path[2][1]) &&
        isSegmentClear(grid, path[2][0], path[2][1], path[3][0], path[3][1])) {
      return { path, bends: 2 };
    }
  }

  return null;
}

// Fungsi untuk menentukan titik di sisi shape (dengan distribusi jika banyak panah)
function getSidePoint(rect, side, idx, total, shapeType = 'rect') {
  // Untuk decision, gunakan sedikit offset agar tepat di ujung belah ketupat
  if (shapeType === 'decision') {
    if (side === 'top')    return { x: rect.left + rect.width / 2, y: rect.top };
    if (side === 'bottom') return { x: rect.left + rect.width / 2, y: rect.bottom };
    if (side === 'left')   return { x: rect.left, y: rect.top + rect.height / 2 };
    if (side === 'right')  return { x: rect.right, y: rect.top + rect.height / 2 };
  }
  // Untuk shape lain, distribusi di sisi
  if (side === 'top') {
    const x = rect.left + rect.width * (idx + 1) / (total + 1);
    return { x, y: rect.top };
  }
  if (side === 'bottom') {
    const x = rect.left + rect.width * (idx + 1) / (total + 1);
    return { x, y: rect.bottom };
  }
  if (side === 'left') {
    const y = rect.top + rect.height * (idx + 1) / (total + 1);
    return { x: rect.left, y };
  }
  if (side === 'right') {
    const y = rect.top + rect.height * (idx + 1) / (total + 1);
    return { x: rect.right, y };
  }
  return { x: rect.left, y: rect.top };
}

// Fungsi untuk menambah titik ekstra agar panah keluar/masuk tegak lurus sisi shape
function addOrthogonalExitEntry(point, side, offset = 20) {
  if (side === 'top')    return { x: point.x, y: point.y - offset };
  if (side === 'bottom') return { x: point.x, y: point.y + offset };
  if (side === 'left')   return { x: point.x - offset, y: point.y };
  if (side === 'right')  return { x: point.x + offset, y: point.y };
  return point;
}

// Fungsi untuk memilih sisi pada decision (prioritas: atas, kanan, bawah, kiri)
function getDecisionSide(usedSides, isOutgoing) {
  // Prioritas: atas, kanan, bawah, kiri
  const allSides = ['top', 'right', 'bottom', 'left'];
  for (const side of allSides) {
    if (!usedSides[side]) return side;
  }
  // Jika semua sudah dipakai, cari sisi yang sudah dipakai oleh panah sejenis (keluar/masuk)
  for (const side of allSides) {
    if (usedSides[side] && usedSides[side].type === (isOutgoing ? 'out' : 'in')) return side;
  }
  // Fallback
  return 'bottom';
}

const calculatePath = async () => {
  await nextTick();

  requestAnimationFrame(() => {
    const fromEl = document.getElementById(props.connection.from);
    const toEl = document.getElementById(props.connection.to);
    const container = document.getElementById(props.idcontainer);

    if (!fromEl || !toEl || !container) {
      pathData.value = '';
      return;
    }

    const fromRect = fromEl.getBoundingClientRect();
    const toRect = toEl.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();

    const grid = new PF.Grid(props.gridData.width, props.gridData.height);
    props.gridData.obstacles.forEach(([gx, gy]) => {
      grid.setWalkableAt(gx, gy, false);
    });

    const fromSides = props.fromSideProp ? [props.fromSideProp] : ['right', 'left', 'bottom', 'top'];
    const toSides = props.toSideProp ? [props.toSideProp] : ['top', 'bottom', 'left', 'right'];

    let bestPath = null;
    let minBends = Infinity;
    let bestPathLength = Infinity;
    let bestFromSide = null;
    let bestToSide = null;

    for (const fromSide of fromSides) {
      for (const toSide of toSides) {
        const fromPoint = getSidePoint(fromRect, fromSide, props.fromIdx, props.fromTotal, props.fromType);
        const toPoint = getSidePoint(toRect, toSide, props.toIdx, props.toTotal, props.toType);

        const fromExit = addOrthogonalExitEntry(fromPoint, fromSide, props.gridData.cellSize);
        const toEntry = addOrthogonalExitEntry(toPoint, toSide, props.gridData.cellSize);

        const [startGX, startGY] = toGrid(fromExit.x - containerRect.left, fromExit.y - containerRect.top);
        const [endGX, endGY] = toGrid(toEntry.x - containerRect.left, toEntry.y - containerRect.top);
        
        const sx = clamp(startGX, 0, props.gridData.width - 1);
        const sy = clamp(startGY, 0, props.gridData.height - 1);
        const ex = clamp(endGX, 0, props.gridData.width - 1);
        const ey = clamp(endGY, 0, props.gridData.height - 1);

        const pathGrid = grid.clone();
        pathGrid.setWalkableAt(sx, sy, true);
        pathGrid.setWalkableAt(ex, ey, true);

        const result = findOptimalOrthogonalPath(pathGrid, sx, sy, ex, ey);
        
        if (result) {
          const pathLength = PF.Util.pathLength(result.path);
          if (result.bends < minBends || (result.bends === minBends && pathLength < bestPathLength)) {
            minBends = result.bends;
            bestPathLength = pathLength;
            
            const [fromGridX, fromGridY] = toGrid(fromPoint.x - containerRect.left, fromPoint.y - containerRect.top);
            const [toGridX, toGridY] = toGrid(toPoint.x - containerRect.left, toPoint.y - containerRect.top);
            
            const finalPath = [...result.path];
            finalPath.unshift([fromGridX, fromGridY]);
            finalPath.push([toGridX, toGridY]);
            bestPath = finalPath;
            bestFromSide = fromSide;
            bestToSide = toSide;
          }
        }
      }
    }

    // Fallback ke A* jika tidak ada jalur sederhana yang ditemukan
    if (!bestPath) {
      const { from, to } = getClosestSide(fromRect, toRect, containerRect);
      bestFromSide = from.side;
      bestToSide = to.side;
      const fromPoint = getSidePoint(fromRect, bestFromSide, props.fromIdx, props.fromTotal, props.fromType);
      const toPoint = getSidePoint(toRect, bestToSide, props.toIdx, props.toTotal, props.toType);
      const fromExit = addOrthogonalExitEntry(fromPoint, bestFromSide, props.gridData.cellSize);
      const toEntry = addOrthogonalExitEntry(toPoint, bestToSide, props.gridData.cellSize);
      
      const [startGX, startGY] = toGrid(fromExit.x - containerRect.left, fromExit.y - containerRect.top);
      const [endGX, endGY] = toGrid(toEntry.x - containerRect.left, toEntry.y - containerRect.top);

      const sx = clamp(startGX, 0, props.gridData.width - 1);
      const sy = clamp(startGY, 0, props.gridData.height - 1);
      const ex = clamp(endGX, 0, props.gridData.width - 1);
      const ey = clamp(endGY, 0, props.gridData.height - 1);

      const pathGrid = grid.clone();
      pathGrid.setWalkableAt(sx, sy, true);
      pathGrid.setWalkableAt(ex, ey, true);

      const finder = new PF.AStarFinder({ heuristic: PF.Heuristic.manhattan, diagonalMovement: PF.DiagonalMovement.Never });
      let aStarPath = finder.findPath(sx, sy, ex, ey, pathGrid);
      
      if (aStarPath && aStarPath.length > 0) {
        const [fromGridX, fromGridY] = toGrid(fromPoint.x - containerRect.left, fromPoint.y - containerRect.top);
        const [toGridX, toGridY] = toGrid(toPoint.x - containerRect.left, toPoint.y - containerRect.top);
        aStarPath.unshift([fromGridX, fromGridY]);
        aStarPath.push([toGridX, toGridY]);
        bestPath = aStarPath;
      }
    }

    if (bestPath) {
      const simplified = simplifyPath(bestPath);
      const pixelPath = simplified.map(([gx, gy]) => toPixel(gx, gy));
      let d = '';
      pixelPath.forEach(([x, y], i) => {
        d += (i === 0 ? 'M' : 'L') + ` ${x} ${y} `;
      });
      pathData.value = d;

      // Penempatan label
      const fromPoint = getSidePoint(fromRect, bestFromSide, props.fromIdx, props.fromTotal, props.fromType);
      if (props.fromType === 'decision' && props.connection.label) {
        let labelOffset = 24;
        let lx = fromPoint.x - containerRect.left;
        let ly = fromPoint.y - containerRect.top;
        if (bestFromSide === 'top')    ly -= labelOffset;
        if (bestFromSide === 'bottom') ly += labelOffset;
        if (bestFromSide === 'left')   lx -= labelOffset;
        if (bestFromSide === 'right')  lx += labelOffset;
        labelPosition.value = { x: lx, y: ly };
      } else {
        // Default label placement
        let maxLen = 0, labelIdx = 0;
        for (let i = 0; i < pixelPath.length - 1; i++) {
          const [x1, y1] = pixelPath[i];
          const [x2, y2] = pixelPath[i + 1];
          const len = Math.abs(x2 - x1) + Math.abs(y2 - y1);
          if (len > maxLen) {
            maxLen = len;
            labelIdx = i;
          }
        }
        if (props.connection.label && pixelPath[labelIdx] && pixelPath[labelIdx + 1]) {
          const [x1, y1] = pixelPath[labelIdx];
          const [x2, y2] = pixelPath[labelIdx + 1];
          labelPosition.value = { x: (x1 + x2) / 2, y: (y1 + y2) / 2 - 15 };
        } else {
          labelPosition.value = null;
        }
      }
    } else {
      pathData.value = '';
    }
  });
};

onMounted(() => calculatePath());
watch(() => props.connection, calculatePath, { deep: true });
watch(() => props.redrawKey, calculatePath);
watch(() => props.gridData, calculatePath, { deep: true });
</script>

<template>
  <g v-if="pathData">
    <defs>
      <marker :id="`arrowhead-${idarrow}`" markerWidth="10" markerHeight="8" refX="7" refY="4" orient="auto">
        <path d="M0,0 L8,4 L0,8 L2,4 Z" fill="black" />
      </marker>
    </defs>
    <path :d="pathData" fill="none" stroke="black" stroke-width="2" :marker-end="`url(#arrowhead-${idarrow})`" />
    <text v-if="labelPosition && props.connection.label" :x="labelPosition.x" :y="labelPosition.y"
      class="text-sm font-medium fill-black" text-anchor="middle" alignment-baseline="middle">
      {{ props.connection.label }}
    </text>
  </g>
</template>
