<script setup>
import { inject, onMounted } from "vue";

import PageTitle from "@/components/authenticated/PageTitle.vue";
import DataTable from "@/components/DataTable.vue";

const layoutType = inject('layoutType');
layoutType.value = 'admin';

const data = [
    { nama: 'sepuh', umpan_balik: 'kelas king', tanggal: '2021/25/09' },
    { nama: 'donatur kampus', umpan_balik: 'kerja bagus', tanggal: '2024/25/09' },
    { nama: 'kucing si', umpan_balik: 'kerja bagus', tanggal: '2024/02/09' },
    { nama: 'prabowo', umpan_balik: 'kelas king', tanggal: '2024/03/09' },
];

const handleRowClick = (id) => {};

onMounted(() => {});
</script>

<template>
    <main class="p-4 md:ml-64 h-auto pt-20">

        <PageTitle judul="Umpan Balik terhadap SOP yang Dikelola" />

        <div class="container mx-auto p-8 lg:px-16">
            <DataTable
                :data="data" 
                :columns="[
                    { field: 'nama', label: 'Nama', sortable: true, searchable: true },
                    { field: 'umpan_balik', label: 'Komentar', sortable: true, searchable: true },
                    { field: 'tanggal', label: 'Waktu', sortable: true, searchable: true },
                ]" 
                :detail-column="true" 
                @click="handleRowClick" 
            />
        </div>

    </main>
</template>
