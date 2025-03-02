<script setup>
import { onMounted, ref, computed } from 'vue';
import BpmnLaneRow from '@/components/diagram/bpmn/BpmnLaneRow.vue';

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

const svgRefs = ref([]);
const laneLayouts = ref([]);

// Group steps by implementer
const stepsByImplementer = computed(() => {
  const result = {};
  props.implementer.forEach(imp => {
    result[imp.id] = props.steps.filter(step => step.id_implementer === imp.id);
  });
  return result;
});

onMounted(() => {
  props.implementer.forEach((imp, index) => {
    if (stepsByImplementer.value[imp.id] && stepsByImplementer.value[imp.id].length > 0) {
      calculateLayout(imp.id, index);
    }
  });
});

const calculateLayout = (impId, index) => {
  const steps = stepsByImplementer.value[impId];
  const layout = {
    impId,
    steps: [],
    connections: []
  };
  
  const height = 120;
  const shapeWidth = 120;
  const shapeHeight = 60;
  const spacing = 80;
  const terminatorRadius = 40; // Radius lingkaran terminator
  
  let currentX = 80;
  const currentY = height / 2;
  
  steps.forEach((step, i) => {
    // Store step layout info
    layout.steps.push({
      id: step.id_step,
      type: step.type,
      x: currentX,
      y: currentY,
      width: shapeWidth,
      height: shapeHeight,
      name: step.name,
      seq: step.seq_number
    });
    
    // Store connection info
    if (i > 0) {
      const prevStep = layout.steps[i - 1]; // Ambil langkah sebelumnya
      
      // Tentukan titik awal dan akhir panah berdasarkan tipe shape
      let startX, endX;
      
      // Titik awal panah (dari shape sebelumnya)
      if (prevStep.type === 'terminator') {
        // Untuk terminator (lingkaran), gunakan titik di tepi lingkaran 
        // (terminatorRadius adalah jari-jari lingkaran)
        startX = prevStep.x + terminatorRadius;
      } else if (prevStep.type === 'decision') {
        // Untuk decision (diamond), sesuaikan dengan bentuk diamond
        startX = prevStep.x + 60; // Lebar setengah dari diamond
      } else {
        // Untuk shape lain (kotak), gunakan sisi kanan
        startX = prevStep.x + (shapeWidth / 2);
      }
      
      // Titik akhir panah (ke shape saat ini)
      if (step.type === 'terminator') {
        // Untuk terminator (lingkaran), gunakan titik di tepi lingkaran
        endX = currentX - terminatorRadius;
      } else if (step.type === 'decision') {
        // Untuk decision (diamond), sesuaikan dengan bentuk diamond
        endX = currentX - 60; // Lebar setengah dari diamond
      } else {
        // Untuk shape lain (kotak), gunakan sisi kiri
        endX = currentX - (shapeWidth / 2);
      }
      
      layout.connections.push({
        startX: startX,
        startY: currentY,
        endX: endX,
        endY: currentY
      });
    }
    
    currentX += spacing + shapeWidth;
  });
  
  laneLayouts.value[index] = layout;
};

const setSvgRef = (el, index) => {
  if (el) svgRefs.value[index] = el;
};
</script>

<template>
  <div class="bg-white w-11/12 mx-auto mt-8 mb-24">
    <table class="w-full border-2 border-black">
      <tbody>
        <!-- First row with title -->
        <tr>
          <td v-if="props.name" class="border-2 border-black w-10" :rowspan="implementer.length">
            <div class="flex justify-center w-10">
              <p class="-rotate-90 origin-center whitespace-nowrap font-bold text-lg">
                {{ capitalizeWords(props.name) }}
              </p>
            </div>
          </td>
          
          <!-- First implementer row -->
          <BpmnLaneRow
            :implementer="implementer[0]"
            :layout="laneLayouts[0]"
            :svg-ref="setSvgRef"
            :index="0"
          />
        </tr>

        <!-- Remaining rows (starting from index 1) -->
        <tr v-for="(imp, index) in implementer.slice(1)" :key="imp.id">
          <BpmnLaneRow
            :implementer="imp"
            :layout="laneLayouts[index + 1]"
            :svg-ref="setSvgRef"
            :index="index + 1"
          />
        </tr>
      </tbody>
    </table>
  </div>
</template>
