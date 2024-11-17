<script setup>
import CircleQuestionIcon from '@/assets/icons/CircleQuestionIcon.vue';
import { initTooltips } from 'flowbite';
import { onMounted } from 'vue';

const props = defineProps({
    field: {
        type: String,
        required: true
    },
    text: {
        type: String,
        required: true
    },
    tooltipPlacement: {
        type: String,
        default: 'right',
        validator: (value) => ['top', 'right', 'bottom', 'left'].includes(value)
    }
});

onMounted(() => {
    initTooltips();
})

</script>

<template>
    <CircleQuestionIcon class="w-4 mx-2" :data-tooltip-target="`tooltip-${field}`" :data-tooltip-placement="tooltipPlacement" />
    <div :id="`tooltip-${field}`" role="tooltip"
        class="absolute z-10 invisible inline-block px-3 py-1.5 text-sm font-medium text-white bg-gray-900 rounded-lg shadow-sm opacity-0 tooltip">
        {{ text }}
        <div class="tooltip-arrow" data-popper-arrow></div>
    </div>
</template>
