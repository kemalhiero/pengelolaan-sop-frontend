<script setup>
import { computed } from 'vue';

const props = defineProps({
  steps: { type: Array, required: true },
  implementer: { type: Array, required: true },
});

// Mengelompokkan steps sesuai implementer
const lanes = computed(() => {
  return props.implementer.map((impl, laneIndex) => {
    const laneSteps = props.steps
      .filter(s => s.id_implementer === impl.id)
      .sort((a, b) => a.seq_number - b.seq_number);
    return {
      ...impl,
      laneIndex,
      steps: laneSteps,
    };
  });
});

// Konstanta pengaturan layout BPMN
const laneHeight = 120;
const totalWidth = 1000;
const stepSpacing = 150; // jarak horizontal antar shape
const stepY = laneHeight / 2; // posisi vertikal (tengah lane)

function computeDiamondPoints(cx, cy, size) {
  // Menghasilkan titik untuk shape diamond (belah ketupat)
  const top = `${cx},${cy - size}`;
  const right = `${cx + size},${cy}`;
  const bottom = `${cx},${cy + size}`;
  const left = `${cx - size},${cy}`;
  return [top, right, bottom, left].join(" ");
}
</script>

<template>
  <div class="overflow-auto border border-gray-300 p-2.5 w-11/12 mx-auto my-8 border-collapse">
    <svg :width="totalWidth" :height="lanes.length * laneHeight + 50">
      <defs>
        <marker
          id="arrow"
          markerWidth="10"
          markerHeight="10"
          refX="10"
          refY="3"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <path d="M0,0 L0,6 L9,3 z" class="fill-black" />
        </marker>
      </defs>
      <!-- Render tiap lane (aktor) -->
      <g v-for="lane in lanes" :key="lane.id" :transform="`translate(0, ${lane.laneIndex * laneHeight})`">
        <!-- Latar belakang lane -->
        <rect x="0" y="0" :width="totalWidth" :height="laneHeight" class="fill-gray-50 stroke-gray-300" />
        <!-- Label lane: nama implementer -->
        <text x="10" y="20" class="text-base font-bold">{{ lane.name }}</text>
        <!-- Render shape tiap step di lane -->
        <g v-for="(step, index) in lane.steps" :key="step.id_step">
          <template v-if="step.type === 'terminator'">
            <!-- Terminator: lingkaran dengan tulisan 'mulai' -->
            <circle :cx="50 + index * stepSpacing" :cy="stepY" r="20" class="fill-green-100 stroke-black" />
            <text :x="50 + index * stepSpacing" :y="stepY" class="text-xs text-center" text-anchor="middle" alignment-baseline="middle">
              mulai
            </text>
          </template>
          <template v-else-if="step.type === 'process'">
            <!-- Task: segi empat dengan nama tahapan -->
            <rect :x="30 + index * stepSpacing" :y="stepY - 20" width="60" height="40" class="fill-blue-100 stroke-black" />
            <text
              :x="30 + index * stepSpacing + 30"
              :y="stepY"
              class="text-xs text-center"
              text-anchor="middle"
              alignment-baseline="middle"
            >
              {{ step.name }}
            </text>
          </template>
          <template v-else-if="step.type === 'decision'">
            <!-- Decision: belah ketupat dengan tulisan 'aktivitas' -->
            <polygon
              :points="computeDiamondPoints(50 + index * stepSpacing, stepY, 20)"
              class="fill-red-100 stroke-black"
            />
            <text :x="50 + index * stepSpacing" :y="stepY" class="text-xs text-center" text-anchor="middle" alignment-baseline="middle">
              aktivitas
            </text>
          </template>
        </g>
        <!-- Tambahkan shape 'selesai' di akhir lane -->
        <g v-if="lane.steps.length">
          <circle :cx="50 + lane.steps.length * stepSpacing" :cy="stepY" r="20" class="fill-yellow-100 stroke-black" />
          <text :x="50 + lane.steps.length * stepSpacing" :y="stepY" class="text-xs text-center" text-anchor="middle" alignment-baseline="middle">
            selesai
          </text>
        </g>
        <!-- Gambar panah antar shape -->
        <g>
          <line
            v-for="(step, index) in lane.steps"
            v-if="index < lane.steps.length - 1"
            :x1="50 + index * stepSpacing"
            :y1="stepY"
            :x2="50 + (index + 1) * stepSpacing - 30"
            :y2="stepY"
            class="stroke-black stroke-2"
            marker-end="url(#arrow)"
          />
          <line
            v-if="lane.steps.length"
            :x1="50 + (lane.steps.length - 1) * stepSpacing"
            :y1="stepY"
            :x2="50 + lane.steps.length * stepSpacing - 20"
            :y2="stepY"
            class="stroke-black stroke-2"
            marker-end="url(#arrow)"
          />
        </g>
      </g>
    </svg>
  </div>
</template>
