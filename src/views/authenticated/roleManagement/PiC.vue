<script setup>
import { inject, onMounted, ref } from 'vue';
import { toast } from 'vue3-toastify';

import { addPic, getAllPic, getPicCandidate } from '@/api/userApi';

import Error from '@/components/Error.vue';
import DataTable from '@/components/DataTable.vue';
import XMarkCloseIcon from '@/assets/icons/XMarkCloseIcon.vue';
import PageTitle from '@/components/authenticated/PageTitle.vue';
import AddDataButton from '@/components/modal/AddDataButton.vue';
import TableSkeleton from '@/components/TableSkeleton.vue';
import EmptyState from '@/components/EmptyState.vue';

const layoutType = inject('layoutType');
layoutType.value = 'admin';

const dataPic = ref([]);
const dataCandidate = ref([]);
const showAddModal = ref(false);
const selectedPic = ref([]);
const isLoading = ref(true);
const hasError = ref(false);

const fetchPic = async () => {
    try {
        isLoading.value = true;
        hasError.value = false;
        dataPic.value = [];

        const result = await getAllPic();
        if (!result.success) {
            hasError.value = true;
            console.error('API Error:', result.error);
            return;
        }

        if (result?.data) {
            dataPic.value = result.data;
        }
    } catch (error) {
        console.error('Fetch error:', error);
        hasError.value = true;
    } finally {
        isLoading.value = false;
    }
};

const fetchPicCandidate = async () => {
    try {
        dataCandidate.value = [];
        const result = await getPicCandidate();
        dataCandidate.value = result.data;
    } catch (error) {
        console.error('Fetch error:', error);
    }
};

const submitPic = async () => {
    try {
        console.log('mengirim data pj', selectedPic.value);

        await Promise.all(
            selectedPic.value.map(async (pic) => {
                return await addPic({
                    id: pic.id
                });
            })
        );

        fetchPic();
        fetchPicCandidate();

        toast('Berhasil menambahkan penanggung jawab', {
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
    fetchPic();
    fetchPicCandidate();
})
</script>

<template>
    <main class="p-4 md:ml-64 h-auto pt-20">

        <PageTitle judul="Kelola Penanggung Jawab" />

        <div class="container mx-auto p-8 lg:px-16">
            <div class="flex justify-end mb-4">
                <AddDataButton btnLabel="Tambah PJ Baru" btn-title="Tambah penanggung jawab baru" @click="showAddModal = true" />
            </div>

            <div>
                <TableSkeleton 
                    v-if="isLoading"
                    :columns="5"
                    :rows="5"
                />
                <Error v-else-if="hasError" @click="fetchPic" />
                <EmptyState 
                    v-else-if="!hasError && dataPic.length === 0"
                    title="Tidak ada data penanggung jawab!"
                    message="Belum ada data penanggung jawab yang tersedia atau anda belum terdaftar di organisasi yang ada."
                    @click="fetchPic"
                />
                <DataTable v-else
                    :data="dataPic" 
                    :columns="[
                        { field: 'id_number', label: 'NIM/NIP', sortable: true, searchable: true },
                        { field: 'name', label: 'Nama', sortable: true, searchable: true },
                        { field: 'org', label: 'Organisasi', sortable: true, searchable: true },
                    ]"
                    :detail-column="true"
                />
            </div>
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
                        Centang user yang akan ditugaskan menjadi penanggung jawab
                    </h3>
                    <button type="button"
                        class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center"
                        @click="showAddModal = false">
                        <XMarkCloseIcon class="w-3 h-3" />
                        <span class="sr-only">Tutup</span>
                    </button>
                </div>
                <!-- Modal body -->
                
                <div class="p-4 md:p-5 space-y-4">
                    <DataTable 
                        :data="dataCandidate" 
                        :columns="[
                            { field: 'id_number', label: 'NIP', sortable: true, searchable: true },
                            { field: 'name', label: 'Nama', sortable: true, searchable: true },
                        ]" 
                        :check-column="true" 
                        v-model="selectedPic" 
                    />
                </div>
                <!-- Modal footer -->
                <div class="flex items-center p-4 md:p-5 space-x-3 rtl:space-x-reverse border-t border-gray-200 rounded-b">
                    <form @submit.prevent="submitPic">
                        <button type="submit" :disabled="selectedPic.length == 0"
                            class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center disabled:cursor-not-allowed disabled:bg-opacity-60">
                            Pilih
                        </button>
                    </form>
                </div>
            </div>
        </div>

    </div>
</template>
