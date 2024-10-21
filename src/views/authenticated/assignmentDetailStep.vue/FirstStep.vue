<script setup>
import { onMounted, ref } from 'vue';
import { initModals } from 'flowbite';
import { DataTable } from "simple-datatables";
import IconSort from '@/assets/icons/IconSort.vue';
import CircleInfoIcon from '@/assets/icons/CircleInfoIcon.vue';
import CirclePlusIcon from '@/assets/icons/CirclePlusIcon.vue';
import TrashCanIcon from '@/assets/icons/TrashCanIcon.vue';

// Data peraturan
const data = [
    {nama: 'Peraturan Pemerintah Nomor 95 Tahun 2021 tentang Perguruan Tinggi Negeri Badan Hukum Universitas Andalas'},
    {nama: ' Peraturan Rektor Universitas Andalas Nomor 8 Tahun 2022 tentang Organisasi dan Tata Kerja Organ Pengelola Universitas Andalas'}
];

// State untuk menyimpan peraturan yang dipilih
const selectedLaws = ref([]);

// Fungsi untuk menambah atau menghapus peraturan dari daftar yang dipilih
const toggleLaw = (law) => {
    const index = selectedLaws.value.findIndex(item => item.nama === law.nama);
    if (index === -1) {
        selectedLaws.value.push(law);
    } else {
        selectedLaws.value.splice(index, 1);
    }
}

// Fungsi untuk menghapus peraturan yang sudah dipilih
const removeLaw = (index) => {
    selectedLaws.value.splice(index, 1);
}

onMounted(() => {
    initModals();

    if (document.getElementById("sop-docs-table") && typeof DataTable !== 'undefined') {
        new DataTable(document.getElementById("sop-docs-table"), {
            searchable: true,
            sortable: true,
            perPage: 5
        });
    };

});

</script>

<template>
    <div class="max-w-2xl mx-auto">
        <div class="my-4 inline-flex items-center">
            <CircleInfoIcon class="w-5 mr-2" />
            Informasi dari Penanggung Jawab, tidak bisa diubah!
        </div>
        <div class="mb-4">
            <label for="sop-number" class="block mb-2 text-sm font-medium ">
                Nama
            </label>
            <input type="text" id="sop-number"
                class="bg-gray-50 border border-gray-300 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 "
                value="Pendaftaran Kerja Praktik" readonly />
        </div>
        <div class="grid gap-4 sm:grid-cols-2 sm:gap-5 text-black mb-4">
            <div>
                <label for="sop-number" class="block mb-2 text-sm font-medium ">
                    Nomor
                </label>
                <input type="text" id="sop-number"
                    class="bg-gray-50 border border-gray-300 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 "
                    value="T/001/UN16.17.02/OT.01.00/2024" readonly />
            </div>
            <div>
                <label for="sop-date" class="block mb-2 text-sm font-medium ">
                    Tanggal
                </label>
                <input type="text" id="sop-date"
                    class="bg-gray-50 border border-gray-300 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                    value="11/10/2024" readonly />
            </div>
            <div>
                <label for="sop-org" class="block mb-2 text-sm font-medium ">
                    Organisasi
                </label>
                <input type="text" id="sop-org"
                    class="bg-gray-50 border border-gray-300 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                    value="Departemen Sistem Informasi" readonly />
            </div>
            <div>
                <label for="sop-pic" class="block mb-2 text-sm font-medium ">
                    Penanggung Jawab
                </label>
                <input type="text" id="sop-pic"
                    class="bg-gray-50 border border-gray-300 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                    value="Husnil Kamil" readonly />
            </div>
        </div>
        <div class="mb-5">
            <label for="sop-description" class="block mb-2 text-sm font-medium ">
                Deskripsi
            </label>
            <textarea id="sop-description" disabled
                class="bg-gray-50 border border-gray-300 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 h-48">Lorem ipsum dolor sit amet consectetur adipisicing elit. Assumenda incidunt dolores veniam molestias doloribus voluptatem itaque fugiat commodi quibusdam voluptate eveniet quo eligendi, laudantium cupiditate obcaecati quaerat praesentium a labore reiciendis, aut cumque! Exercitationem ea quaerat iure quae dolorem, temporibus perferendis aperiam ducimus nemo dolor harum reiciendis atque? Vitae, ipsum.</textarea>
        </div>
        <div class="grid gap-4 sm:grid-cols-2 sm:gap-6 text-black">
            <div class="mb-5">
                <h2 class="mb-2 text-sm font-semibold text-gray-900 dark:text-white">Pelaksana:</h2>
                <ul class="max-w-md space-y-1 list-disc list-inside text-sm">
                    <li>Mahasiswa</li>
                    <li>Departemen</li>
                    <li>Perusahaan</li>
                </ul>
            </div>
            <div class="mb-5">
                <h2 class="mb-2 text-sm font-semibold text-gray-900 dark:text-white">User yang ditugaskan:</h2>
                <ul class="max-w-md space-y-1 list-disc list-inside text-sm">
                    <li>Kemal</li>
                    <li>Kamal</li>
                    <li>Kamil</li>
                </ul>
            </div>
        </div>

        <div class="inline-flex items-center justify-center w-full">
            <hr class="w-64 h-1 my-8 bg-gray-300 border-0 rounded">
            <div class="absolute px-4 -translate-x-1/2 bg-white left-1/2">
                <svg class="w-4 h-4 text-gray-700" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor" viewBox="0 0 18 14">
                    <path
                        d="M6 0H2a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h4v1a3 3 0 0 1-3 3H2a1 1 0 0 0 0 2h1a5.006 5.006 0 0 0 5-5V2a2 2 0 0 0-2-2Zm10 0h-4a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h4v1a3 3 0 0 1-3 3h-1a1 1 0 0 0 0 2h1a5.006 5.006 0 0 0 5-5V2a2 2 0 0 0-2-2Z" />
                </svg>
            </div>
        </div>

        <div class="my-4 inline-flex items-center">
            <CircleInfoIcon class="w-5 mr-2" />
            Form berikut wajib diisi sebagai sebagai identitas dari SOP!
        </div>

        <div class="mb-4">
            <label for="sop-section" class="block mb-2 text-sm font-medium ">
                Seksi
            </label>
            <input type="text" id="sop-section"
            class="bg-gray-50 border border-gray-300 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 "
            value="Semua Seksi di Lingkungan Departemen Sistem Informasi" />
        </div>
        <div class="mb-4">
            <label class="block mb-2 text-sm font-medium ">
                Dasar Hukum
            </label>

            <!-- Daftar Dasar Hukum yang Dipilih -->
            <div v-if="selectedLaws.length > 0" class="my-4">
                <!-- <label class="block mb-2 text-sm font-medium ">
                    Dasar Hukum yang Dipilih
                </label> -->
                <ul>
                    <li v-for="(law, index) in selectedLaws" :key="index" class="flex items-center justify-between p-2 bg-gray-200 rounded-lg mb-2">
                        <span>{{ law.nama }}</span>
                        <button :title="`Hapus peraturan ${index + 1}`" @click="removeLaw(index)"
                            class="px-3 py-2 h-9 mx-2 text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 inline-flex">
                                <TrashCanIcon class="fill-current w-4" />
                        </button>
                    </li>
                </ul>
            </div>

            <button data-modal-target="law-basis-modal" data-modal-toggle="law-basis-modal" class="block w-full md:w-auto text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800" type="button">
                Tambah Dasar Hukum
            </button>
        </div>

    </div>

    <!-- Large Modal -->
    <div id="law-basis-modal" tabindex="-1" class="fixed top-0 left-0 right-0 z-50 hidden w-full p-4 overflow-x-hidden overflow-y-auto md:inset-0 h-[calc(100%-1rem)] max-h-full">
        <div class="relative w-full max-w-4xl max-h-full">
            <!-- Modal content -->
            <div class="relative bg-white rounded-lg shadow dark:bg-gray-700">
                <!-- Modal header -->
                <div class="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600">
                    <h3 class="text-xl font-medium text-gray-900 dark:text-white">
                        Pilih peraturan yang sesuai dengan SOP
                    </h3>
                    <button type="button" class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white" data-modal-hide="law-basis-modal">
                        <svg class="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
                        </svg>
                        <span class="sr-only">Tutup modal</span>
                    </button>
                </div>
                <!-- Modal body -->
                <div class="p-4 md:p-5 space-y-4">

                    <!-- <div class="flex justify-end mb-4">
                        <router-link :to="{ name: 'SopPropose' }">
                            <button
                                class="text-white bg-[#2557D6] hover:bg-[#2557D6]/90 focus:ring-4 focus:ring-[#2557D6]/50 focus:outline-none font-medium rounded-lg text-sm py-2 px-3 text-center inline-flex items-center dark:focus:ring-[#2557D6]/50 me-2 mb-2 ml-auto"
                                title="">
                                <CirclePlusIcon class="w-5 mr-3 fill-current" />
                                Tambah SOP Baru
                            </button>
                        </router-link>
                    </div> -->

                    <table id="sop-docs-table" class="mx-auto">
                        <thead>
                            <tr>
                                <th>
                                    <span class="flex items-center">
                                        No.
                                    </span>
                                </th>
                                <th>
                                    <span class="flex items-center">
                                        Nama
                                        <IconSort />
                                    </span>
                                </th>
                                <th>
                                    <!-- <span class="flex items-center">
                                        Aksi
                                    </span> -->
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(item, index) in data" :key="index">
                                <td class="font-medium text-gray-900 whitespace-nowrap">{{ index + 1 }}</td>
                                <td class="font-medium text-gray-900 whitespace-wrap">{{ item.nama }}</td>
                                <td>
                                    <input type="checkbox"
                                    :checked="selectedLaws.some(law => law.nama === item.nama)" @change="toggleLaw(item)"
                                    class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2">
                                </td>
                            </tr>
                        </tbody>
                    </table>

                </div>
                <!-- Modal footer -->
                <div class="flex items-center p-4 md:p-5 space-x-3 rtl:space-x-reverse border-t border-gray-200 rounded-b">
                    <button data-modal-hide="law-basis-modal" type="button" class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center">Tambahkan</button>
                </div>
            </div>
        </div>
    </div>

</template>
