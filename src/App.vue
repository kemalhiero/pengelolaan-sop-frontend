<script setup>
import { provide, ref } from 'vue';
import { RouterView } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

import AppShell from '@/components/authenticated/AppShell.vue';   // authenticated
import Navbar from '@/components/Navbar.vue';

const authStore = useAuthStore();
authStore.initializeRememberMe();
authStore.initializeAuth();

const layout = ref('');
provide('layoutType', layout);
</script>

<template>

  <template v-if="layout">
    <AppShell v-if="layout === 'admin'" />
    <Navbar v-else-if="layout === 'guest'" />
    <div v-else></div>
  </template>

  <main :class="layout === 'admin' ? 'p-4 md:ml-64 h-auto pt-20 print:ml-0' : ''">
    <RouterView />
  </main>

</template>

<style>
/* cari cara supaya opsi pada dialognya langsung a4 dan tata letaknya lanskap */
@media print {
  body {
    margin: 0; /* Hilangkan margin default browser */
  }
  .print-break-after-page {
    break-after: page;
    page-break-after: always;
  }
}
</style>
