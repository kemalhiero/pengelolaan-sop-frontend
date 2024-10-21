<script setup>
import { onMounted } from "vue";
import { DataTable } from "simple-datatables";
import { initModals } from "flowbite";

import IconSort from "@/assets/icons/IconSort.vue";
import IconEye from "@/assets/icons/IconEye.vue";
import GreenBadgeIndicator from "@/components/indicator/GreenBadgeIndicator.vue";
import RedBadgeIndicator from "@/components/indicator/RedBadgeIndicator.vue";
import CirclePlusIcon from "@/assets/icons/CirclePlusIcon.vue";
import PenToSquareIcon from "@/assets/icons/PenToSquareIcon.vue";

const tipePeraturan = [
    { id: 'uu', tipe: 'Undang-Undang' },
    { id: 'pp', tipe: 'Peraturan Pemerintah' },
    { id: 'pm', tipe: 'Permenristekdikti' },
    { id: 'prua', tipe: 'Peraturan Rektor Universitas Andalas' },
]

const data = [
    { tipe: 'Peraturan Pemerintah', nomor: 95, tahun: 2021, pembahasan: 'Perguruan Tinggi Negeri Badan Hukum Universitas Andalas', jumlah: 0 },
    { tipe: 'Peraturan Rektor Universitas Andalas', nomor: 8, tahun: 2022, pembahasan: 'Organisasi dan Tata Kerja Organ Pengelola Universitas Andalas', jumlah: 1 },
    { tipe: 'Permenristekdikti', nomor: 53, tahun: 2016, pembahasan: 'Tata Cara Pembentukan Peraturan Perundang-Undangan di Kementerian Riset, Teknologi, dan Pendidikan Tinggi', jumlah: 4 },
]

onMounted(() => {
    if (document.getElementById("default-table") && typeof DataTable !== 'undefined') {
        new DataTable(document.getElementById("default-table"), {
            searchable: true,
            sortable: true,
        });
    };

    initModals();
})
</script>

<template>
    <main class="p-4 md:ml-64 h-auto pt-20">

        <div class="text-center mt-3 mb-7">
            <h1 class="text-3xl font-extrabold leading-none tracking-tight text-gray-900 lg:text-4xl">
                Daftar Peraturan yang Digunakan
            </h1>
        </div>

        <div class="container mx-auto p-8 lg:px-32">

            <!-- modal tambah aturan -->
            <div class="flex justify-end mb-4">
                <button
                    data-modal-target="modal-law-input" data-modal-toggle="modal-law-input"
                    class="text-white bg-[#2557D6] hover:bg-[#2557D6]/90 focus:ring-4 focus:ring-[#2557D6]/50 focus:outline-none font-medium rounded-lg text-sm py-2 px-3 text-center inline-flex items-center me-2 mb-2 ml-auto"
                    title="" type="button">
                    <CirclePlusIcon class="w-5 mr-3 fill-current" />
                    Input Peraturan Baru
                </button>

                <div id="modal-law-input" tabindex="-1" aria-hidden="true" class="hidden overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full">
                    <div class="relative p-4 w-full max-w-md max-h-full">
                        <!-- Modal content -->
                        <div class="relative bg-white rounded-lg shadow">
                            <!-- Modal header -->
                            <div class="flex items-center justify-between p-4 md:p-5 border-b rounded-t">
                                <h3 class="text-lg font-semibold text-gray-900">
                                    Tambahkan peraturan baru
                                </h3>
                                <button type="button" class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center" data-modal-toggle="modal-law-input">
                                    <svg class="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
                                    </svg>
                                    <span class="sr-only">Tutup modal</span>
                                </button>
                            </div>
                            <!-- Modal body -->
                            <form class="p-4 md:p-5">
                                <div class="grid gap-4 mb-4 grid-cols-2">
                                    <div class="col-span-2">
                                        <label for="category" class="block mb-2 text-sm font-medium text-gray-900">Jenis Peraturan</label>
                                        <select id="category" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5">
                                            <option selected>Pilih jenis</option>
                                            <option v-for="(item, index) in tipePeraturan" :key="index" :value="`${item.id}`">{{ item.tipe }}</option>
                                        </select>
                                    </div>
                                    <div class="col-span-2 sm:col-span-1">
                                        <label for="law-num" class="block mb-2 text-sm font-medium text-gray-900">Nomor</label>
                                        <input type="number" name="law-num" id="law-num" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5" placeholder="Mis. 95" required min="1" max="999">
                                    </div>
                                    <div class="col-span-2 sm:col-span-1">
                                        <label for="year" class="block mb-2 text-sm font-medium text-gray-900">Tahun</label>
                                        <input type="number" name="year" id="year" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5" placeholder="Mis. 2022" required min="1945" :max="new Date().getFullYear()">
                                    </div>
                                    <div class="col-span-2">
                                        <label for="description" class="block mb-2 text-sm font-medium text-gray-900">Pembahasan</label>
                                        <textarea id="description" rows="4" class="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500" placeholder="Misal: Organisasi dan Tata Kerja Organ Pengelola Universitas Andalas"></textarea>                    
                                    </div>
                                </div>
                                <button type="submit" class="text-white inline-flex items-center bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center">
                                    <svg class="me-1 -ms-1 w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd"></path></svg>
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
                                Jenis
                                <IconSort />
                            </span>
                        </th>
                        <th class="text-black" >
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
                        <th class="text-black" title="Jumlah SOP yang menggunakan peraturan terkait">
                            <span class="flex items-center">
                                Jumlah
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
                        <td class="text-black">{{ item.tipe }}</td>
                        <td class="text-black">{{ item.nomor }}</td>
                        <td class="text-black">{{ item.tahun }}</td>
                        <td class="text-black">{{ item.pembahasan }}</td>
                        <td class="text-black">{{ item.jumlah }}</td>
                        <td>
                            <button :title="`Edit peraturan ${index + 1}`"
                                :data-modal-target="`modal-law-edit-${index}`" :data-modal-toggle="`modal-law-edit-${index}`"
                                class="px-3 py-2 h-9 mx-2 text-white bg-yellow-400 rounded-lg hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:ring-opacity-50 inline-flex">
                                <PenToSquareIcon class="fill-current w-4" />
                            </button>
                            <div :id="`modal-law-edit-${index}`" tabindex="-1" aria-hidden="true" class="hidden overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full">
                                <div class="relative p-4 w-full max-w-md max-h-full">
                                    <!-- Modal content -->
                                    <div class="relative bg-white rounded-lg shadow">
                                        <!-- Modal header -->
                                        <div class="flex items-center justify-between p-4 md:p-5 border-b rounded-t">
                                            <h3 class="text-lg font-semibold text-gray-900">
                                                Edit data peraturan
                                            </h3>
                                            <button type="button" class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center" :data-modal-toggle="`modal-law-edit-${index}`">
                                                <svg class="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                                                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
                                                </svg>
                                                <span class="sr-only">Tutup modal</span>
                                            </button>
                                        </div>
                                        <!-- Modal body -->
                                        <form class="p-4 md:p-5">
                                            <div class="grid gap-4 mb-4 grid-cols-2">
                                                <div class="col-span-2">
                                                    <label for="category" class="block mb-2 text-sm font-medium text-gray-900">Jenis Peraturan</label>
                                                    <select id="category" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5">
                                                        <option selected>Pilih jenis</option>
                                                        <option v-for="(item, index) in tipePeraturan" :key="index" :value="`${item.id}`">{{ item.tipe }}</option>
                                                    </select>
                                                </div>
                                                <div class="col-span-2 sm:col-span-1">
                                                    <label for="law-num" class="block mb-2 text-sm font-medium text-gray-900">Nomor</label>
                                                    <input type="number" name="law-num" id="law-num" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5" placeholder="Mis. 95" required min="1" max="999" :value="`${item.nomor}`">
                                                </div>
                                                <div class="col-span-2 sm:col-span-1">
                                                    <label for="year" class="block mb-2 text-sm font-medium text-gray-900">Tahun</label>
                                                    <input type="number" name="year" id="year" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5" placeholder="Mis. 2022" required min="1945" :max="new Date().getFullYear()" :value="`${item.tahun}`">
                                                </div>
                                                <div class="col-span-2">
                                                    <label for="description" class="block mb-2 text-sm font-medium text-gray-900">Pembahasan</label>
                                                    <textarea id="description" rows="4" class="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500" placeholder="Misal: Organisasi dan Tata Kerja Organ Pengelola Universitas Andalas">{{ item.pembahasan }}</textarea>                    
                                                </div>
                                            </div>
                                            <button type="submit" class="text-white inline-flex items-center bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center">
                                                <svg class="me-1 -ms-1 w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd"></path></svg>
                                                Edit
                                            </button>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

    </main>
</template>