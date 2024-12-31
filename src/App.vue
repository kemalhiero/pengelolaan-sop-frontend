<script setup>
import { provide, ref } from 'vue';
import { RouterView } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
const authStore = useAuthStore();

import AppShell from '@/components/authenticated/AppShell.vue';   // authenticated
import Navbar from '@/components/Navbar.vue';
// import Footer from '@/components/Footer.vue';

// TODO buat pengecekan, kan ada 4 role nya, sedangkan sekarang cuma ada 2 pembeda tampilan
// if role mahasiswa/dosen or penyusun, layout = guest, else if role = ph or kaprodi, layout = admin

// pengecekan kayaknya langsung di router aja, yang udah ditunjukin sama claude ai

const layout = ref('admin');
authStore.userRole

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
