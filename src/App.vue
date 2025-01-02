<script setup>
import { provide, ref } from 'vue';
import { RouterView } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
const authStore = useAuthStore();

import AppShell from '@/components/authenticated/AppShell.vue';   // authenticated
import Navbar from '@/components/Navbar.vue';
// import Footer from '@/components/Footer.vue';

authStore.initializeRememberMe();
authStore.initializeAuth();

const layout = ref('guest');
provide('layoutType', layout);
</script>

<template>

  <template v-if="layout">
    <AppShell v-if="layout === 'admin'" />
    <Navbar v-else-if="layout === 'guest'" />
  </template>
  <RouterView />

  <!-- <Footer/> -->

</template>
