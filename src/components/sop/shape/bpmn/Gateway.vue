<script setup>
import { computed } from 'vue';

const props = defineProps({
    x: Number,
    y: Number,
    name: String,
    id: String
});

// arahnya dari atas, ke kanan, bawah, kiri
const diamondPath = computed(() => {
    return `M ${props.x} ${props.y - 40} L ${props.x + 40} ${props.y} L ${props.x} ${props.y + 40} L ${props.x - 40} ${props.y} Z`;
});
</script>

<template>
    <g><path :d="diamondPath" :id="id" fill="white" stroke="#000" stroke-width="2" /></g>
</template>
