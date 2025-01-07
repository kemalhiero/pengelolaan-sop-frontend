<script setup>
import { inject } from 'vue';
import PageTitle from '@/components/authenticated/PageTitle.vue';

const layoutType = inject('layoutType');
layoutType.value = 'admin';
</script>

<template>
    <main class="p-4 md:ml-64 h-auto pt-20">

        <PageTitle judul="Kelola Penanggung Jawab Labor" />

        <div class="container mx-auto p-8 lg:px-32">
        </div>

    </main>
</template>
