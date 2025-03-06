<script setup>
import { onMounted, ref, computed } from 'vue';
import BpmnLaneRow from '@/components/diagram/bpmn/BpmnLaneRow.vue';
import BpmnConnector from '@/components/diagram/bpmn/BpmnConnector.vue';
import capitalizeWords from '@/utils/capitalizeWord';

const props = defineProps({
  name: {
    type: String,
    required: true
  },
  steps: {
    type: Array,
    required: true
  },
  implementer: {
    type: Array,
    required: true
  }
});

// Layout global (untuk shape dan koneksi)
const globalLayout = ref({
  steps: [],
  connections: []
});

const svgRefs = ref([]);
const laneLayouts = ref([]);

// Helper: hitung titik tepi shape sesuai arah koneksi
const getEdgeCoordinates = (shape, dx, dy, shapeWidth, shapeHeight, terminatorRadius) => {
  // shape.x dan shape.y adalah koordinat pusat
  if (shape.type === 'terminator') {
    const r = terminatorRadius;
    if (Math.abs(dx) >= Math.abs(dy)) {
      return dx > 0
        ? { x: shape.x + r, y: shape.y }
        : { x: shape.x - r, y: shape.y };
    } else {
      return dy > 0
        ? { x: shape.x, y: shape.y + r }
        : { x: shape.x, y: shape.y - r };
    }
  } else if (shape.type === 'decision') {
    // gunakan offset 60 untuk decision
    if (Math.abs(dx) >= Math.abs(dy)) {
      return dx > 0
        ? { x: shape.x + 60, y: shape.y }
        : { x: shape.x - 60, y: shape.y };
    } else {
      return dy > 0
        ? { x: shape.x, y: shape.y + 60 }
        : { x: shape.x, y: shape.y - 60 };
    }
  } else {
    // shape biasa berbentuk rectangle
    if (Math.abs(dx) >= Math.abs(dy)) {
      return dx > 0
        ? { x: shape.x + (shapeWidth / 2), y: shape.y }
        : { x: shape.x - (shapeWidth / 2), y: shape.y };
    } else {
      return dy > 0
        ? { x: shape.x, y: shape.y + (shapeHeight / 2) }
        : { x: shape.x, y: shape.y - (shapeHeight / 2) };
    }
  }
};

const calculateGlobalLayout = () => {
  const sortedSteps = [...props.steps].sort((a, b) => a.seq_number - b.seq_number);

  // Konfigurasi diagram
  const baseX = 80;
  const shapeWidth = 120;
  const shapeHeight = 60;
  const spacing = 80;
  const terminatorRadius = 40;
  const rowHeight = 120;
  const rowSpacing = 100;
  const laneY = rowHeight + rowSpacing;

  // Reset global layout
  globalLayout.value = { steps: [], connections: [] };

  // Kalkulasi posisi tiap langkah (step)
  sortedSteps.forEach((step, i) => {
    const laneIndex = props.implementer.findIndex(imp => imp.id === step.id_implementer);
    // posisi x dihitung berdasarkan urutan global
    const x = baseX + i * (shapeWidth + spacing);
    // posisi y berdasarkan lane (puse tengah)
    const y = laneIndex * laneY + (rowHeight / 2);

    globalLayout.value.steps.push({
      id: step.id_step,
      type: step.type,
      x: x,         // pusat shape
      y: y,         // pusat shape
      width: shapeWidth,
      height: shapeHeight,
      name: step.name,
      seq: step.seq_number,
      lane: laneIndex
    });

    // Hitung koneksi antar step secara global
    if (i > 0) {
      const prevStep = globalLayout.value.steps[i - 1];
      const currentStep = globalLayout.value.steps[i];
      const dx = currentStep.x - prevStep.x;
      const dy = currentStep.y - prevStep.y;
      
      // Tentukan titik tepi pada shape asal dan tujuan
      const start = getEdgeCoordinates(prevStep, dx, dy, shapeWidth, shapeHeight, terminatorRadius);
      const end = getEdgeCoordinates(currentStep, -dx, -dy, shapeWidth, shapeHeight, terminatorRadius);
      
      globalLayout.value.connections.push({
        startX: start.x,
        startY: start.y,
        endX: end.x,
        endY: end.y
      });
    }
  });

  // Pisahkan layout tiap lane untuk shape (tanpa koneksi)
  laneLayouts.value = props.implementer.map((imp, index) => {
    const laneTopOffset = index * laneY;
    return {
      impId: imp.id,
      steps: globalLayout.value.steps
              .filter(step => step.lane === index)
              .map(step => ({ ...step, y: step.y - laneTopOffset }))
    };
  });
};

onMounted(() => {
  if (props.steps.length > 0) {
    calculateGlobalLayout();
  }
});

// Global computed untuk koneksi, menggunakan koordinat aslinya
const globalConnections = computed(() => globalLayout.value.connections);

const setSvgRef = (el, index) => {
  if (el) svgRefs.value[index] = el;
};
</script>

<template>
  <div class="relative bg-white w-11/12 mx-auto mt-8 mb-24">
    <!-- Komponen BpmnConnector untuk menggambar koneksi -->
    <svg class="absolute top-0 left-0 w-full h-full pointer-events-none">
      <BpmnConnector
        v-for="(conn, index) in globalConnections"
        :key="index"
        :startX="conn.startX"
        :startY="conn.startY"
        :endX="conn.endX"
        :endY="conn.endY"
      />
    </svg>
    
    <table class="w-full border-2 border-black relative z-10">
      <tbody>
        <tr>
          <td v-if="props.name" class="border-2 border-black w-10" :rowspan="implementer.length">
            <div class="flex justify-center w-10">
              <p class="-rotate-90 origin-center whitespace-nowrap font-bold text-lg">
                {{ capitalizeWords(props.name) }}
              </p>
            </div>
          </td>
          <BpmnLaneRow
            :implementer="implementer[0]"
            :layout="laneLayouts[0] || { steps: [] }"
            :svg-ref="setSvgRef"
            :index="0"
          />
        </tr>
        <tr v-for="(imp, index) in implementer.slice(1)" :key="imp.id">
          <BpmnLaneRow
            :implementer="imp"
            :layout="laneLayouts[index + 1] || { steps: [] }"
            :svg-ref="setSvgRef"
            :index="index + 1"
          />
        </tr>
      </tbody>
    </table>
  </div>
</template>