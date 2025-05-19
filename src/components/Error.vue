<script setup>
import FeatherIcon from '@/assets/icons/FeatherIcon.vue';
</script>

<template>
    <div class="bg-white my-6 p-6 rounded-lg shadow-lg text-center print:hidden">
      <FeatherIcon class="w-16 mx-auto" />
      <p class="text-xl font-semibold mt-4">Terjadi error!</p>
      <p class="mt-2">Silakan coba lagi atau hubungi pihak jurusan!</p>
      <button @click="$emit('click')" class="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-600 focus:outline-none">
        Coba Lagi
      </button>
    </div>
</template>
