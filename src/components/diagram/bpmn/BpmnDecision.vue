<script setup>
import { computed } from 'vue';

const props = defineProps({
    x: Number,
    y: Number,
    name: String,
    id: String
});

const diamondPath = computed(() => {
    return `M ${props.x} ${props.y - 30} L ${props.x + 60} ${props.y} L ${props.x} ${props.y + 30} L ${props.x - 60} ${props.y} Z`;
});
</script>

<template>
    <g :id="id">
        <path :d="diamondPath" fill="white" stroke="#000" stroke-width="2" />
        <text :x="x" :y="y" text-anchor="middle" dominant-baseline="middle" font-size="12">
            {{ name }}
        </text>
    </g>
</template>
