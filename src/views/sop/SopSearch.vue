<script setup>
import { inject, onMounted, ref } from 'vue';
import { getAllSop } from '@/api/sopApi';

import IconEye from '@/assets/icons/IconEye.vue';
import DataTable from '@/components/DataTable.vue';
import PulseLoading from '@/components/PulseLoading.vue';
import IconDownload from '@/assets/icons/IconDownload.vue';
import Error from '@/components/Error.vue';

const layoutType = inject('layoutType');
layoutType.value = 'guest';

const data = ref([]);

const fetchData = async () => {
    try {
        data.value = [];
        const result = await getAllSop();
        data.value = result.data;
    } catch (error) {
        data.value = null;
        console.error(error);
    }
};

onMounted(() => {
    fetchData();
})    
</script>

<template>

    <div class="text-center mt-16 mb-8 mx-12 lg:mx-40">
        <h1 class="mb-4 text-3xl font-extrabold leading-none tracking-tight text-gray-900 md:text-4xl lg:text-5xl">
            Prosedur Operasional Standar (SOP)</h1>
        <p class="text-lg font-normal lg:text-xl sm:px-16 xl:px-48">
            Berikut merupakan daftar dokumen SOP yang berlaku di lingkungan<br>
            Departemen Sistem Informasi Universitas Andalas
        </p>
    </div>

    <!-- <form class="max-w-3xl mx-auto mt-12 p-8">   
        <label for="default-search" class="mb-2 text-sm font-medium text-gray-900 sr-only">Search</label>
        <div class="relative">
            <div class="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                <svg class="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
                </svg>
            </div>
            <input type="search" id="default-search" class="block w-full p-4 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Masukkan kata kunci..." required />
            <button type="submit" class="text-white absolute end-2.5 bottom-2.5 bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Search</button>
        </div>
    </form> -->
    <!-- TODO creation date ubah jadi effective date kalau udah ada di api -->
    <!-- TODO data yang tampil hanya yang statusnya sudah berlaku -->
    <div class="container mx-auto p-8 lg:px-32">
        <template v-if="data">
            <DataTable v-if="data.length > 0" 
                :data="data" 
                :columns="[
                    { field: 'name', label: 'Nama', sortable: true },
                    { field: 'creation_date', label: 'Tanggal Efektif', sortable: true },
                    { field: 'org_name', label: 'Organisasi', sortable: true },
                ]" 
                :status-columns="[
                    { field: 'is_active', label: 'Status' }
                ]" 
                :searchable="['name', 'creation_date', 'org_name']" 
                table-type="other"
                :badge-text="['Tidak Berlaku', 'Berlaku', 'Belum Berlaku']"
            >
                <template #link>
                    <router-link :to="{ name: 'DetailSop' }">
                        <button
                            class="text-white bg-[#2557D6] hover:bg-[#2557D6]/90 focus:ring-4 focus:ring-[#2557D6]/50 focus:outline-none font-medium rounded-lg text-sm py-2 px-3 text-center inline-flex items-center me-2 mb-2"
                            title="Lihat detail dokumen">
                            <IconEye class="w-5 mr-3 fill-current" />
                            Lihat
                        </button>
                    </router-link>
                    <!-- TODO hanya bisa diunduh kalau statusnya sudah berlaku -->
                    <!-- TODO buat tombol ni langsung menugnduh dokumen pdf nya -->
                    <router-link :to="{ name: 'DownloadSop' }" target="_blank">
                        <button
                            class="text-white bg-[#2557D6] hover:bg-[#2557D6]/90 focus:ring-4 focus:ring-[#2557D6]/50 focus:outline-none font-medium rounded-lg text-sm py-2 px-3 text-center inline-flex items-center me-2 mb-2"
                            title="Unduh dokumen">
                            <IconDownload class="w-5 mr-3 fill-current" />
                            Unduh
                        </button>
                    </router-link>
                </template>
            </DataTable>
            <PulseLoading v-else-if="data.length == 0" />
        </template>
        <Error @click="fetchData" v-else/>
    </div>

</template>
