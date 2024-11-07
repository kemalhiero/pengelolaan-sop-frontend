<script setup>
import { nextTick, onMounted, ref } from "vue";
import { DataTable } from "simple-datatables";
import { initModals } from "flowbite";
import { getLawType } from "@/api/lawTypeApi";
import { getLawBasis, createLawBasis, updateLawBasis, deleteLawBasis } from "@/api/lawBasisApi";

import IconSort from "@/assets/icons/IconSort.vue";
// import IconEye from "@/assets/icons/IconEye.vue";
// import GreenBadgeIndicator from "@/components/indicator/GreenBadgeIndicator.vue";
// import RedBadgeIndicator from "@/components/indicator/RedBadgeIndicator.vue";
import CirclePlusIcon from "@/assets/icons/CirclePlusIcon.vue";
import PenToSquareIcon from "@/assets/icons/PenToSquareIcon.vue";
import TrashCanIcon from "@/assets/icons/TrashCanIcon.vue";
import XMarkCloseIcon from "@/assets/icons/XMarkCloseIcon.vue";
import ExclamationMarkIcon from "@/assets/icons/ExclamationMarkIcon.vue";

const tipePeraturan = ref([]);
const table = ref(null); // Menyimpan instance DataTable
const data = ref([]);
const form = ref({
    id_law_type: '',
    number: null,
    year: null,
    about: ''
});
const isSucces = ref(null);
const operation = ref('');

const fetchTipePeraturan = async () => {
    try {
        const result = await getLawType();
        tipePeraturan.value = result.data; // Menyimpan data yang di-fetch
    } catch (error) {
        console.error('Fetch error:', error);
    }
};

// Fetch data untuk tabel
const fetchData = async () => {
    try {
        const response = await getLawBasis();
        data.value = response.data; // Update data tabel
        await nextTick(); // Tunggu sampai data di-render di DOM

        // Jika DataTable belum diinisialisasi, buat instance baru
        if (!table.value) {
            const tableElement = document.getElementById("default-table");
            if (tableElement) {
                table.value = new DataTable(tableElement, {
                    searchable: true,
                    sortable: true,
                });
            }
        } else {
            // Jika DataTable sudah ada, cukup refresh data yang ada
            table.value.destroy(); // Hancurkan instance DataTable sebelumnya
            const tableElement = document.getElementById("default-table");
            table.value = new DataTable(tableElement, {
                searchable: true,
                sortable: true,
            });
        }

    } catch (error) {
        console.error('Fetch error:', error);
    }
};

const submitData = async () => {
    operation.value = 'post'
    try {
        await createLawBasis(form.value);

        isSucces.value = 'yes';
        form.value = {
            id_law_type: '',
            number: '',
            year: '',
            about: ''
        };

        fetchData();

    } catch (error) {
        console.error('Error saat mengirim data:', error);
        isSucces.value = 'no';
    }
};

// Hapus data
const showModalDelete = ref(false);
const selectedDeleteId = ref(null);

const openDeleteModal = (id) => {
    console.log('id delete', id);
    selectedDeleteId.value = id; // Menyimpan ID yang dipilih
    showModalDelete.value = true; // Tampilkan modal
};

const closeDeleteModal = () => {
    showModalDelete.value = false; // Sembunyikan modal
    selectedDeleteId.value = null; // Reset ID setelah modal ditutup
};

const deleteData = async (id) => {  // Fungsi untuk menghapus data berdasarkan ID
    operation.value = 'delete'
    try {
        const response = await deleteLawBasis(id);
        console.log(response);

        // Lakukan penghapusan item dari array data
        data.value = data.value.filter(item => item.id_legal !== id);
        closeDeleteModal(); // Tutup modal setelah penghapusan
        isSucces.value = 'yes'

        console.log(`Data dengan ID ${id} berhasil dihapus`);
    } catch (error) {
        isSucces.value = 'no'
        console.error('Delete error:', error);
    }
};

// Fungsi untuk memperbarui data
const showModalUpdate = ref(false);
const selectedUpdateId = ref(null);
let dataYangDitemukan;

const openUpdateModal = (id) => {
    console.log('id update', id)
    selectedUpdateId.value = id; // Menyimpan ID yang dipilih
    showModalUpdate.value = true; // Tampilkan modal
    const dataModal = data.value;


    for (let i = 0; i < dataModal.length; i++) {
        if (dataModal[i].id_legal === id) {
            dataYangDitemukan = dataModal[i];
            break; // Keluar dari loop setelah data ditemukan
        }
    }

    form.value = { ...dataYangDitemukan };

    if (dataYangDitemukan) {
        console.log(dataYangDitemukan);
    } else {
        console.log("Data tidak ditemukan");
    }
};

const closeUpdateModal = () => {
    showModalUpdate.value = false; // Sembunyikan modal
    selectedUpdateId.value = null; // Reset ID setelah modal ditutup

    form.value = {
        id_law_type: '',
        number: '',
        year: '',
        about: ''
    };
};

const updateData = async (id) => {  // Fungsi untuk menghapus data berdasarkan ID
    operation.value = 'update'
    try {
        const response = await updateLawBasis(id, form.value);
        console.log(response);

        isSucces.value = 'yes'
        console.log(`Data dengan ID ${id} berhasil diperbarui`);

        fetchData();
        closeUpdateModal(); // Tutup modal setelah penghapusan

    } catch (error) {
        isSucces.value = 'no'
        console.error('Update error:', error);
    }
};


onMounted(async () => {
    initModals(); // Inisialisasi modals jika diperlukan
    fetchTipePeraturan();
    fetchData(); // Ambil data tabel
});
</script>

<template>
    <main class="p-4 md:ml-64 h-auto pt-20">

        <div class="text-center mt-3 mb-7">
            <h1 class="text-3xl font-extrabold leading-none tracking-tight text-gray-900 lg:text-4xl">
                Daftar Peraturan yang Digunakan
            </h1>
        </div>

        <div class="container mx-auto p-8 lg:px-24">

            <!-- modal tambah aturan -->
            <div class="flex justify-end mb-4">
                <button data-modal-target="modal-law-input" data-modal-toggle="modal-law-input"
                    class="text-white bg-[#2557D6] hover:bg-[#2557D6]/90 focus:ring-4 focus:ring-[#2557D6]/50 focus:outline-none font-medium rounded-lg text-sm py-2 px-3 text-center inline-flex items-center me-2 mb-2 ml-auto"
                    title="" type="button">
                    <CirclePlusIcon class="w-5 mr-3 fill-current" />
                    Input Peraturan Baru
                </button>

                <div id="modal-law-input" tabindex="-1" aria-hidden="true"
                    class="hidden overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full">
                    <div class="relative p-4 w-full max-w-md max-h-full">
                        <!-- Modal content -->
                        <div class="relative bg-white rounded-lg shadow">
                            <!-- Modal header -->
                            <div class="flex items-center justify-between p-4 md:p-5 border-b rounded-t">
                                <h3 class="text-lg font-semibold text-gray-900">
                                    Tambahkan peraturan baru
                                </h3>
                                <button type="button"
                                    class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center"
                                    data-modal-toggle="modal-law-input">
                                    <XMarkCloseIcon class="w-3 h-3"/>
                                    <span class="sr-only">Tutup modal</span>
                                </button>
                            </div>
                            <!-- Modal body -->
                            <form class="p-4 md:p-5" @submit.prevent="submitData">
                                <div class="grid gap-4 mb-4 grid-cols-2">
                                    <div class="col-span-2">
                                        <label for="category" class="block mb-2 text-sm font-medium text-gray-900">Jenis
                                            Peraturan</label>
                                        <select id="category" v-model="form.id_law_type"
                                            class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5">
                                            <option selected>Pilih jenis</option>
                                            <option v-for="(item, index) in tipePeraturan" :key="index"
                                                :value="`${item.id_law_type}`">{{ item.law_type }}</option>
                                        </select>
                                    </div>
                                    <div class="col-span-2 sm:col-span-1">
                                        <label for="law-num"
                                            class="block mb-2 text-sm font-medium text-gray-900">Nomor</label>
                                        <input type="number" id="law-num" v-model="form.number"
                                            class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                                            placeholder="Mis. 95" required min="1" max="999">
                                    </div>
                                    <div class="col-span-2 sm:col-span-1">
                                        <label for="year"
                                            class="block mb-2 text-sm font-medium text-gray-900">Tahun</label>
                                        <input type="number" id="year" v-model="form.year"
                                            class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                                            placeholder="Mis. 2022" required min="1945" :max="new Date().getFullYear()">
                                    </div>
                                    <div class="col-span-2">
                                        <label for="description"
                                            class="block mb-2 text-sm font-medium text-gray-900">Pembahasan</label>
                                        <textarea id="description" rows="4" v-model="form.about"
                                            class="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="Misal: Organisasi dan Tata Kerja Organ Pengelola Universitas Andalas"></textarea>
                                    </div>
                                </div>
                                <button type="submit"
                                    class="text-white inline-flex items-center bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center">
                                    <svg class="me-1 -ms-1 w-5 h-5" fill="currentColor" viewBox="0 0 20 20"
                                        xmlns="http://www.w3.org/2000/svg">
                                        <path fill-rule="evenodd"
                                            d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                                            clip-rule="evenodd"></path>
                                    </svg>
                                    Tambahkan
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            <table id="default-table" class="mx-auto">
                <thead>
                    <tr>
                        <th class="text-black">
                            <span class="flex items-center">
                                No
                            </span>
                        </th>
                        <th class="text-black">
                            <span class="flex items-center">
                                Jenis
                                <IconSort />
                            </span>
                        </th>
                        <th class="text-black">
                            <span class="flex items-center">
                                Nomor
                                <IconSort />
                            </span>
                        </th>
                        <th class="text-black">
                            <span class="flex items-center">
                                Tahun
                                <IconSort />
                            </span>
                        </th>
                        <th class="text-black" title="Pembahasan peraturan">
                            <span class="flex items-center">
                                Tentang
                                <IconSort />
                            </span>
                        </th>
                        <!-- <th class="text-black" title="Jumlah SOP yang menggunakan peraturan terkait">
                            <span class="flex items-center">
                                Jumlah
                                <IconSort />
                            </span>
                        </th> -->
                        <th>
                            <span class="flex items-center">
                                Aksi
                            </span>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(item, index) in data" :key="index">
                        <th scope="row">
                            {{ index+1 }}
                        </th>
                        <td class="text-black">{{ item.law_type }}</td>
                        <td class="text-black">{{ item.number }}</td>
                        <td class="text-black">{{ item.year }}</td>
                        <td class="text-black">{{ item.about }}</td>
                        <!-- <td class="text-black">{{ item.jumlah }}</td> -->
                        <td class="inline-flex">
                            {{ item.id_legal }}
                            <!-- Suntiang -->
                            <button :title="`Edit peraturan ${index + 1}`" @click="openUpdateModal(item.id_legal)"
                                class="px-3 py-2 h-9 mx-2 text-white bg-yellow-400 rounded-lg hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:ring-opacity-50 inline-flex">
                                <PenToSquareIcon class="fill-current w-4" />{{ item.id_legal }}
                            </button>

                            <!-- Apuih -->
                            <button title="Dapat dihapus karena belum ada sop yang menggunakan" @click="openDeleteModal(item.id_legal)"
                                class="px-3 py-2 h-9 mx-2 text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 inline-flex">
                                <TrashCanIcon class="fill-current w-4" />{{ item.id_legal }}
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- modal hapus -->
        <div v-if="showModalDelete" class="fixed inset-0 z-50 flex items-center justify-center w-full h-full">
            <!-- Overlay gelap -->
            <div class="fixed inset-0 bg-gray-800 bg-opacity-30" @click="closeDeleteModal"></div>

            <!-- Modal Konten -->
            <div class="relative p-4 w-full max-w-md max-h-full z-10">
                <div class="relative bg-white rounded-lg shadow">
                    <button type="button" @click="closeDeleteModal"
                        class="absolute top-3 right-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 inline-flex justify-center items-center">
                        <XMarkCloseIcon class="w-3 h-3"/>
                        <span class="sr-only">Tutup modal</span>
                    </button>
                    <div class="p-4 md:p-5 text-center">
                        <ExclamationMarkIcon class="mx-auto mb-4 text-gray-400 w-12 h-12"/>
                        <h3 class="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
                            Anda yakin ingin menghapus data ini?</h3>
                        <button @click="deleteData(selectedDeleteId)"
                            class="text-white bg-red-600 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm inline-flex items-center px-5 py-2.5 text-center">
                            Ya
                        </button>
                        <button @click="closeDeleteModal"
                            class="py-2.5 px-5 ms-3 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100">
                            Batal
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- modal edit -->
        <div v-if="showModalUpdate" class="fixed inset-0 z-50 flex items-center justify-center w-full h-full">

            <!-- Overlay gelap -->
            <div class="fixed inset-0 bg-gray-800 bg-opacity-30" @click="closeUpdateModal"></div>

            <!-- Modal content -->
            <div class="relative p-4 w-full max-w-md max-h-full z-10">
                <div class="relative bg-white rounded-lg shadow">

                    <!-- Modal header -->
                    <div class="flex items-center justify-between p-4 md:p-5 border-b rounded-t">
                        <h3 class="text-lg font-semibold text-gray-900">
                            Perbarui dasar hukum
                        </h3>
                        <button type="button" @click="closeUpdateModal"
                            class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center">
                            <XMarkCloseIcon class="w-3 h-3"/>
                            <span class="sr-only">Tutup modal</span>
                        </button>
                    </div>

                    <!-- Modal body -->
                    <form class="p-4 md:p-5" @submit.prevent="updateData(selectedUpdateId)">
                        <div class="grid gap-4 mb-4 grid-cols-2">
                            <div class="col-span-2">
                                <label  class="block mb-2 text-sm font-medium text-gray-900" for="update_law_type">
                                    Jenis Peraturan
                                </label>
                                <input type="text" v-model="form.id_law_type" id="update_law_type"
                                    class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-yellow-300 focus:border-yellow-300 block w-full p-2.5"
                                    placeholder="Mis. Peraturan Presiden" required>
                            </div>
                            <div class="col-span-2 sm:col-span-1">
                                <label for="update_law-num"
                                    class="block mb-2 text-sm font-medium text-gray-900">Nomor</label>
                                <input type="number" id="update_law-num" v-model="form.number"
                                    class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                                    placeholder="Mis. 95" required min="1" max="999">
                            </div>
                            <div class="col-span-2 sm:col-span-1">
                                <label for="update_year"
                                    class="block mb-2 text-sm font-medium text-gray-900">Tahun</label>
                                <input type="number" id="update_year" v-model="form.year"
                                    class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                                    placeholder="Mis. 2022" required min="1945" :max="new Date().getFullYear()">
                            </div>
                            <div class="col-span-2">
                                <label for="update_description"
                                    class="block mb-2 text-sm font-medium text-gray-900">Deskripsi</label>
                                <textarea id="update_description" rows="4" v-model="form.about"
                                    class="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-yellow-300 focus:border-yellow-300"
                                    placeholder="ketikkan deskripsi disini..."></textarea>
                            </div>
                        </div>
                        <button type="submit"
                            class="text-white inline-flex items-center bg-yellow-400 hover:bg-yellow-500 focus:ring-4 focus:outline-none focus:ring-yellow-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center">
                            Perbarui
                        </button>
                    </form>

                </div>
            </div>
        </div>

    </main>
</template>
