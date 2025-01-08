<script setup>
import { inject } from 'vue';

import PageTitle from '@/components/authenticated/PageTitle.vue';
import DataTable from '@/components/DataTable.vue';
import PulseLoading from '@/components/PulseLoading.vue';
import Error from '@/components/Error.vue';
import AddDataButton from '@/components/modal/AddDataButton.vue';

const layoutType = inject('layoutType');
layoutType.value = 'admin';

const data = [
    {id_number: 2011522001, name: 'Kemal', is_active: 1 },
    {id_number: 2011522002, name: 'Muhammad', is_active: 1 },
    {id_number: 2011522003, name: 'Hiero', is_active: 0 },
];
</script>

<template>
    <main class="p-4 md:ml-64 h-auto pt-20">

        <PageTitle judul="Kelola Penyusun SOP" />

        <div class="container mx-auto p-8 lg:px-16">
            <div class="flex justify-end mb-4">
                <AddDataButton btnLabel="Input Peraturan Baru" btn-title="Tambah penyusun sop baru" @click="" />
            </div>

            <template v-if="data">
                <DataTable v-if="data.length > 0" 
                    :data="data" 
                    :columns="[
                        { field: 'id_number', label: 'NIM/NIP', sortable: true },
                        { field: 'name', label: 'Nama', sortable: true },
                    ]"
                    :status-columns="[
                        { field: 'is_active', label: 'Status' }
                    ]" 
                    :searchable="['id_number','name']" 
                    :detail-column="true"
                    :badge-text="['Belum ada tugas', 'Sudah memiliki tugas']" 
                />
                <PulseLoading v-else-if="data.length == 0" />
            </template>
            <Error @click="" v-else />
        </div>

    </main>
</template>
