<script setup>
import { ref, computed, inject, watch } from 'vue';

const props = defineProps({
  stepId: {
    type: String,
    required: true
  },
  stepName: {
    type: String,
    required: true
  },
  x: {
    type: Number,
    required: true
  },
  y: {
    type: Number,
    required: true
  },
  customPosition: {
    type: Object,
    default: null
  },
  editMode: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['position-changed']);

// PERBAIKAN: Inject label config dari database
const { bpmnLabelConfig } = inject('labelConfigs');

const isDragging = ref(false);
const dragStart = ref({ x: 0, y: 0 });
const currentPosition = ref(null);

// Konstanta untuk text wrapping
const MAX_CHARS_PER_LINE = 15; // Maksimal karakter per baris
const LINE_HEIGHT = 14; // Tinggi antar baris dalam pixel

// Fungsi untuk memecah teks menjadi beberapa baris
const splitTextToLines = (text) => {
  if (!text) return [''];
  
  const words = text.split(' ');
  const lines = [];
  let currentLine = '';
  
  for (const word of words) {
    if (currentLine === '') {
      currentLine = word;
    } else if ((currentLine + ' ' + word).length <= MAX_CHARS_PER_LINE) {
      currentLine += ' ' + word;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }
  
  if (currentLine !== '') {
    lines.push(currentLine);
  }
  
  return lines.length > 0 ? lines : [''];
};

// Computed property untuk teks yang sudah dipecah menjadi baris
const textLines = computed(() => splitTextToLines(props.stepName));

// Computed property untuk tinggi total teks
const totalTextHeight = computed(() => {
  return textLines.value.length * LINE_HEIGHT;
});

// Posisi default di dalam shape decision (center)
const defaultPosition = computed(() => ({
  x: props.x,
  y: props.y
}));

// PERBAIKAN: Posisi yang konsisten, prioritaskan customPosition lalu database
const effectivePosition = computed(() => {
  if (isDragging.value && currentPosition.value) {
    return currentPosition.value;
  }
  
  // PERBAIKAN: Prioritaskan customPosition (dari parent component)
  if (props.customPosition) {
    return props.customPosition;
  }
  
  // Lalu prioritaskan posisi dari database
  const dbLabelConfig = bpmnLabelConfig.value || {};
  const dbPositions = dbLabelConfig.positions || {};
  const dbPosition = dbPositions[props.stepId];
  
  if (dbPosition) {
    return dbPosition;
  }
  
  return defaultPosition.value;
});

// PERBAIKAN: Watch untuk perubahan customPosition dari parent yang lebih responsive
watch(() => props.customPosition, (newPosition) => {
  console.log(`[DecisionText] ${props.stepId}: customPosition changed to:`, newPosition);
  if (newPosition && !isDragging.value) {
    // Update jika ada posisi baru dari parent dan sedang tidak drag
    currentPosition.value = null;
  }
}, { deep: true, immediate: true });

// PERBAIKAN: Watch untuk perubahan database positions
watch(() => {
  return bpmnLabelConfig.value?.positions?.[props.stepId];
}, (newPosition) => {
  console.log(`[DecisionText] ${props.stepId}: Database position changed to:`, newPosition);
  if (newPosition && !isDragging.value && !props.customPosition) {
    // Update hanya jika tidak ada custom position dan tidak sedang drag
    currentPosition.value = null;
  }
}, { deep: true });

const startDrag = (event) => {
  if (!props.editMode) return;
  
  event.preventDefault();
  event.stopPropagation();
  
  isDragging.value = true;
  
  // PERBAIKAN: Ambil posisi awal yang tepat
  const startX = effectivePosition.value.x;
  const startY = effectivePosition.value.y;
  
  const container = document.querySelector('#bpmn-container');
  if (!container) return;
  
  const containerRect = container.getBoundingClientRect();
  
  dragStart.value = {
    x: event.clientX - containerRect.left - startX,
    y: event.clientY - containerRect.top - startY
  };
  
  // PERBAIKAN: Set posisi awal untuk tracking
  currentPosition.value = { x: startX, y: startY };
  
  document.addEventListener('mousemove', handleDrag);
  document.addEventListener('mouseup', stopDrag);
};

const handleDrag = (event) => {
  if (!isDragging.value) return;
  
  const container = document.querySelector('#bpmn-container');
  if (!container) return;
  
  const containerRect = container.getBoundingClientRect();
  const newX = event.clientX - containerRect.left - dragStart.value.x;
  const newY = event.clientY - containerRect.top - dragStart.value.y;
  
  // PERBAIKAN: Update current position untuk rendering realtime
  currentPosition.value = { x: newX, y: newY };
};

const stopDrag = () => {
  if (!isDragging.value) return;
  
  isDragging.value = false;
  
  document.removeEventListener('mousemove', handleDrag);
  document.removeEventListener('mouseup', stopDrag);
  
  // PERBAIKAN: Emit perubahan posisi dan jangan reset currentPosition
  if (currentPosition.value) {
    emit('position-changed', props.stepId, { ...currentPosition.value });    
  }
};

// Computed property untuk area klik yang menyesuaikan dengan tinggi teks
const clickAreaHeight = computed(() => {
  return Math.max(30, totalTextHeight.value + 10); // Minimal 30px, atau tinggi teks + padding
});

const clickAreaWidth = computed(() => {
  if (textLines.value.length === 0) return 80;
  
  // Hitung lebar berdasarkan baris terpanjang
  const longestLine = textLines.value.reduce((longest, line) => 
    line.length > longest.length ? line : longest, '');
  
  return Math.max(80, longestLine.length * 8 + 20); // 8px per karakter + padding
});
</script>

<template>
  <!-- Area klik untuk drag dengan ukuran yang menyesuaikan -->
  <rect 
    v-if="editMode"
    :x="effectivePosition.x - (clickAreaWidth / 2)"
    :y="effectivePosition.y - (clickAreaHeight / 2)"
    :width="clickAreaWidth"
    :height="clickAreaHeight"
    fill="transparent"
    stroke="#3b82f6"
    stroke-width="1"
    stroke-dasharray="2,2"
    rx="4"
    class="cursor-move hover:bg-blue-100 hover:bg-opacity-30 print:hidden"
    style="pointer-events: all;"
    opacity="0.6"
    @mousedown="startDrag"
  />
  
  <!-- Text dengan multiple lines untuk edit mode -->
  <text
    :x="effectivePosition.x"
    :y="effectivePosition.y - ((textLines.length - 1) * LINE_HEIGHT / 2)"
    text-anchor="middle"
    class="text-sm font-medium fill-black print:hidden"
    :class="editMode ? 'cursor-move' : ''"
    style="pointer-events: none;"
  >
    <tspan
      v-for="(line, index) in textLines"
      :key="index"
      :x="effectivePosition.x"
      :dy="index === 0 ? '0.35em' : `${LINE_HEIGHT}px`"
    >
      {{ line }}
    </tspan>
  </text>
  
  <!-- Text untuk print dengan multiple lines -->
  <text
    :x="effectivePosition.x"
    :y="effectivePosition.y - ((textLines.length - 1) * LINE_HEIGHT / 2)"
    text-anchor="middle"
    class="text-sm font-medium fill-black print:block hidden"
  >
    <tspan
      v-for="(line, index) in textLines"
      :key="index"
      :x="effectivePosition.x"
      :dy="index === 0 ? '0.35em' : `${LINE_HEIGHT}px`"
    >
      {{ line }}
    </tspan>
  </text>
</template>
