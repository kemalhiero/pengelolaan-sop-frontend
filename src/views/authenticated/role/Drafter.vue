<script setup>
import { inject, onMounted, ref } from 'vue';
import { toast } from 'vue3-toastify';

import { addDrafter, getAllDrafter, getDrafterDetail, getUserByRole } from '@/api/userApi';

import Error from '@/components/Error.vue';
import DataTable from '@/components/DataTable.vue';
import EmptyState from '@/components/EmptyState.vue';
import TableSkeleton from '@/components/TableSkeleton.vue';
import XMarkCloseIcon from '@/assets/icons/XMarkCloseIcon.vue';
import AddDataButton from '@/components/modal/AddDataButton.vue';
import PageTitle from '@/components/authenticated/PageTitle.vue';

const layoutType = inject('layoutType');
layoutType.value = 'admin';

const dataDrafter = ref([]);
const dataCandidate = ref([]);
const showAddModal = ref(false);
const selectedDrafter = ref([]);
const isLoading = ref(true);
const hasError = ref(false);
const selectedDataDetail = ref(null);
const showDetailModal = ref(false);

const fetchDrafter = async () => {
    try {
        isLoading.value = true;
        hasError.value = false;
        dataDrafter.value = [];

        const result = await getAllDrafter();
        if (!result.success) {
            hasError.value = true;
            console.error('API Error:', result.error);
            return;
        }

        if (result?.data) {
            dataDrafter.value = result.data;
        }
    } catch (error) {
        console.error('Fetch error:', error);
        hasError.value = true;
    } finally {
        isLoading.value = false;
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

const handleRowClick = async (id) => {
    const response = await getDrafterDetail(id);
    selectedDataDetail.value =  response.data;

    // ubah nilai
    if (response.data.gender == 'pria') {
        selectedDataDetail.value.gender = 'Laki-laki'
    } else if (response.data.gender == 'wanita') {
        selectedDataDetail.value.gender = 'Perempuan'
    }

    if (response.data.role == 'penyusun') {
        selectedDataDetail.value.role = 'Penyusun'
    }

    showDetailModal.value = true;
};

const closeModal = () => {
    showDetailModal.value = false;
    selectedDataDetail.value = null;
};

onMounted(() => {
    fetchDrafter();
    fetchDrafterCandidate();
})

</script>

<template>
    <PageTitle judul="Kelola Penyusun SOP" class="mt-3 mb-7" />

    <div class="container mx-auto p-8 lg:px-16">
        <div class="flex justify-end mb-4">
            <AddDataButton btnLabel="Tambah Penyusun Baru" btn-title="Tambah penyusun sop baru"
                @click="showAddModal = true" />
        </div>

        <div>
            <TableSkeleton v-if="isLoading" :columns="5" :rows="5" />
            <Error v-else-if="hasError" @click="fetchDrafter" />
            <EmptyState v-else-if="!hasError && dataDrafter.length === 0" title="Tidak ada data penyusun!"
                message="Belum ada data penyusun yang tersedia saat ini" @click="fetchDrafter" />
            <DataTable v-else 
                :data="dataDrafter" 
                :columns="[
                    { field: 'id_number', label: 'NIM/NIP', sortable: true, searchable: true },
                    { field: 'name', label: 'Nama', sortable: true, searchable: true },
                    { field: 'org', label: 'Organisasi', sortable: true, searchable: true },
                ]" 
                :status-columns="[
                    { field: 'status', label: 'Status' }
                ]" 
                :badge-text="['Belum ada tugas', 'Sudah memiliki tugas']" 
                :detail-column="true"
                @click="handleRowClick" 
            />
        </div>
    </div>

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
                                { field: 'id_number', label: 'NIP', sortable: true, searchable: true },
                                { field: 'name', label: 'Nama', sortable: true, searchable: true },
                            ]" 
                            :check-column="true" 
                            v-model="selectedDrafter" 
                        />
                    </div>
                    <!-- Modal footer -->
                    <div
                        class="flex items-center p-4 md:p-5 space-x-3 rtl:space-x-reverse border-t border-gray-200 rounded-b">
                        <button type="submit" :disabled="selectedDrafter.length == 0"
                            class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center disabled:cursor-not-allowed disabled:bg-opacity-60">
                            Pilih
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>

    <div v-show="showDetailModal" class="fixed inset-0 z-50 flex items-center justify-center w-full h-full">

        <div class="fixed inset-0 bg-gray-800 bg-opacity-30" @click="closeModal"></div>

        <div class="relative w-full max-w-2xl max-h-full">
            <div class="relative bg-white rounded-lg shadow">

                <!-- Modal header -->
                <div class="flex items-center justify-between p-4 md:p-5 border-b rounded-t">
                    <h3 class="text-xl font-medium text-gray-900">
                        Detail versi SOP
                    </h3>
                    <button type="button"
                        class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center"
                        @click="closeModal">
                        <XMarkCloseIcon class="w-3 h-3" />
                        <span class="sr-only">Tutup modal</span>
                    </button>
                </div>

                <!-- Modal body -->
                <div class="p-4 md:p-5 space-y-4 max-h-[620px] overflow-y-auto">
                    <div class="grid gap-4 grid-cols-2" v-if="selectedDataDetail">
                        <div>
                            <label for="name" class="block mb-2 text-sm font-medium text-gray-900">Nama</label>
                            <input type="text" id="name"
                                class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                                v-model="selectedDataDetail.name" placeholder="belum ada data" readonly>
                        </div>
                        <div>
                            <label for="id-number" class="block mb-2 text-sm font-medium text-gray-900">NIM/NIP</label>
                            <input type="text" id="id-number"
                                class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                                v-model="selectedDataDetail.id_number" placeholder="belum ada data" readonly>
                        </div>
                        <div>
                            <label for="gender" class="block mb-2 text-sm font-medium text-gray-900">Jenis
                                Kelamin</label>
                            <input type="text" id="gender"
                                class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                                v-model="selectedDataDetail.gender" placeholder="belum ada data" readonly>
                        </div>
                        <div>
                            <label for="role" class="block mb-2 text-sm font-medium text-gray-900">Role</label>
                            <input type="text" id="role"
                                class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                                v-model="selectedDataDetail.role" placeholder="belum ada data" readonly>
                        </div>
                        <div>
                            <label for="email" class="block mb-2 text-sm font-medium text-gray-900">Email</label>
                            <input type="text" id="email"
                                class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                                v-model="selectedDataDetail.email" placeholder="belum ada data" readonly>
                        </div>
                        <div>
                            <label for="org" class="block mb-2 text-sm font-medium text-gray-900">Organisasi</label>
                            <input type="text" id="org"
                                class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                                v-model="selectedDataDetail.org" placeholder="belum ada data" readonly>
                        </div>
                        <div class="col-span-2">
                            <label class="block mb-2 text-sm font-medium text-gray-900">Sop yang dikelola</label>
                            <ul class="max-w-2xl space-y-1 list-disc list-inside">
                                <li v-if="selectedDataDetail.sop.length > 0"
                                    v-for="(s, index) in selectedDataDetail.sop" :key="index" class="text-sm">
                                    {{ s.number }} - {{ s.name }}
                                </li>
                                <p v-else class="italic text-gray-400 text-sm">belum ada data!</p>
                            </ul>
                        </div>
                    </div>
                    <p class="text-center" v-else>Belum ada data!</p>
                </div>

                <!-- Modal footer -->
                <div
                    class="flex items-center p-4 md:p-5 space-x-3 rtl:space-x-reverse border-t border-gray-200 rounded-b">
                    <!-- <button type="button"
                        class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center disabled:cursor-not-allowed disabled:bg-opacity-60">
                        Lihat Progres Terkini
                    </button> -->
                </div>
            </div>
        </div>

    </div>

</template>
