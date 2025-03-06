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
        <rect :x="x - width / 2" :y="y - height / 2" :width="width" :height="height" fill="white" stroke="#000" stroke-width="2" />
        <text :x="x" :y="y" text-anchor="middle" font-size="13">
            <tspan 
                v-for="(line, index) in textLines" 
                :key="index" 
                :x="x" 
                :dy="index === 0 ? (-(textLines.length - 1) * 7.5) : 15">
                {{ line }}
            </tspan>
        </text>
    </g>
</template>
