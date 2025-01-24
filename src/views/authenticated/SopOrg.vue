<script setup>
import { toast } from 'vue3-toastify';
import { inject, onMounted, ref } from 'vue';
import { getUnassignedPic, getUserByRole } from '@/api/userApi';
import { getOrg, createOrg, updateOrg, deleteOrg } from '@/api/orgApi.js';

import DeleteDataModal from '@/components/modal/DeleteDataModal.vue';
import WarningText from '@/components/validation/WarningText.vue';
import PenToSquareIcon from '@/assets/icons/PenToSquareIcon.vue';
import PageTitle from '@/components/authenticated/PageTitle.vue';
import AddDataButton from '@/components/modal/AddDataButton.vue';
import XMarkCloseIcon from '@/assets/icons/XMarkCloseIcon.vue';
import TrashCanIcon from '@/assets/icons/TrashCanIcon.vue';
import DataTable from '@/components/DataTable.vue';
import Error from '@/components/Error.vue';
import TableSkeleton from '@/components/TableSkeleton.vue';
import EmptyState from '@/components/EmptyState.vue';

const layoutType = inject('layoutType');
layoutType.value = 'admin';

const sopModalStep = ref(1);
const data = ref([]);
const defaultFormState = {
    pic: [],
    name: '',
    about: '',
};
const form = ref({ ...defaultFormState });
const dataUnassignedPic = ref([]);      //untuk tambah data
const dataAllPic = ref([]);             //untuk perbarui data
const modalHeaderText = ref('');
const modalType = ref('');
const showModalDelete = ref(false);
const selectedDeleteId = ref(null);
const showModal = ref(false);
const selectedUpdateId = ref(null);
const defaultWarningTextState = {
    name: false,
    pic: false,
};
const showWarningText = ref({...defaultWarningTextState});
let dataYangDitemukan;
const isLoading = ref(true);
const hasError = ref(false);

// Fungsi untuk mereset form ke nilai default
const resetForm = () => {
    form.value = { ...defaultFormState };
};

const fetchDataPic = async () => {
    try {
        dataUnassignedPic.value = [];
        let result = await getUnassignedPic();
        dataUnassignedPic.value = result.data;
        result = await getUserByRole('pj');
        dataAllPic.value = result.data;
        result = null;
    } catch (error) {
        data.value = null;
        console.error('Fetch error:', error);
    }
};

const fetchDataOrg = async () => {
    try {
        isLoading.value = true;
        hasError.value = false;
        data.value = [];

        const result = await getOrg();
        if (!result.success) {
            hasError.value = true;
            console.error('API Error:', result.error);
            return;
        }
        if (result?.data) {
            data.value = result.data;
        }
    } catch (error) {
        console.error('Error fetching items:', error);
        hasError.value = true;
    } finally {
        isLoading.value = false;
    }
};

const openAddModal = () => {
    resetForm(); // Reset form sebelum membuka modal
    modalHeaderText.value = 'Tambahkan organisasi baru';
    modalType.value = 'add';
    sopModalStep.value = 1;
    showWarningText.value.name = false
    showModal.value = true;
};

const closeModal = () => {
    resetForm();
    showModal.value = false;
    sopModalStep.value = 1;
    modalHeaderText.value = '';
    selectedUpdateId.value = null;
    showWarningText.value = { ...defaultWarningTextState };
};

const addData = async () => {
    try {
        if (form.value.pic.length == 0) {
            showWarningText.value.pic = true;
            return;
        }

        const newItem = {
            pic: form.value.pic,
            name: form.value.name,
            about: form.value.about,
        };

        await createOrg(newItem);
        resetForm();

        showModal.value = false;
        fetchDataOrg(); // refresh item list
        fetchDataPic();
        sopModalStep.value == 1;

        toast("Data berhasil ditambahkan!", {
            type: "success",
            autoClose: 3000,
        });

    } catch (error) {
        console.error('Error adding item:', error);
    }
};

// hapus data
const openDeleteModal = (id) => {
    selectedDeleteId.value = id; // Menyimpan ID yang dipilih
    showModalDelete.value = true; // Tampilkan modal
};

const closeDeleteModal = () => {
    showModalDelete.value = false; // Sembunyikan modal
    selectedDeleteId.value = null; // Reset ID setelah modal ditutup
};

const deleteData = async (id) => {  // Fungsi untuk menghapus data berdasarkan ID
    try {
        const response = await deleteOrg(id);
        console.log(response);

        // Lakukan penghapusan item dari array data
        data.value = data.value.filter(item => item.id !== id);
        closeDeleteModal(); // Tutup modal setelah penghapusan

        toast("Data berhasil dihapus!", {
            type: "success",
            autoClose: 3000,
        });

        console.log(`Data dengan ID ${id} berhasil dihapus`);
    } catch (error) {
        console.error('Delete error:', error);
    }
};

// Update fungsi openUpdateModal
const openUpdateModal = (id) => {
    resetForm();
    selectedUpdateId.value = id;
    modalHeaderText.value = 'Perbarui data organisasi';
    modalType.value = 'edit';
    showModal.value = true;
    sopModalStep.value = 1;

    dataYangDitemukan = data.value.find(item => item.id === id);
    if (dataYangDitemukan) {
        form.value = {
            pic: dataYangDitemukan.pic,
            name: dataYangDitemukan.name,
            about: dataYangDitemukan.about,
        };
        console.log('Form value setelah diset:', form.value);
    } else {
        console.log("Data tidak ditemukan");
    }
    sopModalStep.value == 1;
};

const updateData = async () => {  // Fungsi untuk menghapus data berdasarkan ID
    try {
        if (form.value.pic.length == 0) {
            showWarningText.value.pic = true;
            return;
        }
        const newItem = {
            pic: form.value.pic,
            name: form.value.name,
            about: form.value.about,
        };

        await updateOrg(selectedUpdateId.value, newItem);
        showModal.value = false;
        fetchDataOrg();

        toast("Data berhasil diperbarui!", {
            type: "success",
            autoClose: 3000,
        });

    } catch (error) {
        console.error('Update error:', error);
    }
};

const nextStep = () => {
    if (sopModalStep.value == 1) {
        if (!form.value.name) {
            showWarningText.value.name = true;
        } else {
            sopModalStep.value++;
        }
    } else if (sopModalStep.value == 2) {
        // if (form.value.pic.length == 0) {
        //     showWarningText.value.pic = true;
        // }
    }
};

onMounted(() => {
    fetchDataOrg();
    fetchDataPic();
});
</script>

<template>
    <main class="p-4 md:ml-64 h-auto pt-20">

        <PageTitle judul="Daftar Organisasi yang Dikelola" />

        <div class="container mx-auto p-8 lg:px-16">
            <div class="flex justify-end mb-4">
                <AddDataButton btnLabel="Input Organisasi Baru" @click="openAddModal" />
            </div>

            <div>
                <TableSkeleton 
                    v-if="isLoading"
                    :columns="4"
                    :rows="4"
                />
                <Error v-else-if="hasError" @click="fetchDataOrg" />
                <EmptyState 
                    v-else-if="!hasError && data.length === 0"
                    title="Tidak ada data organisasi!"
                    message="Belum ada data organisasi yang tersedia saat ini"
                    @click="fetchDataOrg"
                />
                <div v-else class="relative overflow-x-auto shadow-md sm:rounded-lg">
                    <table class="w-full text-sm text-left text-gray-500">
                        <thead class="text-xs text-gray-900 uppercase bg-gray-50">
                            <tr>
                                <th scope="col" class="px-6 py-3">
                                    Nama
                                </th>
                                <th scope="col" class="px-6 py-3">
                                    Penanggung Jawab
                                </th>
                                <th scope="col" class="px-6 py-3">
                                    Jumlah SOP
                                </th>
                                <th scope="col" class="px-6 py-3">
                                    Keterangan
                                </th>
                                <th scope="col" class="px-6 py-3">
                                    <span class="sr-only">Edit</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(item, index) in data" :key="index" class="bg-white border-b">
                                <th scope="row" class="px-6 py-4 font-medium text-gray-900">
                                    {{ item.name }}
                                </th>
                                <td class="px-6 py-4">
                                    <ul v-if="item.pic.length > 0" class="list-disc">
                                        <li v-for="itempic in item.pic">{{ itempic.name }}</li>
                                    </ul>
                                    <p v-else>-</p>
                                </td>
                                <td class="px-6 py-4">
                                    {{ item.total_sop }}
                                </td>
                                <td class="px-6 py-4">
                                    {{ item.about }}
                                </td>
                                <td class="px-6 py-4 flex justify-evenly">
                                    <button :title="`Edit organisasi ${index + 1}`" @click="openUpdateModal(item.id)"
                                        class="px-3 py-2 h-9 mx-2 text-white bg-yellow-400 rounded-lg hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:ring-opacity-50 inline-flex">
                                        <PenToSquareIcon class="fill-current w-4" />
                                    </button>
                                    <button :title="`Hapus item ${index + 1}`" @click="openDeleteModal(item.id)" v-if="item.id != 0 && item.total_sop == 0"
                                        class="px-3 py-2 h-9 mx-2 text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 inline-flex">
                                        <TrashCanIcon class="fill-current w-4" />
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <DeleteDataModal 
            :showModal="showModalDelete"
            :deleteData="deleteData" 
            :selectedId="selectedDeleteId"
            @update:showModal="showModalDelete = $event" 
        />

    </main>

    <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center w-full h-full">
        <!-- Overlay gelap -->
        <div class="fixed inset-0 bg-gray-800 bg-opacity-30" @click="closeModal"></div>

        <!-- Modal content -->
        <div class="relative p-4 max-w-2xl max-h-full z-10">
            <div class="relative bg-white rounded-lg shadow">
                <!-- Modal header -->
                <div class="flex items-center justify-between p-4 md:p-5 border-b rounded-t">
                    <h3 class="text-lg font-semibold text-gray-900">
                        {{ modalHeaderText }}
                    </h3>
                    <button
                        class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center"
                        type="button" @click="closeModal">
                        <XMarkCloseIcon class="w-3 h-3" />
                        <span class="sr-only">Tutup modal</span>
                    </button>
                </div>

                <ol
                    class="flex items-center w-full px-3 pt-2 space-x-2 text-sm font-medium text-center text-gray-500 sm:text-base sm:px-4 sm:space-x-4 justify-center">
                    <li class="flex items-center"
                        :class="{ 'text-blue-600': modalType == 'add', 'text-yellow-400': modalType == 'edit' }">
                        <span
                            class="flex items-center justify-center w-5 h-5 me-2 text-xs border border-blue-600 rounded-full shrink-0"
                            :class="{ 'border-blue-600': modalType == 'add', 'border-yellow-400': modalType == 'edit' }">
                            1
                        </span>
                        Isi Info
                        <svg class="w-3 h-3 ms-2 sm:ms-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"
                            fill="none" viewBox="0 0 12 10">
                            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="m7 9 4-4-4-4M1 9l4-4-4-4" />
                        </svg>
                    </li>
                    <li class="flex items-center"
                        :class="{ 'text-blue-600': sopModalStep == 2 && modalType == 'add', 'text-yellow-400': sopModalStep == 2 && modalType == 'edit', }">
                        <span class="flex items-center justify-center w-5 h-5 me-2 text-xs border rounded-full shrink-0"
                            :class="{ 'border-gray-500': sopModalStep != 2, 'border-blue-600': sopModalStep == 2 && modalType == 'add', 'border-yellow-400': sopModalStep == 2 && modalType == 'edit' }">
                            2
                        </span>
                        Pilih PJ
                    </li>
                </ol>

                <div class="p-4 md:p-5">
                    <div v-show="sopModalStep == 1" class="mb-4 min-w-96">
                        <div>
                            <label for="name" class="block mb-2 text-sm font-medium text-gray-900">Nama<span
                                    class="text-red-600">*</span></label>
                            <input type="text" 
                                id="name" 
                                v-model="form.name"
                                class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                                placeholder="Mis. Laboratorium Aplikasi Perusahaan" required minlength="5"
                                maxlength="100">
                            <WarningText v-if="showWarningText.name" text="Harap isi data nama terlebih dahulu!" />
                        </div>
                        <div>
                            <label for="about" class="block mb-2 text-sm font-medium text-gray-900">Keterangan</label>
                            <textarea id="about" rows="4" v-model="form.about"
                                class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                                placeholder="ketikkan keterangan tambahan mengenai organisasi"></textarea>
                        </div>
                    </div>
                    <div v-show="sopModalStep == 2" class="mb-5 min-w-96">
                        <div v-if="modalType == 'add'">
                            <DataTable
                                :data="dataUnassignedPic" 
                                :columns="[
                                    { field: 'id_number', label: 'NIM/NIP', sortable: true, searchable: true },
                                    { field: 'name', label: 'Nama', sortable: true, searchable: true },
                                ]" 
                                :check-column="true" 
                                v-model="form.pic" 
                            />
                        </div>
                        <div v-else-if="modalType == 'edit'">
                            <DataTable
                                :data="dataAllPic" 
                                :columns="[
                                    { field: 'id_number', label: 'NIM/NIP', sortable: true, searchable: true },
                                    { field: 'name', label: 'Nama', sortable: true, searchable: true },
                                ]" 
                                :check-column="true" 
                                v-model="form.pic" 
                            />
                        </div>
                        <WarningText v-if="showWarningText.pic" text="Pilih penanggung jawab terlebih dahulu!" />
                    </div>
                    <div class="flex justify-between items-center">
                        <button :disabled="sopModalStep == 1" @click="sopModalStep--"
                            class="text-white inline-flex items-center focus:ring-4 focus:outline-none font-medium rounded-lg text-sm px-5 py-2.5 text-center disabled:opacity-50 disabled:cursor-not-allowed"
                            :class="{ 'bg-blue-700 hover:bg-blue-800 focus:ring-blue-300': modalType == 'add', 'bg-yellow-400 hover:bg-yellow-500 focus:ring-yellow-300': modalType == 'edit' }">
                            Kembali
                        </button>
                        <button @click="nextStep" :disabled="sopModalStep == 2" v-if="sopModalStep != 2"
                            class="text-white inline-flex items-center focus:ring-4 focus:outline-none font-medium rounded-lg text-sm px-5 py-2.5 text-center disabled:opacity-50 disabled:cursor-not-allowed"
                            :class="{ 'bg-blue-700 hover:bg-blue-800 focus:ring-blue-300': modalType == 'add', 'bg-yellow-400 hover:bg-yellow-500 focus:ring-yellow-300': modalType == 'edit' }">
                            Lanjut
                        </button>
                        <button v-else-if="modalType == 'add'" @click="addData" type="button"
                            class="text-white inline-flex items-center  focus:ring-4 focus:outline-none font-medium rounded-lg text-sm px-5 py-2.5 text-center bg-blue-700 hover:bg-blue-800 focus:ring-blue-300">
                            Submit
                        </button>
                        <button v-else-if="modalType == 'edit'" @click="updateData" type="button"
                            class="text-white inline-flex items-center  focus:ring-4 focus:outline-none font-medium rounded-lg text-sm px-5 py-2.5 text-center bg-yellow-400 hover:bg-yellow-500 focus:ring-yellow-300">
                            Perbarui
                        </button>
                    </div>
                </div>

            </div>
        </div>
    </div>
</template>
