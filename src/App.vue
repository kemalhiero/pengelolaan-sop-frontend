<script setup>

  import { ref } from 'vue';
  import { RouterView } from 'vue-router';
  import Navbar from '@/components/Navbar.vue';
  import Footer from '@/components/Footer.vue';
  
  // authenticated
  import AppShell from '@/components/authenticated/AppShell.vue';

  // Status login (bisa diambil dari Pinia atau API)
  const isLoggedOut = ref(false); // ganti false dengan status login aktual, misalnya dari Vuex atau API

</script>

<template>

  <Navbar v-if="isLoggedOut"/>
  <AppShell v-else/>
    <RouterView/>
  <!-- <Footer/> -->

</template>
