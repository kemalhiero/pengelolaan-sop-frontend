<script setup>
import { ref } from 'vue';

const props = defineProps({
    x: Number,
    y: Number,
    width: {
        type: Number,
        default: 120
    },
    height: {
        type: Number,
        default: 60
    },
    name: String
});

const textLines = ref([]);

// Split text into lines for better display
const processText = () => {
    if (!props.name) return;

    const words = props.name.split(' ');
    let line = '';
    let result = [];

    words.forEach((word, i) => {
        if (line.length + word.length > 15) {
            result.push(line);
            line = word;
        } else {
            line = line ? line + ' ' + word : word;
        }

        if (i === words.length - 1) {
            result.push(line);
        }
    });

    textLines.value = result;
};

processText();
</script>

<template>
    <g>
        <rect :x="x - width / 2" :y="y - height / 2" :width="width" :height="height" fill="white" stroke="#000" />
        <text :x="x" :y="y" text-anchor="middle" dominant-baseline="middle" font-size="12">
            <tspan v-for="(line, index) in textLines" :key="index" :x="x" :dy="index === 0 ? '-10' : '15'">
                {{ line }}
            </tspan>
        </text>
    </g>
</template>
