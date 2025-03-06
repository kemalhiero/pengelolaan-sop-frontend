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
        <!-- Arrow marker definition -->
        <defs>
          <marker id="arrowhead-bpmn" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="#000" />
          </marker>
        </defs>
        
        <!-- Draw connections (arrows) first so they appear behind the shapes -->
        <template v-if="layout && layout.connections">
          <path
            v-for="(conn, idx) in layout.connections"
            :key="`conn-${idx}`"
            :d="`M${conn.startX},${conn.startY} L${conn.endX},${conn.endY}`"
            stroke="#000"
            stroke-width="2"
            fill="none"
            marker-end="url(#arrowhead-bpmn)"
          />
        </template>
        
        <!-- Draw shapes -->
        <template v-if="layout && layout.steps">
          <template v-for="step in layout.steps" :key="step.id">
            <!-- Terminator (start/end) -->
            <BpmnTerminator 
              v-if="step.type === 'terminator'"
              :x="step.x"
              :y="step.y"
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
            />
            
            <!-- Decision (diamond) -->
            <BpmnDecision
              v-else-if="step.type === 'decision'"
              :x="step.x"
              :y="step.y"
              :name="step.name"
            />
          </template>
        </template>
      </svg>
    </div>
  </td>
</template>
