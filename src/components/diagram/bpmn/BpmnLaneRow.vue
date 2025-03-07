<script setup>
import BpmnTerminator from './BpmnTerminator.vue';
import BpmnTask from './BpmnTask.vue';
import BpmnDecision from './BpmnDecision.vue';

defineProps({
  implementer: {
    type: Object,
    required: true
  },
  layout: {
    type: Object,
    required: true
  },
  svgRef: {
    type: Function,
    required: true
  },
  index: {
    type: Number,
    required: true
  }
});
</script>

<template>
  <td class="border-2 border-black w-8">
    <div class="flex items-center justify-center w-8">
      <p class="-rotate-90 origin-center whitespace-nowrap font-medium">
        {{ implementer.name }}
      </p>
    </div>
  </td>
  <td class="border-2 border-black p-0">
    <div class="relative overflow-x-auto min-h-[120px]">
      <svg :ref="el => svgRef(el, index)" class="w-full h-full">        
        <!-- Draw shapes -->
        <template v-if="layout && layout.steps">
          <template v-for="step in layout.steps" :key="step.id">
            <!-- Terminator (start/end) -->
            <BpmnTerminator 
              v-if="step.type === 'terminator'"
              :x="step.x"
              :y="step.y"
              :id="`bpmn-step-${step.seq}`"
              :text="step.seq === 1 ? 'Mulai' : 'Selesai'"
            />
            
            <!-- Task (process) -->
            <BpmnTask
              v-else-if="step.type === 'task' || step.type === 'process'"
              :x="step.x"
              :y="step.y"
              :width="step.width"
              :height="step.height"
              :name="step.name"
              :id="`bpmn-step-${step.seq}`"
            />
            
            <!-- Decision (diamond) -->
            <BpmnDecision
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
</template>
