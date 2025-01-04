<script setup>
import UserSlashIcon from '@/assets/icons/UserSlashIcon.vue';
import { inject } from 'vue';

const layoutType = inject('layoutType');
layoutType.value = null;
</script>

<template>
    <div class="h-screen flex flex-col items-center justify-center">
        <UserSlashIcon class="w-36" />
        <h1 class="mt-4 text-xl text-gray-800">Anda tidak diizinkan mengakses halaman ini</h1>
    </div>
</template>
