<script setup>
import { onMounted, ref, computed } from 'vue';
import BpmnLaneRow from '@/components/sop/shape/bpmn/BpmnLaneRow.vue';
import ArrowConnector from '@/components/sop/shape/ArrowConnector.vue';
import { capitalizeWords } from '@/utils/text';

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
  
  processedSteps.value.forEach((step) => {
    if (step.type === 'decision') {
      // Koneksi untuk kondisi "Yes"
      if (step.id_next_step_if_yes) {
        const targetStep = processedSteps.value.find(s => s.id_step === step.id_next_step_if_yes);
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
        const targetStep = processedSteps.value.find(s => s.id_step === step.id_next_step_if_no);
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
      const nextStep = processedSteps.value.find(s => s.seq_number === step.seq_number + 1);
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
  if (processedSteps.value.length === 0) return;
  
  const sortedSteps = [...processedSteps.value].sort((a, b) => a.seq_number - b.seq_number);

  // Konfigurasi diagram dengan spacing yang optimal
  const baseX = 70; // jarak x awal dari kiri
  const shapeWidth = 120;
  const shapeHeight = 60;
  const spacing = 50; // Jarak standar antar langkah
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

const setSvgRef = (el, index) => {
  if (el) svgRefs.value[index] = el;
};

// Computed property untuk estimasi total width diagram berdasarkan jumlah langkah
const diagramWidth = computed(() => {
  if (processedSteps.value.length === 0) return 0;
  
  const baseX = 60;
  const shapeWidth = 120;
  const spacing = 50;
  
  // Total width adalah posisi x langkah terakhir + lebar langkah + margin tambahan
  const totalSteps = processedSteps.value.length;
  return baseX + totalSteps * (shapeWidth + spacing) + 50; // tambahkan margin kanan 60px
});

onMounted(() => {
  if (props.steps.length > 0) {
    calculateGlobalLayout();
  }
});

const charWidth = 9; // Base width untuk single character (dalam pixels)
const rowHeight = 120; // Asumsi setiap implementer memiliki tinggi 120px
const safetyFactor = 1; // Faktor keamanan untuk lebar teks

const dynamicTitleWidth = computed(() => {
  const maxWidth = props.implementer.length * rowHeight * safetyFactor;
  const textWidth = props.name.length * charWidth;  // Hitung lebar text
  const lineCount = textWidth <= maxWidth ? 1 : Math.ceil(textWidth / maxWidth);
  return (lineCount * 30) + 20;
});
</script>

<template>
  <div class="flex justify-center">
    <div class="overflow-x-auto px-4 lg:px-0 print:px-0">
      <div class="relative bg-white print-page">
        <table class="border-2 border-black relative z-10 w-full md:my-5" :style="{ minWidth: `${diagramWidth}px` }" id="bpmn-container">
          <tbody>
            <tr>
              <td v-if="props.name" class="border-2 border-black w-0 relative" :rowspan="implementer.length">
                <div class="relative h-full" :style="`width: ${dynamicTitleWidth}px;`">
                  <p class="font-bold text-lg -rotate-90 text-center absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                    :class="(props.name.length * charWidth) > (props.implementer.length * rowHeight * safetyFactor) ? 'whitespace-normal' : 'whitespace-nowrap'">
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
        <svg class="absolute inset-0 h-full pointer-events-none z-20 w-fit" :style="{ minWidth: `${diagramWidth}px` }">      
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
    </div>
  </div>
</template>
