<template>
  <div class="flex justify-center items-center h-full min-h-[300px]">
    <h2 class="text-center text-lg text-gray-500">{{ message }}</h2>
  </div>
</template>

<script setup>
defineProps({
  message: {
    type: String,
    default: 'Belum ada data yang tersedia saat ini'
  }
});
</script>
