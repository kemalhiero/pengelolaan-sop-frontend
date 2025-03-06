/**
 * BpmnTerminator Component
 *
 * This component renders an SVG group containing a circle and a text element,
 * which together represent a BPMN terminator.
 *
 * Props:
 *  - x (Number): The x-coordinate for the center of the circle.
 *  - y (Number): The y-coordinate for the center of the circle.
 *  - text (String): The text displayed at the center of the circle.
 *
 * The circle is drawn with a fixed radius of 30, a white fill, and a black stroke.
 * The text element uses attributes "text-anchor" set to "middle" and "dominant-baseline"
 * set to "middle" to ensure the text is centered both horizontally and vertically.
 */
<script setup>
defineProps({
    x: Number,
    y: Number,
    text: String
});
</script>

<template>
    <g>
        <circle :cx="x" :cy="y" r="40" fill="white" stroke="#000" stroke-width="2" />
        <text :x="x" :y="y" text-anchor="middle" dominant-baseline="middle">{{ text }}</text>
    </g>
</template>
