<script setup>
import { onMounted, ref, computed, watch, nextTick } from 'vue';
import { capitalizeWords } from '@/utils/text';

import ArrowConnector from '@/components/sop/shape/ArrowConnector.vue';
import BpmnEvent from '@/components/sop/shape/bpmn/Event.vue';
import BpmnActivity from '@/components/sop/shape/bpmn/Activity.vue';
import BpmnGateway from '@/components/sop/shape/bpmn/Gateway.vue';
import BpmnDecisionText from '@/components/sop/shape/bpmn/DecisionText.vue';

const props = defineProps({
  name: {
    type: String,
    required: true
  },
  steps: {
    type: Array,
    required: true,
    default: () => []
  },
  implementer: {
        type: Array,
        required: true
    },
  arrowConfig: { type: Object, default: () => ({}) },
  labelConfig: { type: Object, default: () => ({}) },
  editMode: {
      type: Boolean,
      default: false
  }
});

const emit = defineEmits(['manual-edit',  'label-edit']);

const handleLabelEdit = (config) => {
    emit('label-edit', config);
};

// --- STATE BARU UNTUK MANAJEMAN PANAH ---
const arrowConfigs = ref({});
const arrowsReady = ref(false);

const handlePathUpdate = (payload) => {
    if (payload && payload.connectionId) {
        // PERBAIKAN: Selalu update dengan payload terbaru dari ArrowConnector
        arrowConfigs.value[payload.connectionId] = { ...payload };
    }
};
// -------------------------------------------

// Constants for sizing tasks within SopBpmnTemplate
const TASK_MIN_WIDTH = 90;
const TASK_MIN_HEIGHT = 50;
const TASK_CHAR_WIDTH_APPROX = 8; // Must match or be consistent with BpmnActivity.vue
const TASK_LINE_HEIGHT_FOR_SIZING = 15; // Must match or be consistent with BpmnActivity.vue
const TASK_HORIZONTAL_PADDING = 20; // Must match or be consistent with BpmnActivity.vue
const TASK_VERTICAL_PADDING = 20;   // Must match or be consistent with BpmnActivity.vue
const TASK_MAX_LINE_LENGTH_TARGET = 15; // Must match or be consistent with BpmnActivity.vue

// Helper function to get step dimensions
function getStepDimensions(stepName, stepType) {
  // For now, only 'task' type is dynamic. Other types like 'terminator', 'decision' use fixed sizes.
  // You can extend this for other types if needed.
  if (stepType !== 'task') {
    // Default fixed size for non-tasks (e.g., terminators, decisions)
    // Decisions might also need dynamic sizing if their text varies significantly.
    // For simplicity, keeping decision fixed for now.
    if (stepType === 'terminator') return { width: 120, height: 60 }; // Example fixed
    if (stepType === 'decision') return { width: 120, height: 80 }; // Example fixed for decision
    return { width: TASK_MIN_WIDTH, height: TASK_MIN_HEIGHT };
  }

  if (!stepName) return { width: TASK_MIN_WIDTH, height: TASK_MIN_HEIGHT };

  const lines = [];
  const words = stepName.split(' ');
  let currentLine = '';

  for (const word of words) {
    if (currentLine === '') {
      currentLine = word;
    } else if (currentLine.length + 1 + word.length <= TASK_MAX_LINE_LENGTH_TARGET) {
      currentLine += ' ' + word;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }
  if (currentLine !== '') {
    lines.push(currentLine);
  }
  
  const actualTextLines = lines.length > 0 ? lines : (stepName ? [stepName] : []);

  let requiredTextWidth = 0;
  if (actualTextLines.length > 0) {
    const longestLineLength = actualTextLines.reduce((max, line) => Math.max(max, line.length), 0);
    requiredTextWidth = longestLineLength * TASK_CHAR_WIDTH_APPROX;
  }
  const calculatedWidth = Math.max(TASK_MIN_WIDTH, requiredTextWidth + TASK_HORIZONTAL_PADDING);
  
  const requiredTextHeight = actualTextLines.length * TASK_LINE_HEIGHT_FOR_SIZING;
  const calculatedHeight = Math.max(TASK_MIN_HEIGHT, requiredTextHeight + TASK_VERTICAL_PADDING);

  return { width: calculatedWidth, height: calculatedHeight };
}

// Layout global dan lane
const globalLayout = ref({
  steps: [],
  connections: [],
  columnStartXs: [], // To store X positions of column starts
  maxColumnWidths: [] // To store max width for each column
});

const svgRefs = ref([]);
const laneLayouts = ref([]);

// Transformasi data steps untuk menambahkan terminator awal dan akhir
const processedSteps = computed(() => {
  if (!props.steps || props.steps.length === 0) return [];
  
  // Urutkan steps berdasarkan seq_number
  const sortedSteps = [...props.steps].sort((a, b) => a.seq_number - b.seq_number);
  
  // Ambil implementer dari langkah pertama dan terakhir untuk terminator
  const firstStep = sortedSteps[0];
  const lastStep = sortedSteps[sortedSteps.length - 1];
  
  // Buat terminator awal
  const startTerminator = {
    id_step: 'start-terminator', 
    seq_number: 0,
    name: 'Mulai',
    type: 'terminator',
    id_implementer: firstStep?.id_implementer || 1, // Gunakan implementer yang sama dengan langkah pertama
    id_next_step_if_no: null,
    id_next_step_if_yes: null
  };
  
  // Buat terminator akhir
  const endTerminator = {
    id_step: 'end-terminator',
    seq_number: sortedSteps.length + 1,
    name: 'Selesai',
    type: 'terminator',
    id_implementer: lastStep?.id_implementer || 1, // Gunakan implementer yang sama dengan langkah terakhir
    id_next_step_if_no: null,
    id_next_step_if_yes: null
  };
  
  // Ubah tipe step pertama dan terakhir menjadi 'task' jika mereka bertipe 'terminator'
  const modifiedSteps = sortedSteps.map(step => {
    if (step.type === 'terminator') {
      return { ...step, type: 'task' };
    }
    return step;
  });
  
  // Gabungkan terminator awal, steps yang sudah dimodifikasi, dan terminator akhir
  return [startTerminator, ...modifiedSteps, endTerminator];
});

// Computed property untuk koneksi
const bpmnConnections = computed(() => {
  const allConnections = [];
  const customLabels = props.labelConfig?.custom_labels || {};
  
  processedSteps.value.forEach((step) => {
    const targetTypeForConn = (targetStep) => targetStep ? targetStep.type : 'task';

    if (step.type === 'decision') {
      // Koneksi untuk kondisi "Yes"
      if (step.id_next_step_if_yes) {
        const targetStep = processedSteps.value.find(s => s.id_step === step.id_next_step_if_yes);
        if (targetStep) {
          // PERBAIKAN: Gunakan custom label dari props
          const yesKey = `step-${step.seq_number}-yes`;
          const customYesLabel = customLabels[yesKey];
          
          allConnections.push({
            id: `conn-${step.seq_number}-to-${targetStep.seq_number}-yes`,
            from: `bpmn-step-${step.seq_number}`,
            to: `bpmn-step-${targetStep.seq_number}`,
            label: customYesLabel || 'Ya',
            condition: 'yes',
            sourceType: step.type,
            targetType: targetTypeForConn(targetStep)
          });
        }
      }
      
      // Koneksi untuk kondisi "No"
      if (step.id_next_step_if_no) {
        const targetStep = processedSteps.value.find(s => s.id_step === step.id_next_step_if_no);
        if (targetStep) {
          // PERBAIKAN: Gunakan custom label dari database BPMN
          const noKey = `step-${step.seq_number}-no`;
          const customNoLabel = customLabels[noKey];
          
          allConnections.push({
            id: `conn-${step.seq_number}-to-${targetStep.seq_number}-no`,
            from: `bpmn-step-${step.seq_number}`,
            to: `bpmn-step-${targetStep.seq_number}`,
            label: customNoLabel || 'Tidak',
            condition: 'no',
            sourceType: step.type,
            targetType: targetTypeForConn(targetStep)
          });
        }
      }
    } else {
      // Untuk step non-decision, gunakan urutan sekuensial
      const nextStep = processedSteps.value.find(s => s.seq_number === step.seq_number + 1);
      if (nextStep) {
        allConnections.push({
          id: `conn-${step.seq_number}-to-${nextStep.seq_number}`,
          from: `bpmn-step-${step.seq_number}`,
          to: `bpmn-step-${nextStep.seq_number}`,
          label: null,
          sourceType: step.type,
          targetType: targetTypeForConn(nextStep)
        });
      }
    }
  });
  
  return allConnections;
});

// untuk menghitung sisi yang sudah digunakan pada setiap koneksi
const usedSides = computed(() => {
    const used = {}; // Format: { [shapeId]: { in: { [side]: connId[] }, out: { [side]: connId[] } } }

    bpmnConnections.value.forEach(conn => {
        const pathInfo = arrowConfigs.value[conn.id];
        if (!pathInfo) return;

        // Lacak sisi KELUAR dari sumber
        if (!used[conn.from]) used[conn.from] = { in: {}, out: {} };
        if (!used[conn.from].out[pathInfo.sSide]) used[conn.from].out[pathInfo.sSide] = [];
        if (!used[conn.from].out[pathInfo.sSide].includes(conn.id)) {
            used[conn.from].out[pathInfo.sSide].push(conn.id);
        }

        // Lacak sisi MASUK ke tujuan
        if (!used[conn.to]) used[conn.to] = { in: {}, out: {} };
        if (!used[conn.to].in[pathInfo.eSide]) used[conn.to].in[pathInfo.eSide] = [];
        if (!used[conn.to].in[pathInfo.eSide].includes(conn.id)) {
            used[conn.to].in[pathInfo.eSide].push(conn.id);
        }
    });
    return used;
});

// Function yang menghitung layout untuk setiap lane
const calculateGlobalLayout = () => {
  if (processedSteps.value.length === 0) return;

  const baseX = 10; // Left margin
  const spacing = 50; // Jarak horizontal antar kolom bentuk (edge to edge)
  const baseRowHeight = 160; // Tinggi minimal lane (dinaikkan dari 120 ke 160)
  const rowSpacing = 20; // Jarak vertikal antar lane (dari edge ke edge)
  
  globalLayout.value = { steps: [], connections: [], columnStartXs: [], maxColumnWidths: [] };

  const stepDimensionsCache = new Map();
  processedSteps.value.forEach(step => {
    const dims = getStepDimensions(step.name, step.type);
    stepDimensionsCache.set(step.id_step, dims);
  });

  const stepColumnMap = new Map(); 
  const numLanes = Math.max(1, orderedImplementer.value.length);
  const laneMaxColumn = new Array(numLanes).fill(-1); 

  processedSteps.value.forEach((step) => {
    const currentStepId = step.id_step;
    let currentLaneIndex = -1;

    if (orderedImplementer.value.length > 0) {
      currentLaneIndex = orderedImplementer.value.findIndex(imp => imp.id === step.id_implementer);
    }
    if (currentLaneIndex === -1) currentLaneIndex = 0;

    let calculatedColumnIndex = 0;
    const predecessors = [];
    bpmnConnections.value.forEach(conn => {
      if (`bpmn-step-${step.seq_number}` === conn.to) {
        const fromStepSeq = parseInt(conn.from.replace('bpmn-step-', ''));
        const predStep = processedSteps.value.find(s => s.seq_number === fromStepSeq);
        if (predStep) predecessors.push(predStep);
      }
    });

    if (predecessors.length > 0) {
      predecessors.forEach(pred => {
        const predColumn = stepColumnMap.get(pred.id_step);
        if (predColumn === undefined) return;

        let predLaneIndex = -1;
        if (orderedImplementer.value.length > 0) {
            predLaneIndex = orderedImplementer.value.findIndex(imp => imp.id === pred.id_implementer);
        }
        if (predLaneIndex === -1) predLaneIndex = 0;

        if (predLaneIndex === currentLaneIndex) {
          calculatedColumnIndex = Math.max(calculatedColumnIndex, predColumn + 1);
        } else { 
          calculatedColumnIndex = Math.max(calculatedColumnIndex, predColumn);
        }
      });
    } else {
      calculatedColumnIndex = 0;
    }

    calculatedColumnIndex = Math.max(calculatedColumnIndex, laneMaxColumn[currentLaneIndex] + 1);
    stepColumnMap.set(currentStepId, calculatedColumnIndex);
    laneMaxColumn[currentLaneIndex] = Math.max(laneMaxColumn[currentLaneIndex], calculatedColumnIndex);
  });

  const maxColIdx = processedSteps.value.length > 0 ? Math.max(0, ...Array.from(stepColumnMap.values())) : -1;
  const tempMaxColumnWidths = new Array(maxColIdx + 1).fill(0);

  processedSteps.value.forEach(step => {
    const columnIndex = stepColumnMap.get(step.id_step);
    if (columnIndex !== undefined) {
      const dims = stepDimensionsCache.get(step.id_step);
      if (dims) {
        tempMaxColumnWidths[columnIndex] = Math.max(tempMaxColumnWidths[columnIndex], dims.width);
      }
    }
  });
  globalLayout.value.maxColumnWidths = tempMaxColumnWidths;

  const tempColumnStartXs = [];
  let currentX = baseX;
  for (let i = 0; i <= maxColIdx; i++) {
    tempColumnStartXs[i] = currentX;
    currentX += tempMaxColumnWidths[i] + spacing;
  }
  globalLayout.value.columnStartXs = tempColumnStartXs;

  // BARU: Hitung tinggi maksimum untuk setiap lane berdasarkan task yang ada di dalamnya
  const laneMaxHeights = new Array(numLanes).fill(baseRowHeight);
  
  processedSteps.value.forEach((step) => {
    let layoutLaneIndex = -1;
    if (orderedImplementer.value.length > 0) {
        layoutLaneIndex = orderedImplementer.value.findIndex(imp => imp.id === step.id_implementer);
    }
    if (layoutLaneIndex === -1) layoutLaneIndex = 0;

    const dims = stepDimensionsCache.get(step.id_step) || getStepDimensions(null, 'task');
    
    // Update tinggi maksimum lane berdasarkan tinggi shape + padding yang lebih besar
    const requiredLaneHeight = dims.height + 60; // 30px padding atas + 30px padding bawah
    laneMaxHeights[layoutLaneIndex] = Math.max(laneMaxHeights[layoutLaneIndex], requiredLaneHeight);
  });

  // Hitung posisi Y kumulatif untuk setiap lane
  const laneYPositions = [];
  let cumulativeY = 0;
  for (let i = 0; i < numLanes; i++) {
    laneYPositions[i] = cumulativeY + (laneMaxHeights[i] / 2);
    cumulativeY += laneMaxHeights[i] + rowSpacing;
  }
  
  processedSteps.value.forEach((step) => {
    let layoutLaneIndex = -1;
    if (orderedImplementer.value.length > 0) {
        layoutLaneIndex = orderedImplementer.value.findIndex(imp => imp.id === step.id_implementer);
    }
    if (layoutLaneIndex === -1) layoutLaneIndex = 0;

    const columnIndex = stepColumnMap.get(step.id_step) || 0;
    const dims = stepDimensionsCache.get(step.id_step) || getStepDimensions(null, 'task');
    
    const columnActualStart = globalLayout.value.columnStartXs[columnIndex] !== undefined 
                              ? globalLayout.value.columnStartXs[columnIndex] 
                              : baseX;
    const columnActualMaxWidth = globalLayout.value.maxColumnWidths[columnIndex] !== undefined 
                                 ? globalLayout.value.maxColumnWidths[columnIndex] 
                                 : dims.width;

    const x_center = columnActualStart + columnActualMaxWidth / 2;
    
    // BARU: Gunakan posisi Y yang sudah dihitung per lane
    const y_global_center = laneYPositions[layoutLaneIndex];

    globalLayout.value.steps.push({
      id: step.id_step,
      type: step.type,
      x: x_center,
      y: y_global_center,
      width: dims.width,
      height: dims.height,
      name: step.name,
      seq: step.seq_number,
      lane: layoutLaneIndex,
      columnIndex,
      laneHeight: laneMaxHeights[layoutLaneIndex] // BARU: Simpan tinggi lane untuk keperluan rendering
    });
  });

  laneLayouts.value = orderedImplementer.value.map((imp, index) => {
    const stepsInThisLane = globalLayout.value.steps.filter(gStep => gStep.lane === index);
    const laneHeight = stepsInThisLane.length > 0 ? stepsInThisLane[0].laneHeight : baseRowHeight;
    
    return {
      impId: imp.id,
      height: laneHeight,
      steps: stepsInThisLane.map(gStep => ({
        ...gStep,
        y: laneHeight / 2, // Posisi relatif dalam lane (di tengah)
        id: `bpmn-step-${gStep.seq}`
      }))
    };
  });
};

const setSvgRef = (el, index) => {
  if (el) svgRefs.value[index] = el;
};

// Computed property untuk estimasi total lebar diagram berdasarkan jumlah kolom maksimum
const maxColumnIndex = computed(() => {
  if (!globalLayout.value.steps || globalLayout.value.steps.length === 0) return -1;
  const columnIndices = globalLayout.value.steps.map(step => step.columnIndex).filter(ci => typeof ci === 'number');
  if (columnIndices.length === 0) return -1;
  return Math.max(...columnIndices);
});

const diagramWidth = computed(() => {
  const localBaseX = 100; // Margin on the right
  if (maxColumnIndex.value === -1 || 
      !globalLayout.value.columnStartXs || globalLayout.value.columnStartXs.length === 0 ||
      !globalLayout.value.maxColumnWidths || globalLayout.value.maxColumnWidths.length === 0) {
    return localBaseX + TASK_MIN_WIDTH + localBaseX; // Default width
  }

  const lastColIdx = maxColumnIndex.value;
  if (lastColIdx < 0 || lastColIdx >= globalLayout.value.columnStartXs.length || lastColIdx >= globalLayout.value.maxColumnWidths.length) {
      // Fallback if indices are out of bounds, though should not happen with correct maxColIdx
      return localBaseX + TASK_MIN_WIDTH + localBaseX;
  }

  const lastColStartX = globalLayout.value.columnStartXs[lastColIdx];
  const lastColWidth = globalLayout.value.maxColumnWidths[lastColIdx];
  
  return lastColStartX + lastColWidth + localBaseX; // Add right margin
});

const orderedImplementer = computed(() => {
  // Pastikan props.implementer adalah array dan tidak kosong sebelum digunakan lebih lanjut
  if (!props.implementer || props.implementer.length === 0) {
    // Jika tidak ada implementer yang didefinisikan, kembalikan array kosong.
    return [];
  }

  const implementerMap = new Map(props.implementer.map(impl => [impl.id, impl]));
  const orderFromSteps = [];
  const seenInSteps = new Set();

  // Ambil urutan implementer berdasarkan kemunculan pertama di props.steps
  // dan pastikan implementer tersebut ada di props.implementer
  props.steps.forEach(step => {
    if (step.id_implementer && implementerMap.has(step.id_implementer) && !seenInSteps.has(step.id_implementer)) {
      seenInSteps.add(step.id_implementer);
      orderFromSteps.push(implementerMap.get(step.id_implementer));
    }
  });

  // Tambahkan implementer dari props.implementer yang belum ada di orderFromSteps
  const remainingImplementers = props.implementer.filter(impl => !seenInSteps.has(impl.id));
  
  return [...orderFromSteps, ...remainingImplementers];
});

// BARU: Properti komputasi untuk skala cetak (hanya nilai)
const printScale = computed(() => {
  const contentWidth = diagramWidth.value;
  if (contentWidth <= 0) return 1;
  
  // Lebar A4 landscape (297mm) dikurangi margin 10mm kiri & kanan
  const pageWidthInMm = 297 - 20;
  
  // Konversi lebar konten dari pixel ke mm (asumsi 96 DPI)
  const contentWidthInMm = (contentWidth / 96) * 25.4;
  
  // Hitung skala, jangan perbesar jika sudah muat
  const scale = Math.min(1, pageWidthInMm / contentWidthInMm);
  
  return scale;
});

// BARU: Properti komputasi untuk lebar diagram dalam format string 'px'
const diagramWidthPx = computed(() => `${diagramWidth.value}px`);

onMounted(() => {
  if (props.steps.length > 0) {
    calculateGlobalLayout();
    arrowsReady.value = false;
    nextTick(() => {
      arrowsReady.value = true;
    });
  }
});

watch(() => props.sopConfig, async (newConfig, oldConfig) => {
    // Jangan reset jika sudah ada banyak manual config
    const hasManualConfigs = props.arrowConfig && Object.keys(props.arrowConfig).length > 0;
    
    if (hasManualConfigs) {
        console.log('[SopStepTemplate] Manual configs exist, minimal recalculation for layout change');
        redrawKey.value = Date.now();
        return;
    }
    
    arrowsReady.value = false;
    arrowConfigs.value = {};
    await recalculateOPCPositions();
    redrawKey.value = Date.now();

    await nextTick();
    arrowsReady.value = true;
}, { deep: true });

const charWidth = 9; // Base width untuk single character (dalam pixels)
const rowHeight = 120; // Asumsi setiap implementer memiliki tinggi 120px
const safetyFactor = 1; // Faktor keamanan untuk lebar teks

const dynamicTitleWidth = computed(() => {
  const maxWidth = orderedImplementer.value.length * rowHeight * safetyFactor;
  const textWidth = props.name.length * charWidth;  // Hitung lebar text
  const lineCount = textWidth <= maxWidth ? 1 : Math.ceil(textWidth / maxWidth);
  return (lineCount * 30) + 20; // padding 20px supaya teks tidak terlalu mepet
});

// BARU: Handler untuk edit manual dari ArrowConnector
const handleManualEdit = (config) => {
    emit('manual-edit', config);
};

// PERBAIKAN: Watch yang lebih spesifik untuk menghindari re-kalkulasi yang tidak perlu
watch(() => props.steps.map(s => ({ id: s.id_step, seq: s.seq_number, next_yes: s.id_next_step_if_yes, next_no: s.id_next_step_if_no })), () => {
  // Jangan reset jika sudah ada manual configs
  const hasManualConfigs = props.arrowConfig && Object.keys(props.arrowConfig).length > 0;
  
  if (hasManualConfigs) {
    console.log('[SopBpmnTemplate] Manual configs exist, minimal recalculation');
    calculateGlobalLayout();
    return;
  }
  
  arrowsReady.value = false;
  arrowConfigs.value = {};
  calculateGlobalLayout();
  nextTick(() => {
    arrowsReady.value = true;
  });
}, { deep: true });

// PERBAIKAN: Force recalculation yang lebih conservative
const forceRecalculation = () => {
    console.log('[SopBpmnTemplate] Force recalculation triggered');
    
    // JANGAN reset jika ada manual config
    const hasManualConfigs = props.arrowConfig && Object.keys(props.arrowConfig).length > 0;
    if (!hasManualConfigs) {
        arrowConfigs.value = {};
    }
    
    arrowsReady.value = false;
    calculateGlobalLayout();
    
    nextTick(() => {
        arrowsReady.value = true;
        console.log('[SopBpmnTemplate] Arrows ready after force recalculation');
    });
};

// BARU: State untuk posisi teks decision yang dapat digeser
const decisionTextPositions = ref({});

// PERBAIKAN: Reset yang menggunakan data database dengan benar
const resetArrowsToLastSaved = () => {
    console.log('[SopBpmnTemplate] Reset arrows and decision text positions to last saved');

    // PERBAIKAN: Reset internal arrow configs ke prop dari database
    arrowConfigs.value = { ...props.arrowConfig };

    // PERBAIKAN: Reset decision text positions dari database
    resetDecisionTextPositions();

    arrowsReady.value = false;
    calculateGlobalLayout();

    nextTick(() => {
        arrowsReady.value = true;
        console.log('[SopBpmnTemplate] Reset completed');
    });
};

// PERBAIKAN: resetDecisionTextPositions dengan database sync yang benar
const resetDecisionTextPositions = () => {
    console.log('[SopBpmnTemplate] Resetting decision text positions from database');
    
    // Reset ke posisi dari database
    const bpmnLabelFromDB = props.labelConfig || {};
    const positions = bpmnLabelFromDB.positions || {};
    
    // Filter hanya posisi untuk decision text (step-X format, bukan conn-X format)
    const filteredPositions = {};
    Object.keys(positions).forEach(key => {
        if (key.startsWith('step-') && !key.includes('-yes') && !key.includes('-no')) {
            filteredPositions[key] = positions[key];
            console.log(`[SopBpmnTemplate] Restored decision text position for ${key}:`, positions[key]);
        }
    });
    
    decisionTextPositions.value = { ...filteredPositions };
    console.log('[SopBpmnTemplate] Decision text positions after reset:', decisionTextPositions.value);
};

// PERBAIKAN: Expose functions dengan getArrowConfigs yang benar
defineExpose({
    resetArrowsToLastSaved,
    forceRecalculation,
    resetDecisionTextPositions,
    // PERBAIKAN: Fungsi untuk mendapatkan semua konfigurasi panah saat ini
    getArrowConfigs: () => {
        console.log('[SopBpmnTemplate] getArrowConfigs called, returning:', arrowConfigs.value);
        return arrowConfigs.value;
    }
});

// BARU: Handler untuk drag teks decision
const handleDecisionTextDrag = (stepId, newPosition) => {
    decisionTextPositions.value[stepId] = newPosition;
    
    // Emit manual edit untuk menyimpan posisi
    emit('manual-edit', {
        stepId: stepId,
        textPosition: newPosition,
        type: 'decision-text'
    });
};

// PERBAIKAN: Watch untuk props.arrowConfig yang sync dengan database
watch(() => props.arrowConfig, (newConfig) => {
    console.log('[SopBpmnTemplate] arrowConfig changed from database:', newConfig);
    // Saat data dari database berubah, update state internal
    arrowConfigs.value = { ...newConfig };
    arrowsReady.value = false;
    calculateGlobalLayout();
    nextTick(() => {
        arrowsReady.value = true;
    });
}, { deep: true, immediate: true });

// PERBAIKAN: Watch untuk props.labelConfig yang sync dengan database  
watch(() => props.labelConfig, (newConfig) => {
    console.log('[SopBpmnTemplate] labelConfig changed from database:', newConfig);
    // Update decision text positions dari database
    resetDecisionTextPositions();
}, { deep: true, immediate: true });
</script>

<template>
  <!-- Wrapper untuk browser (scroll) dan print (centering) -->
  <div class="diagram-wrapper">
    <!-- Kontainer utama untuk diagram yang akan di-scale saat print -->
    <div class="diagram-container">
      <table class="border-2 border-black relative z-10 w-full md:my-5" id="bpmn-container">
        <tbody>
          <tr>
            <td v-if="props.name" class="border-2 border-black w-0 relative" :rowspan="orderedImplementer.length">
              <div class="relative h-full" :style="`width: ${dynamicTitleWidth}px;`">
                <p class="font-bold text-lg -rotate-90 text-center absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                  :class="(props.name.length * charWidth) > (orderedImplementer.length * rowHeight * safetyFactor) ? 'whitespace-normal' : 'whitespace-nowrap'">
                  {{ capitalizeWords(props.name) }}
                </p>
              </div>
            </td>
            <td class="border-2 border-black w-8">
              <div class="flex items-center justify-center w-8" :style="`height: ${laneLayouts[0]?.height || 120}px;`">
                <p class="-rotate-90 origin-center whitespace-nowrap font-medium">
                  {{ orderedImplementer[0].name }}
                </p>
              </div>
            </td>
            <td class="border-2 border-black p-0">
              <div class="relative overflow-x-auto" :style="`height: ${laneLayouts[0]?.height || 120}px;`">
                <svg :ref="el => setSvgRef(el, 0)" class="w-full h-full">
                  <template v-if="laneLayouts[0] && laneLayouts[0].steps">
                    <template v-for="step in laneLayouts[0].steps" :key="step.id">
                      <BpmnEvent 
                        v-if="step.type === 'terminator'"
                        :x="step.x"
                        :y="step.y"
                        :id="`bpmn-step-${step.seq}`"
                        :text="step.seq === 0 ? 'Mulai' : 'Selesai'"
                      />
                      <BpmnActivity
                        v-else-if="step.type === 'task'"
                        :x="step.x"
                        :y="step.y"
                        :width="step.width"
                        :height="step.height"
                        :name="step.name"
                        :id="`bpmn-step-${step.seq}`"
                      />
                      <BpmnGateway
                        v-else-if="step.type === 'decision'"
                        :x="step.x"
                        :y="step.y"
                        :name="step.name"
                        :id="`bpmn-step-${step.seq}`"
                      />
                    </template>
                  </template>
                </svg>
              </div>
            </td>
          </tr>
          <tr v-for="(imp, index) in orderedImplementer.slice(1)" :key="imp.id">
            <td class="border-2 border-black w-8">
              <div class="flex items-center justify-center w-8" :style="`height: ${laneLayouts[index + 1]?.height || 120}px;`">
                <p class="-rotate-90 origin-center whitespace-nowrap font-medium">
                  {{ imp.name }}
                </p>
              </div>
            </td>
            <td class="border-2 border-black p-0">
              <div class="relative overflow-x-auto" :style="`height: ${laneLayouts[index + 1]?.height || 120}px;`">
                <svg :ref="el => setSvgRef(el, index + 1)" class="w-full h-full">
                  <template v-if="laneLayouts[index + 1] && laneLayouts[index + 1].steps">
                    <template v-for="step in laneLayouts[index + 1].steps" :key="step.id">
                      <BpmnEvent 
                        v-if="step.type === 'terminator'"
                        :x="step.x"
                        :y="step.y"
                        :id="`bpmn-step-${step.seq}`"
                        :text="step.seq === 0 ? 'Mulai' : 'Selesai'"
                      />
                      <BpmnActivity
                        v-else-if="step.type === 'task'"
                        :x="step.x"
                        :y="step.y"
                        :width="step.width"
                        :height="step.height"
                        :name="step.name"
                        :id="`bpmn-step-${step.seq}`"
                      />
                      <BpmnGateway
                        v-else-if="step.type === 'decision'"
                        :x="step.x"
                        :y="step.y"
                        :name="step.name"
                        :id="`bpmn-step-${step.seq}`"
                      />
                    </template>
                  </template>
                </svg>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <svg class="absolute inset-0 h-full z-30 pointer-events-none">
        <template v-if="laneLayouts[0] && laneLayouts[0].steps">
          <BpmnDecisionText
            v-for="step in laneLayouts[0].steps.filter(s => s.type === 'decision')"
            :key="`decision-text-${step.seq}`"
            :step-id="`step-${step.seq}`"
            :step-name="step.name"
            :x="step.x"
            :y="step.y"
            :custom-position="decisionTextPositions[`step-${step.seq}`]"
            :edit-mode="editMode"
            @position-changed="handleDecisionTextDrag"
          />
        </template>
        
        <template v-for="(lane, index) in laneLayouts.slice(1)" :key="`lane-${index + 1}`">
          <template v-if="lane && lane.steps">
            <BpmnDecisionText
              v-for="step in lane.steps.filter(s => s.type === 'decision')"
              :key="`decision-text-${step.seq}`"
              :step-id="`step-${step.seq}`"
              :step-name="step.name"
              :x="step.x"
              :y="step.y + ((index + 1) * rowHeight)"
              :custom-position="decisionTextPositions[`step-${step.seq}`]"
              :edit-mode="editMode"
              @position-changed="handleDecisionTextDrag"
            />
          </template>
        </template>
      </svg>

      <svg v-if="arrowsReady" class="absolute inset-0 h-full z-20"
           :class="editMode ? 'pointer-events-auto' : 'pointer-events-none'">
        <ArrowConnector
          v-for="(connection, index) in bpmnConnections" 
          :idarrow="index + 100"
          idcontainer="bpmn-container"
          :key="`${connection.from}-${connection.to}-${index}`"
          :connection="connection"
          :obstacles="processedSteps.map(step => ({ id: `bpmn-step-${step.seq_number}` }))"
          :used-sides="usedSides"
          :manual-config="arrowConfigs[connection.id]"
          :manual-label-position="labelConfig.positions && labelConfig.positions[connection.id]"
          :edit-mode="editMode"
          @path-updated="handlePathUpdate"
          @manual-edit="handleManualEdit"
          @label-edit="handleLabelEdit"
        />
      </svg>
    </div>
  </div>
</template>

<style scoped>
.diagram-wrapper {
  /* Untuk browser: menyediakan scroll horizontal jika diagram lebar */
  width: 100%;
  overflow-x: auto;
}

.diagram-container {
  /* Untuk browser: mengatur lebar dan posisi diagram di tengah */
  width: v-bind(diagramWidthPx);
  margin: 0 auto;
  position: relative; /* Konteks untuk SVG yang absolut */
}

/* Memastikan SVG overlay mengisi kontainer dengan benar */
.diagram-container > svg {
  width: v-bind(diagramWidthPx);
  min-width: 100%;
}

@media print {
  @page {
    size: A4 landscape;
    margin: 10mm;
  }

  .diagram-wrapper {
    /* Untuk print: menjadi flex container untuk memusatkan diagram */
    overflow: visible !important;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: flex-start;
  }

  .diagram-container {
    /* Untuk print: menerapkan skala dan mereset margin */
    transform: scale(v-bind(printScale));
    transform-origin: top left;
    margin: 0;
  }

  #bpmn-container {
    margin: 0 !important; /* Hapus margin pada tabel saat print */
  }
}
</style>
