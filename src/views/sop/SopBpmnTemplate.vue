<script setup>
import { onMounted, ref, computed } from 'vue';
import BpmnLaneRow from '@/components/diagram/bpmn/BpmnLaneRow.vue';
import ArrowConnector from '@/components/diagram/ArrowConnector.vue';
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

// Layout global dan lane
const globalLayout = ref({
  steps: [],
  connections: []
});

const svgRefs = ref([]);
const laneLayouts = ref([]);

// Computed property untuk koneksi
const bpmnConnections = computed(() => {
  const allConnections = [];
  
  props.steps.forEach((step) => {
    if (step.type === 'decision') {
      // Koneksi untuk kondisi "Yes"
      if (step.id_next_step_if_yes) {
        const targetStep = props.steps.find(s => s.id_step === step.id_next_step_if_yes);
        if (targetStep) {
          allConnections.push({
            from: `bpmn-step-${step.seq_number}`,
            to: `bpmn-step-${targetStep.seq_number}`,
            label: 'Ya',
            condition: 'yes'
          });
        }
      }
      
      // Koneksi untuk kondisi "No"
      if (step.id_next_step_if_no) {
        const targetStep = props.steps.find(s => s.id_step === step.id_next_step_if_no);
        if (targetStep) {
          allConnections.push({
            from: `bpmn-step-${step.seq_number}`,
            to: `bpmn-step-${targetStep.seq_number}`,
            label: 'Tidak',
            condition: 'no'
          });
        }
      }
    } else {
      // Untuk step non-decision, gunakan urutan sekuensial
      const nextStep = props.steps.find(s => s.seq_number === step.seq_number + 1);
      if (nextStep) {
        allConnections.push({
          from: `bpmn-step-${step.seq_number}`,
          to: `bpmn-step-${nextStep.seq_number}`
        });
      }
    }
  });
  
  return allConnections;
});

// Track mounting status arrows
const arrowsMounted = ref(new Set());
const handleArrowMounted = () => {
  arrowsMounted.value.add(true);
};

// Function yang menghitung layout untuk setiap lane
const calculateGlobalLayout = () => {
  const sortedSteps = [...props.steps].sort((a, b) => a.seq_number - b.seq_number);

  // Konfigurasi diagram
  const baseX = 120; // Increase base X for better visibility
  const shapeWidth = 120;
  const shapeHeight = 60;
  const spacing = 100; // Increase spacing
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
    // posisi y berdasarkan lane (pusat shape)
    const y = laneIndex * laneY + (rowHeight / 2);

    globalLayout.value.steps.push({
      id: step.id_step,
      type: step.type,
      x: x,
      y: y,
      width: shapeWidth,
      height: shapeHeight,
      name: step.name,
      seq: step.seq_number,
      lane: laneIndex
    });
  });

  // Pisahkan layout tiap lane untuk shape
  laneLayouts.value = props.implementer.map((imp, index) => {
    const laneTopOffset = index * laneY;
    return {
      impId: imp.id,
      steps: globalLayout.value.steps
              .filter(step => step.lane === index)
              .map(step => ({ 
                ...step, 
                y: step.y - laneTopOffset,
                id: `bpmn-step-${step.seq}` // Tambahkan ID untuk referensi ArrowConnector
              }))
    };
  });
};

onMounted(() => {
  if (props.steps.length > 0) {
    calculateGlobalLayout();
  }
});

const setSvgRef = (el, index) => {
  if (el) svgRefs.value[index] = el;
};
</script>

<template>
  <div class="relative bg-white w-11/12 mx-auto mt-8 mb-24">
    <!-- Tabel untuk lanes -->
    <table class="w-full border-2 border-black relative z-10" id="bpmn-container">
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
    
    <!-- Panah dengan ArrowConnector -->
    <svg class="absolute inset-0 w-full h-full pointer-events-none z-20">      
      <ArrowConnector
        v-for="(connection, index) in bpmnConnections" 
        :idarrow="index + 100"
        idcontainer="bpmn-container"
        :key="`${connection.from}-${connection.to}`"
        :connection="connection"
        @mounted="handleArrowMounted"
      />
    </svg>
  </div>
</template>