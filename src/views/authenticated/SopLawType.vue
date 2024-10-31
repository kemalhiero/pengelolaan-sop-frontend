<script setup>
import { onMounted, ref } from 'vue';
import { initModals } from 'flowbite';
import CirclePlusIcon from '@/assets/icons/CirclePlusIcon.vue';
import TrashCanIcon from '@/assets/icons/TrashCanIcon.vue';
import PenToSquareIcon from '@/assets/icons/PenToSquareIcon.vue';

import { API_BASE_URL } from '@/api/apiClient';
import PulseLoading from '@/components/PulseLoading.vue';
import SuccessToast from '@/components/toast/SuccessToast.vue';
import DangerToast from '@/components/toast/DangerToast.vue';
const data = ref(null);

// Fungsi untuk fetch data dari API
const fetchData = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/lawtype`, {
            method: 'GET'
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const result = await response.json();
        data.value = result.data; // Menyimpan data yang di-fetch
    } catch (error) {
        console.error('Fetch error:', error);
    }
};

// Variabel reaktif untuk menyimpan data form
const isSucces = ref(null);
const operation = ref('')
const law_type = ref('');
const description = ref('');

// Fungsi untuk mengirim data ke API dengan metode POST
const submitData = async () => {

    operation.value = 'post'

    try {
        const response = await fetch(`${API_BASE_URL}/api/lawtype`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                law_type: law_type.value,
                description: description.value,
            }),
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
            isSucces.value = 'no'
        }

        law_type.value = '';  // Mengosongkan form setelah pengiriman
        description.value = '';
        isSucces.value = 'yes'

        law_type.value = ''
        description.value = ''

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
        const response = await fetch(`${API_BASE_URL}/api/lawtype?id=${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                law_type: law_type.value,
                description: description.value,
            }),
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        // Lakukan penghapusan item dari array data
        data.value = data.value.filter(item => item.id_law_type !== id);
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
    selectedUpdateId.value = id; // Menyimpan ID yang dipilih
    showModalUpdate.value = true; // Tampilkan modal
    const dataLawType = data.value;

    for (let i = 0; i < dataLawType.length; i++) {
        if (dataLawType[i].id_law_type === id) {
            dataYangDitemukan = dataLawType[i];
            break; // Keluar dari loop setelah data ditemukan
        }
    }

    law_type.value = dataYangDitemukan.law_type
    description.value = dataYangDitemukan.description

    if (dataYangDitemukan) {
        console.log(dataYangDitemukan);
    } else {
        console.log("Data tidak ditemukan");
    }
};

const closeUpdateModal = () => {
    showModalUpdate.value = false; // Sembunyikan modal
    selectedUpdateId.value = null; // Reset ID setelah modal ditutup

    law_type.value = ''
    description.value = ''
};

const updateData = async (id) => {  // Fungsi untuk menghapus data berdasarkan ID

    operation.value = 'update'

    try {
        const response = await fetch(`${API_BASE_URL}/api/lawtype?id=${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                law_type: law_type.value,
                description: description.value,
            }),
        });

        if (!response.ok) throw new Error('Network response was not ok');

        isSucces.value = 'yes'
        console.log(`Data dengan ID ${id} berhasil diperbarui`);

        fetchData();
        closeUpdateModal(); // Tutup modal setelah penghapusan

    } catch (error) {
        isSucces.value = 'no'
        console.error('Update error:', error);
    }
};

// ---------------------------------
onMounted(() => {
    initModals();
    fetchData();
});

</script>

<template>
    <main class="p-4 md:ml-64 h-auto pt-20">

        <SuccessToast v-if="isSucces == 'yes' && operation == 'post'" teks="Data Berhasil Ditambahkan!" />
        <SuccessToast v-else-if="isSucces == 'yes' && operation == 'update'" teks="Data Berhasil Diperbarui!" />
        <SuccessToast v-else-if="isSucces == 'yes' && operation == 'delete'" teks="Data Berhasil Dihapus!" />
        <DangerToast v-else-if="isSucces == 'no' && operation == 'post'" teks="Data Gagal Ditambahkan" />
        <DangerToast v-else-if="isSucces == 'no' && operation == 'update'" teks="Data Gagal Diperbarui" />
        <DangerToast v-else-if="isSucces == 'no' && operation == 'delete'" teks="Data Gagal Dihapus" />

        <div class="text-center mt-3 mb-7">
            <h1 class="text-3xl font-extrabold leading-none tracking-tight text-gray-900 lg:text-4xl dark:text-white">
                Daftar Jenis Peraturan
            </h1>
        </div>

        <div class="container mx-auto p-8 lg:px-32">

            <!-- modal tambah aturan -->
            <div class="flex justify-end mb-4">

                <button data-modal-target="crud-modal" data-modal-toggle="crud-modal"
                    class="text-white bg-[#2557D6] hover:bg-[#2557D6]/90 focus:ring-4 focus:ring-[#2557D6]/50 focus:outline-none font-medium rounded-lg text-sm py-2 px-3 text-center inline-flex items-center me-2 mb-2 ml-auto"
                    title="" type="button">
                    <CirclePlusIcon class="w-5 mr-3 fill-current" />
                    Input Jenis Peraturan Baru
                </button>

                <div id="crud-modal" tabindex="-1" aria-hidden="true"
                    class="hidden overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full">
                    <div class="relative p-4 w-full max-w-md max-h-full">
                        <!-- Modal content -->
                        <div class="relative bg-white rounded-lg shadow">

                            <!-- Modal header -->
                            <div class="flex items-center justify-between p-4 md:p-5 border-b rounded-t">
                                <h3 class="text-lg font-semibold text-gray-900">
                                    Tambahkan jenis peraturan baru
                                </h3>
                                <button type="button"
                                    class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center"
                                    data-modal-toggle="crud-modal">
                                    <svg class="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"
                                        fill="none" viewBox="0 0 14 14">
                                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
                                            stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
                                    </svg>
                                    <span class="sr-only">Tutup modal</span>
                                </button>
                            </div>

                            <!-- Modal body -->
                            <form class="p-4 md:p-5" @submit.prevent="submitData">
                                <div class="grid gap-4 mb-4 grid-cols-2">
                                    <div class="col-span-2">
                                        <label for="law_type" class="block mb-2 text-sm font-medium text-gray-900">Jenis
                                            peraturan</label>
                                        <input type="text" v-model="law_type"
                                            class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                                            placeholder="Mis. Peraturan Presiden" required>
                                    </div>
                                    <div class="col-span-2">
                                        <label for="description"
                                            class="block mb-2 text-sm font-medium text-gray-900">Deskripsi</label>
                                        <textarea id="description" rows="4" v-model="description"
                                            class="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="ketikkan deskripsi disini..."></textarea>
                                    </div>
                                </div>
                                <button type="submit" data-modal-hide="crud-modal"
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

            <template v-if="data && data.length">
                <div class="relative overflow-x-auto shadow-md sm:rounded-lg">
                    <table class="w-full text-sm text-left text-gray-500">
                        <thead class="text-xs text-gray-900 uppercase bg-gray-50">
                            <tr>
                                <th scope="col" class="px-6 py-3">
                                    No.
                                </th>
                                <th scope="col" class="px-6 py-3">
                                    Jenis Peraturan
                                </th>
                                <th scope="col" class="px-6 py-3">
                                    Deskripsi
                                </th>
                                <th scope="col" class="px-6 py-3">
                                    <span class="sr-only">Edit</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(item, index) in data" :key="index" class="bg-white border-b">
                                <th scope="row" class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                                    {{ index + 1 }}
                                </th>
                                <td class="px-6 py-4 text-black font-semibold">
                                    {{ item.law_type }}
                                </td>
                                <td class="px-6 py-4 text-black">
                                    {{ item.description }}
                                </td>
                                <td class="px-6 py-4 flex">
                                    <button :title="`Edit item ${index + 1}`" @click="openUpdateModal(item.id_law_type)"
                                        class="px-3 py-2 h-9 mx-2 text-white bg-yellow-400 rounded-lg hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:ring-opacity-50 inline-flex">
                                        <PenToSquareIcon class="fill-current w-4" />
                                    </button>
                                    <button :title="`Hapus item ${index + 1}`"
                                        @click="openDeleteModal(item.id_law_type)"
                                        class="px-3 py-2 h-9 mx-2 text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 inline-flex">
                                        <TrashCanIcon class="fill-current w-4" />
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </template>

            <PulseLoading v-else />

        </div>

        <!-- modal hapus -->
        <div v-if="showModalDelete" class="fixed inset-0 z-50 flex items-center justify-center w-full h-full">
            <!-- Overlay gelap -->
            <div class="fixed inset-0 bg-gray-800 bg-opacity-30"></div>

            <!-- Modal Konten -->
            <div class="relative p-4 w-full max-w-md max-h-full z-10">
                <div class="relative bg-white rounded-lg shadow">
                    <button type="button" @click="closeDeleteModal"
                        class="absolute top-3 right-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white">
                        <svg class="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none"
                            viewBox="0 0 14 14">
                            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
                        </svg>
                        <span class="sr-only">Tutup modal</span>
                    </button>
                    <div class="p-4 md:p-5 text-center">
                        <svg class="mx-auto mb-4 text-gray-400 w-12 h-12 dark:text-gray-200" aria-hidden="true"
                            xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M10 11V6m0 8h.01M19 10a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                        </svg>
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
            <div class="fixed inset-0 bg-gray-800 bg-opacity-30"></div>

            <!-- Modal content -->
            <div class="relative p-4 w-full max-w-md max-h-full z-10">
                <div class="relative bg-white rounded-lg shadow">

                    <!-- Modal header -->
                    <div class="flex items-center justify-between p-4 md:p-5 border-b rounded-t">
                        <h3 class="text-lg font-semibold text-gray-900">
                            Perbarui jenis peraturan
                        </h3>
                        <button type="button" @click="closeUpdateModal"
                            class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center">
                            <svg class="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none"
                                viewBox="0 0 14 14">
                                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
                                    stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
                            </svg>
                            <span class="sr-only">Tutup modal</span>
                        </button>
                    </div>

                    <!-- Modal body -->
                    <form class="p-4 md:p-5" @submit.prevent="updateData(selectedUpdateId)">
                        <div class="grid gap-4 mb-4 grid-cols-2">
                            <div class="col-span-2">
                                <label for="law_type" class="block mb-2 text-sm font-medium text-gray-900">Jenis
                                    peraturan</label>
                                <input type="text" v-model="law_type"
                                    class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-yellow-300 focus:border-yellow-300 block w-full p-2.5"
                                    placeholder="Mis. Peraturan Presiden" required>
                            </div>
                            <div class="col-span-2">
                                <label for="description"
                                    class="block mb-2 text-sm font-medium text-gray-900">Deskripsi</label>
                                <textarea id="description" rows="4" v-model="description"
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
