<script setup>
defineProps({
    key: Number,
    startX: Number,
    startY: Number,
    endX: Number,
    endY: Number
});
</script>

<template>
    <path :d="`M ${startX} ${startY} L ${endX} ${endY}`" stroke="#000" stroke-width="2" marker-end="url(#arrowhead-bpmn)"
        fill="none" />
</template>
