<script setup>
import WarningTriangle from '@/assets/icons/WarningTriangle.vue';

defineProps({
    text: {
        type: String
    }
})
</script>

<template>
    <p class="mt-2 text-sm text-red-600 inline-flex items-center">
        <WarningTriangle class="w-4 mr-2 fill-current"/>
        <span class="font-medium">Ups</span>&NonBreakingSpace; {{ text }}
    </p>
</template>
