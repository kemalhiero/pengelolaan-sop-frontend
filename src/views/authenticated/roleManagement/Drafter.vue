<script setup>
import { inject, onMounted, ref } from 'vue';

import { getAllDrafter } from '@/api/userApi';

import PageTitle from '@/components/authenticated/PageTitle.vue';
import DataTable from '@/components/DataTable.vue';
import PulseLoading from '@/components/PulseLoading.vue';
import Error from '@/components/Error.vue';
import AddDataButton from '@/components/modal/AddDataButton.vue';

const layoutType = inject('layoutType');
layoutType.value = 'admin';

const dataDrafter = ref([]);

const fetchDrafter = async () => {
    try {
        dataDrafter.value = [];
        const result = await getAllDrafter();
        dataDrafter.value = result.data; // Menyimpan data yang di-fetch
    } catch (error) {
        console.error('Fetch error:', error);
    }
};

onMounted(() => {
    fetchDrafter();
})

</script>

<template>
    <main class="p-4 md:ml-64 h-auto pt-20">

        <PageTitle judul="Kelola Penyusun SOP" />

        <div class="container mx-auto p-8 lg:px-16">
            <div class="flex justify-end mb-4">
                <AddDataButton btnLabel="Input Peraturan Baru" btn-title="Tambah penyusun sop baru" @click="" />
            </div>
            
            <template v-if="dataDrafter">
                <DataTable v-if="dataDrafter.length > 0" 
                    :data="dataDrafter" 
                    :columns="[
                        { field: 'id_number', label: 'NIM/NIP', sortable: true },
                        { field: 'name', label: 'Nama', sortable: true },
                    ]"
                    :status-columns="[
                        { field: 'status', label: 'Status' }
                    ]" 
                    :searchable="['id_number','name']" 
                    :detail-column="true"
                    :badge-text="['Belum ada tugas', 'Sudah memiliki tugas']" 
                />
                <PulseLoading v-else-if="dataDrafter.length == 0" />
            </template>
            <Error @click="" v-else />
        </div>

    </main>
</template>
