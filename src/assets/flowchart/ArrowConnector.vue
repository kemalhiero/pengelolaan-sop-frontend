<!-- ArrowConnector.vue -->
<script setup>
import { onMounted, ref, nextTick, watch } from 'vue';

const props = defineProps({
  connection: {
    type: Object,
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

const calculatePath = async () => {
  await nextTick();
  
  setTimeout(() => {
    const fromPos = getElementPosition(props.connection.from);
    const toPos = getElementPosition(props.connection.to);

    if (!fromPos || !toPos) {
      pathData.value = '';
      return;
    }

    // Tentukan arah dan posisi relatif
    const isToTheRight = toPos.left > fromPos.right;
    const isToTheLeft = toPos.right < fromPos.left;
    const isDirectlyBelow = toPos.top > fromPos.bottom && 
      Math.abs((fromPos.left + fromPos.width/2) - (toPos.left + toPos.width/2)) < 20;
    const isDirectlyAbove = toPos.bottom < fromPos.top &&
      Math.abs((fromPos.left + fromPos.width/2) - (toPos.left + toPos.width/2)) < 20;

    let start = {}, end = {}, path = '';

    if (isDirectlyBelow) {
      // Panah vertikal ke bawah
      start = {
        x: fromPos.left + fromPos.width / 2,
        y: fromPos.bottom
      };
      end = {
        x: toPos.left + toPos.width / 2,
        y: toPos.top
      };
      path = `M ${start.x} ${start.y} L ${end.x} ${end.y}`;
    } 
    else if (isDirectlyAbove) {
      // Panah vertikal ke atas
      start = {
        x: fromPos.left + fromPos.width / 2,
        y: fromPos.top
      };
      end = {
        x: toPos.left + toPos.width / 2,
        y: toPos.bottom
      };
      path = `M ${start.x} ${start.y} L ${end.x} ${end.y}`;
    }
    else if (isToTheRight) {
      // Panah ke kanan + bawah
      start = {
        x: fromPos.right,
        y: fromPos.top + fromPos.height / 2
      };
      end = {
        x: toPos.left + toPos.width / 2, // Titik tengah shape kedua
        y: toPos.top
      };
      
      // Bergerak horizontal ke titik tengah shape kedua, lalu turun vertikal
      path = `M ${start.x} ${start.y}
              L ${end.x} ${start.y}
              L ${end.x} ${end.y}`;
    }
    else if (isToTheLeft) {
      // Panah ke kiri + bawah
      start = {
        x: fromPos.left,
        y: fromPos.top + fromPos.height / 2
      };
      end = {
        x: toPos.left + toPos.width / 2, // Titik tengah shape kedua
        y: toPos.top
      };
      
      // Bergerak horizontal ke titik tengah shape kedua, lalu turun vertikal
      path = `M ${start.x} ${start.y}
              L ${end.x} ${start.y}
              L ${end.x} ${end.y}`;
    }

    pathData.value = path;
    emit('mounted');
  }, 100);
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
      <marker
        id="arrowhead"
        markerWidth="10"
        markerHeight="8"
        refX="7"
        refY="4"
        orient="auto"
      >
        <!-- Ubah path untuk membuat panah lebih tumpul -->
        <path d="M0,0 L8,4 L0,8 L2,4 Z" fill="black" />
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
