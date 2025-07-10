<script setup>
import { computed } from 'vue';

const props = defineProps({
    x: Number, // Center X of the task
    y: Number, // Center Y of the task
    width: { // This will now act as MINIMUM width
        type: Number,
        default: 120
    },
    height: { // This will now act as MINIMUM height
        type: Number,
        default: 60
    },
    name: String,
    id: String
});

// Constants for text rendering and sizing
const MAX_LINE_LENGTH_TARGET = 15; // Target character length for a line before wrapping
const CHAR_WIDTH_APPROX = 8;       // Approximate pixel width of a character (tune if needed)
const LINE_HEIGHT = 15;            // Pixel height for one line of text (used for tspan dy)
const HORIZONTAL_PADDING = 20;     // Total horizontal padding inside the rect (e.g., 10px each side)
const VERTICAL_PADDING = 20;       // Total vertical padding inside the rect (e.g., 10px each side for the box)

const textLines = computed(() => {
    if (!props.name) return [];

    const lines = [];
    const words = props.name.split(' ');
    let currentLine = '';

    for (const word of words) {
        if (currentLine === '') {
            currentLine = word;
        } else if (currentLine.length + 1 + word.length <= MAX_LINE_LENGTH_TARGET) {
            currentLine += ' ' + word;
        } else {
            lines.push(currentLine);
            currentLine = word;
        }
    }

    if (currentLine !== '') {
        lines.push(currentLine);
    }
    
    // If after processing, lines is empty but name exists (e.g., very short name), use the name as a single line.
    return lines.length > 0 ? lines : (props.name ? [props.name] : []);
});

const computedWidth = computed(() => {
    const linesToMeasure = textLines.value;
    if (linesToMeasure.length === 0) return props.width; // Use min width if no text lines

    const longestLineLength = linesToMeasure.reduce((max, line) => Math.max(max, line.length), 0);
    const requiredTextWidth = longestLineLength * CHAR_WIDTH_APPROX;
    return Math.max(props.width, requiredTextWidth + HORIZONTAL_PADDING);
});

const computedHeight = computed(() => {
    const linesToMeasure = textLines.value;
    if (linesToMeasure.length === 0) return props.height; // Use min height if no text lines
    
    const requiredTextHeight = linesToMeasure.length * LINE_HEIGHT;
    return Math.max(props.height, requiredTextHeight + VERTICAL_PADDING);
});

// Calculate dy for the first tspan to vertically center the text block
const firstTspanDy = computed(() => {
    if (textLines.value.length <= 1) {
        // For a single line, dominant-baseline="central" on <text> handles centering if y is center.
        // Or, if no dominant-baseline, a small adjustment might be needed if font isn't perfectly centered.
        // Assuming dominant-baseline="central" or similar, 0 is fine for one line.
        // If textLines.value.length is 0 or 1, this will be 0 or a small value.
        // Let's adjust for dominant-baseline="central" on text element.
        // The y of text is its center. The first tspan starts there.
        // We need to move it up by half the total height of the preceding lines.
        return -( (textLines.value.length - 1) * LINE_HEIGHT ) / 2;
    }
    return -(textLines.value.length - 1) * (LINE_HEIGHT / 2);
});

</script>

<template>
    <g :id="id">
        <rect 
            :x="x - computedWidth / 2" 
            :y="y - computedHeight / 2" 
            :width="computedWidth" 
            :height="computedHeight" 
            fill="white" stroke="#000" stroke-width="2" rx="10" ry="10" />
        <!-- dominant-baseline="central" helps in vertical centering of text -->
        <text :x="x" :y="y" text-anchor="middle" font-size="13" dominant-baseline="central">
            <tspan 
                v-for="(line, index) in textLines" 
                :key="index" 
                :x="x" 
                :dy="index === 0 ? firstTspanDy : LINE_HEIGHT">
                {{ line }}
            </tspan>
        </text>
    </g>
</template>