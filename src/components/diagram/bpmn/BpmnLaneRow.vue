<script setup>
import BpmnTask from './BpmnTask.vue';
import BpmnDecision from './BpmnDecision.vue';
import BpmnConnector from './BpmnConnector.vue';
import BpmnTerminator from './BpmnTerminator.vue';

import capitalizeWords from '@/utils/capitalizeWord';

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
        {{ capitalizeWords(implementer.name) }}
      </p>
    </div>
  </td>
  <td class="border-2 border-black p-0">
    <div class="relative overflow-x-auto min-h-[120px]">
      <svg :ref="el => svgRef(el, index)" class="w-full h-full">
        <defs>
          <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="#000" />
          </marker>
        </defs>
        
        <template v-if="layout">
            <BpmnTerminator 
                v-for="step in layout.steps.filter(s => s.type === 'terminator')"
                :key="step.id"
                :x="step.x"
                :y="step.y"
                :text="step.seq === 1 ? 'Mulai' : 'Selesai'"
            />
          
            <BpmnTask
                v-for="step in layout.steps.filter(s => s.type === 'task')"
                :key="step.id"
                :x="step.x"
                :y="step.y"
                :width="step.width"
                :height="step.height"
                :name="step.name"
            />
          
            <BpmnDecision
                v-for="step in layout.steps.filter(s => s.type === 'decision')"
                :key="step.id"
                :x="step.x"
                :y="step.y"
                :name="step.name"
            />
          
            <BpmnConnector
                v-for="(conn, idx) in layout.connections"
                :key="idx"
                :startX="conn.startX"
                :startY="conn.startY"
                :endX="conn.endX"
                :endY="conn.endY"
            />
        </template>
      </svg>
    </div>
  </td>
</template>
