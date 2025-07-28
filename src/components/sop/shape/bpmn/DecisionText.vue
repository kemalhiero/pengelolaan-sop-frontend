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

// PERBAIKAN: Watch untuk perubahan customPosition dari parent
watch(() => props.customPosition, (newPosition) => {
  if (newPosition && !isDragging.value) {
    // Update jika ada posisi baru dari parent dan sedang tidak drag
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
</script>

<template>
  <!-- Area klik untuk drag -->
  <rect 
    v-if="editMode"
    :x="effectivePosition.x - 40"
    :y="effectivePosition.y - 15"
    width="80"
    height="30"
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
  
  <text
    :x="effectivePosition.x"
    :y="effectivePosition.y"
    text-anchor="middle"
    alignment-baseline="middle"
    class="text-sm font-medium fill-black print:hidden"
    :class="editMode ? 'cursor-move' : ''"
    style="pointer-events: none;"
  >
    {{ stepName }}
  </text>
  
  <!-- Text untuk print -->
  <text
    :x="effectivePosition.x"
    :y="effectivePosition.y"
    text-anchor="middle"
    alignment-baseline="middle"
    class="text-sm font-medium fill-black print:block hidden"
  >
    {{ stepName }}
  </text>
</template>
