<script setup>
import { inject, onMounted, ref } from 'vue';
import { toast } from 'vue3-toastify';

import { addDrafter, getAllDrafter, getUserByRole } from '@/api/userApi';

import Error from '@/components/Error.vue';
import DataTable from '@/components/DataTable.vue';
import PulseLoading from '@/components/PulseLoading.vue';
import XMarkCloseIcon from '@/assets/icons/XMarkCloseIcon.vue';
import AddDataButton from '@/components/modal/AddDataButton.vue';
import PageTitle from '@/components/authenticated/PageTitle.vue';

const layoutType = inject('layoutType');
layoutType.value = 'admin';

const dataDrafter = ref([]);
const dataCandidate = ref([]);
const showAddModal = ref(false);
const selectedDrafter = ref([]);

const fetchDrafter = async () => {
    try {
        dataDrafter.value = [];
        const result = await getAllDrafter();
        dataDrafter.value = result.data; // Menyimpan data yang di-fetch
    } catch (error) {
        console.error('Fetch error:', error);
    }
};

const fetchDrafterCandidate = async () => {
    try {
        const result = await getUserByRole('sivitas-akademika');
        dataCandidate.value = result.data;
    } catch (error) {
        console.error('Fetch error:', error);
    }
};

const submitDrafter = async () => {
    try {
        console.log('mengirim data penyusun', selectedDrafter.value);

        await Promise.all(
            selectedDrafter.value.map(async (pic) => {
                return await addDrafter({
                    id: pic.id
                });
            })
        );
        
        fetchDrafter();
        fetchDrafterCandidate();

        toast('Berhasil menambahkan penyusun', {
            type: "success",
            autoClose: 3000
        });
        showAddModal.value = false;
    } catch (error) {
        console.error('Fetch error:', error);
        toast(`Data gagal ditambahkan! <br> ${error} `, {
            type: "error",
            autoClose: 5000,
            dangerouslyHTMLString: true
        });
    }
};

onMounted(() => {
    fetchDrafter();
    fetchDrafterCandidate();
})

</script>

<template>
    <main class="p-4 md:ml-64 h-auto pt-20">

        <PageTitle judul="Kelola Penyusun SOP" />

        <div class="container mx-auto p-8 lg:px-16">
            <div class="flex justify-end mb-4">
                <AddDataButton btnLabel="Tambah Penyusun Baru" btn-title="Tambah penyusun sop baru" @click="showAddModal = true" />
            </div>
            
            <!-- TODO permasalahan saat ini kalau datanya memang tidak ada, justru tampilnya loading terus2an, padahal emg datanya yang ngga ada, bukan error -->
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

    <div v-show="showAddModal" class="fixed inset-0 z-50 flex items-center justify-center w-full h-full">
        <div class="fixed inset-0 bg-gray-800 bg-opacity-30" @click="showAddModal = false"></div>
        <div class="relative w-full max-w-2xl max-h-full">
            <!-- Modal content -->
            <div class="relative bg-white rounded-lg shadow">
                <!-- Modal header -->
                <div class="flex items-center justify-between p-4 md:p-5 border-b rounded-t">
                    <h3 class="text-xl font-medium text-gray-900">
                        Centang user yang akan ditugaskan menjadi penyusun
                    </h3>
                    <button type="button"
                        class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center"
                        @click="showAddModal = false">
                        <XMarkCloseIcon class="w-3 h-3" />
                        <span class="sr-only">Tutup</span>
                    </button>
                </div>
                <!-- Modal body -->
                <form @submit.prevent="submitDrafter">
                <div class="p-4 md:p-5 space-y-4">
                    <DataTable 
                        :data="dataCandidate" 
                        :columns="[
                            { field: 'id_number', label: 'NIP', sortable: true },
                            { field: 'name', label: 'Nama', sortable: true },
                        ]"
                        :searchable="['id_number', 'name']"
                        :check-column="true"
                        v-model="selectedDrafter"
                    />
                </div>
                <!-- Modal footer -->
                <div class="flex items-center p-4 md:p-5 space-x-3 rtl:space-x-reverse border-t border-gray-200 rounded-b">
                        <button type="submit" :disabled="selectedDrafter.length == 0"
                            class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center disabled:cursor-not-allowed disabled:bg-opacity-60">
                            Pilih
                        </button>
                </div>
                </form>
            </div>
        </div>
    </div>
</template>
