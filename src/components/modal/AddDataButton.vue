<script setup>
import CirclePlusIcon from '@/assets/icons/CirclePlusIcon.vue';

defineProps({
    btnTitle: {
        type: String,
        Required: false
    },
    btnLabel: {
        type: String,
        Required: true
    }
})
</script>

<template>
    <button @click="$emit('click')"
        class="text-white bg-[#2557D6] hover:bg-[#2557D6]/90 focus:ring-4 focus:ring-[#2557D6]/50 focus:outline-none font-medium rounded-lg text-sm py-2 px-3 text-center inline-flex items-center me-2 mb-2 ml-auto"
        :title="btnTitle" type="button">
        <CirclePlusIcon class="w-5 mr-3 fill-current" />
        {{ btnLabel }}
    </button>
</template>
