<script setup>
import { inject, onMounted, ref } from 'vue';

import { getAllPic } from '@/api/userApi';

import PageTitle from '@/components/authenticated/PageTitle.vue';
import DataTable from '@/components/DataTable.vue';
import PulseLoading from '@/components/PulseLoading.vue';
import Error from '@/components/Error.vue';
import AddDataButton from '@/components/modal/AddDataButton.vue';

const layoutType = inject('layoutType');
layoutType.value = 'admin';

const dataPic = ref([]);

const fetchPic = async () => {
    try {
        dataPic.value = [];
        const result = await getAllPic();
        dataPic.value = result.data;
    } catch (error) {
        console.error('Fetch error:', error);
    }
};

onMounted(() => {
    fetchPic();
})
</script>

<template>
    <main class="p-4 md:ml-64 h-auto pt-20">

        <PageTitle judul="Kelola Penanggung Jawab Labor" />

        <div class="container mx-auto p-8 lg:px-16">
            <div class="flex justify-end mb-4">
                <AddDataButton btnLabel="Tambah PJ Baru" btn-title="Tambah penanggung jawab baru" @click="" />
            </div>

            <template v-if="dataPic">
                <DataTable v-if="dataPic.length > 0" 
                    :data="dataPic" 
                    :columns="[
                        { field: 'id_number', label: 'NIM/NIP', sortable: true },
                        { field: 'name', label: 'Nama', sortable: true },
                        { field: 'org', label: 'Organisasi', sortable: true },
                    ]"
                    :searchable="['id_number','name', 'org']" 
                    :detail-column="true"
                    :badge-text="['Belum ada tugas', 'Sudah memiliki tugas']" 
                />
                <PulseLoading v-else-if="dataPic.length == 0" />
            </template>
            <Error @click="" v-else />
        </div>

    </main>
</template>
