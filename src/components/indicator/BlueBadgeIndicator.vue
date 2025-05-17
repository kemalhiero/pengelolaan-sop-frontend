<template>
    <span
        class="inline-flex items-center justify-center bg-blue-300 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
        <span class="w-2 h-2 me-1 bg-blue-500 rounded-full"></span>
        {{ teks }}
    </span>
</template>

<script setup>
    defineProps({
        teks: {
            type: String,
            required: true
        }
    })
</script>