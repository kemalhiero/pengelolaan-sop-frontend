<script setup>
defineProps({
    id: String,
    x: Number,
    y: Number,
    text: String
});
</script>

<template>
    <g :id="id">
        <circle :cx="x" :cy="y" r="37" fill="white" stroke="#000" stroke-width="2" />
        <text :x="x" :y="y" text-anchor="middle" dominant-baseline="middle">{{ text }}</text>
    </g>
</template>
