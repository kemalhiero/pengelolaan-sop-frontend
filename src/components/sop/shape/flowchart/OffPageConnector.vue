<script setup>
defineProps({
    id: {
        type: String,
        required: true
    },
    letter: {
        type: String,
        required: true,
        default: 'A'
    },
    style: {
        type: Object,
        default: () => ({})
    }
});
</script>

<template>
    <div :style="style" class="inline-block">
        <svg width="50" height="60" xmlns="http://www.w3.org/2000/svg">
            <polygon :id="id" points="25,55 5,40 5,5 45,5 45,40" stroke="black" fill="white" stroke-width="2" />
            <text x="50%" y="45%" dominant-baseline="middle" text-anchor="middle" font-size="20" font-family="Arial">{{ letter }}</text>
        </svg>
    </div>
</template>
