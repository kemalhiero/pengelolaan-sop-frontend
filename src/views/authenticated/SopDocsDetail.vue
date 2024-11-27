<script setup>
import { ref, nextTick } from 'vue';
import SopDetail from '../sop/SopDetail.vue';
import PulseLoading from "@/components/PulseLoading.vue";

// State untuk menandakan loading
const loading = ref(true);

// Setelah SopDetail dirender, set loading menjadi false
nextTick(() => {
  loading.value = false;
});
</script>

<template>
    <main class="p-4 md:ml-64 h-auto pt-20">
      <!-- TODO buat data mengenai sop serta list versi yang ada untuk sop yang terkait -->
        <PulseLoading v-if="loading"/>
        <SopDetail v-else/>
    </main>
</template>