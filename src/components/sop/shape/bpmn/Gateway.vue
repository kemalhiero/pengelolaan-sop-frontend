<script setup>
import { computed, ref, onMounted } from 'vue';

const props = defineProps({
    x: Number,
    y: Number,
    name: String,
    id: String
});

const textRef = ref(null);
const textFitsInside = ref(true);

// arahnya dari atas, ke kanan, bawah, kiri
const diamondPath = computed(() => {
    return `M ${props.x} ${props.y - 40} L ${props.x + 40} ${props.y} L ${props.x} ${props.y + 40} L ${props.x - 40} ${props.y} Z`;
});

onMounted(() => {
    if (textRef.value) {
        const textWidth = textRef.value.getBBox().width;
        // Assuming the diamond can fit text of width ~50px
        // Adjust this value based on your specific requirements
        textFitsInside.value = textWidth < 50;
    }
});

const textY = computed(() => {
    return textFitsInside.value ? props.y : props.y + 55;
});
</script>

<template>
    <g>
        <path :d="diamondPath" :id="id" fill="white" stroke="#000" stroke-width="2" />
        <text ref="textRef" :x="x" :y="textY" text-anchor="middle" dominant-baseline="middle" font-size="13">
            {{ name }}
        </text>
    </g>
</template>
