<script setup>
 defineProps({
    judul: {
        type: String,
        required: true
    }
 })
</script>

<template>
    <div class="text-center">
        <h1 class="text-3xl font-extrabold leading-none tracking-tight text-gray-900 lg:text-4xl">
            {{ judul }}
        </h1>
    </div>
</template>
