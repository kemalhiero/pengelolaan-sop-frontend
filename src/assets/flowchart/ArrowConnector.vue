<!-- ArrowConnector.vue -->
<script setup>
import { onMounted, ref, nextTick } from 'vue';

const props = defineProps({
  connection: {
    type: Object,
    required: true
  }
});

// State untuk menyimpan path data
const pathData = ref('');
const labelPosition = ref(null);

// Fungsi untuk mendapatkan posisi elemen dengan pengecekan null
const getElementPosition = (elementId) => {
  const element = document.getElementById(elementId);
  const container = document.querySelector('.sop-container'); // Gunakan class sop-container

  if (!element || !container) {
    console.info('element', element)
    console.info('container', container)
    console.warn(`Element with id ${elementId} or container not found`);
    return null;
  }

  const rect = element.getBoundingClientRect();
  const containerRect = container.getBoundingClientRect();

  return {
    left: rect.left - containerRect.left,
    right: rect.right - containerRect.left,
    top: rect.top - containerRect.top,
    bottom: rect.bottom - containerRect.top,
    width: rect.width,
    height: rect.height
  };
};

// Fungsi untuk menghitung path
const calculatePath = () => {
  nextTick(() => {
    const fromPos = getElementPosition(props.connection.from);
    const toPos = getElementPosition(props.connection.to);

    // Jika salah satu posisi tidak ditemukan, jangan render path
    if (!fromPos || !toPos) {
      pathData.value = '';
      return;
    }

    // Hitung titik awal dan akhir
    const start = {
      x: fromPos.left + fromPos.width / 2,
      y: fromPos.bottom
    };

    const end = {
      x: toPos.left + toPos.width / 2,
      y: toPos.top
    };

    // Hitung titik tengah untuk belokan
    const midY = (start.y + end.y) / 2;

    // Buat path
    pathData.value = `M ${start.x} ${start.y} 
                      L ${start.x} ${midY} 
                      L ${end.x} ${midY} 
                      L ${end.x} ${end.y}`;
  });
};

onMounted(() => {
  calculatePath();
});
</script>

<template>
  <g v-if="pathData">
    <!-- Definisi marker panah -->
    <defs>
      <marker
        id="arrowhead"
        markerWidth="10"
        markerHeight="7"
        refX="9"
        refY="3.5"
        orient="auto"
      >
        <path d="M0,0 L10,3.5 L0,7 Z" fill="black" />
      </marker>
    </defs>

    <!-- Path panah -->
    <path
      :d="pathData"
      fill="none"
      stroke="black"
      stroke-width="2"
      marker-end="url(#arrowhead)"
    />

    <!-- Label -->
    <text
      v-if="labelPosition && props.connection.label"
      :x="labelPosition.x"
      :y="labelPosition.y"
      text-anchor="middle"
      class="text-sm fill-black"
    >
      {{ props.connection.label }}
    </text>
  </g>
</template>
