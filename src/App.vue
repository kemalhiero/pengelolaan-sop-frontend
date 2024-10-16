<script setup>
import { RouterView } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

import Navbar from '@/components/Navbar.vue';
import Footer from '@/components/Footer.vue';

// authenticated
import AppShell from '@/components/authenticated/AppShell.vue';

const authStore = useAuthStore();

</script>

<template>

  <AppShell v-if="authStore.role == 'admin'" />
  <Navbar v-else-if="authStore.role == 'guest'" />
  <RouterView />
  <!-- <Footer/> -->

</template>
