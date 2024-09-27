<template>

  <Navbar v-if="isLoggedOut"/>
    <RouterView/>
  <!-- <Footer/> -->

</template>

<script setup>

  import { ref } from 'vue';
  import {RouterView } from 'vue-router';
  import Navbar from '@/components/Navbar.vue';
  import Footer from '@/components/Footer.vue';

  // authenticated
  import AuthenticatedHome from './views/authenticated/Index.vue';

  // Status login (bisa diambil dari Pinia atau API)
  const isLoggedOut = ref(false); // ganti false dengan status login aktual, misalnya dari Vuex atau API

</script>