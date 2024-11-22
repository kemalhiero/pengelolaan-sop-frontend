<script setup>
import WarningTriangle from '@/assets/icons/WarningTriangle.vue';

defineProps({
    text: {
        type: String
    }
})
</script>

<template>
    <p class="mt-2 text-sm text-yellow-400 inline-flex items-center">
        <WarningTriangle class="w-4 mr-2 fill-current"/>
        <span class="font-medium">Ups, ada yang terlewat.</span>&NonBreakingSpace; {{ text }}
    </p>
</template>
