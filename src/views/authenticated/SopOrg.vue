<script setup>
import { onMounted } from 'vue';
import { initModals } from 'flowbite';
import CirclePlusIcon from '@/assets/icons/CirclePlusIcon.vue';
import PenToSquareIcon from '@/assets/icons/PenToSquareIcon.vue';

const data = [
    { nama: 'Departemen Sistem Informasi', pj: 'Husnil Kamil', lvl: 'Departemen', ket: 'demi apa? demikian~' },
    { nama: 'Labor Dasar Komputasi', pj: 'Jefril Rahmadoni', lvl: 'Labor', ket: '-' },
    { nama: 'Labor Enterprise Application', pj: 'Adi Arga', lvl: 'Labor', ket: '-' },
    { nama: 'Labor Geographic Information System', pj: 'Surya Afnarius', lvl: 'Labor', ket: '-' },
    { nama: 'Labor Business Intellegence', pj: 'Dwi Welly', lvl: 'Labor', ket: '-' },
]

onMounted(() => {
    initModals();
})

</script>

<template>
    <main class="p-4 md:ml-64 h-auto pt-20">

        <div class="text-center mt-3 mb-7">
            <h1 class="text-3xl font-extrabold leading-none tracking-tight text-gray-900 lg:text-4xl dark:text-white">
                Daftar Organisasi yang Dikelola
            </h1>
        </div>

        <div class="container mx-auto p-8 lg:px-32">

            <!-- modal tambah aturan -->
            <div class="flex justify-end mb-4">
                <button data-modal-target="modal-law-input" data-modal-toggle="modal-law-input"
                    class="text-white bg-[#2557D6] hover:bg-[#2557D6]/90 focus:ring-4 focus:ring-[#2557D6]/50 focus:outline-none font-medium rounded-lg text-sm py-2 px-3 text-center inline-flex items-center me-2 mb-2 ml-auto"
                    title="" type="button">
                    <CirclePlusIcon class="w-5 mr-3 fill-current" />
                    Input Organisasi Baru
                </button>

                <div id="modal-law-input" tabindex="-1" aria-hidden="true"
                    class="hidden overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full">
                    <div class="relative p-4 w-full max-w-md max-h-full">
                        <!-- Modal content -->
                        <div class="relative bg-white rounded-lg shadow">
                            <!-- Modal header -->
                            <div class="flex items-center justify-between p-4 md:p-5 border-b rounded-t">
                                <h3 class="text-lg font-semibold text-gray-900">
                                    Tambahkan organisasi baru
                                </h3>
                                <button type="button"
                                    class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center"
                                    data-modal-toggle="modal-law-input">
                                    <svg class="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"
                                        fill="none" viewBox="0 0 14 14">
                                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
                                            stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
                                    </svg>
                                    <span class="sr-only">Tutup modal</span>
                                </button>
                            </div>
                            <!-- Modal body -->
                            <form class="p-4 md:p-5">
                                <div class="grid gap-4 mb-4 grid-cols-2">
                                    <div class="col-span-2">
                                        <label for="name"
                                            class="block mb-2 text-sm font-medium text-gray-900">Nama</label>
                                        <input type="text" name="name" id="name"
                                            class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                                            placeholder="Mis. Laboratorium Aplikasi Perusahaan" required>
                                    </div>
                                    <div class="col-span-2">
                                        <label for="pic" class="block mb-2 text-sm font-medium text-gray-900">
                                            Penanggung Jawab
                                        </label>
                                        <select id="pic"
                                            class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5">
                                            <option value="">Pilih PJ</option>
                                            <option value="">Husnil Kamil</option>
                                            <option value="">Ricky Akbar</option>
                                            <option value="">Jefril Rahmadoni</option>
                                        </select>
                                    </div>
                                    <div class="col-span-2">
                                        <label for="level" class="block mb-2 text-sm font-medium text-gray-900">
                                            Level
                                        </label>
                                        <select id="level"
                                            class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5">
                                            <!-- <option selected>Pilih level</option> -->
                                            <option value="">Laboratorium</option>
                                            <option value="">Departemen</option>
                                        </select>
                                    </div>
                                    <div class="col-span-2">
                                        <label for="explanation"
                                            class="block mb-2 text-sm font-medium text-gray-900">Keterangan</label>
                                        <textarea id="explanation" rows="4"
                                            class="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="ketikkan keterangan tambahan mengenai organisasi"></textarea>
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

            <div class="relative overflow-x-auto shadow-md sm:rounded-lg">
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
                                Level
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
                            <th scope="row" class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                                {{ item.nama }}
                            </th>
                            <td class="px-6 py-4">
                                {{ item.pj }}
                            </td>
                            <td class="px-6 py-4">
                                {{ item.lvl }}
                            </td>
                            <td class="px-6 py-4">
                                {{ item.ket }}
                            </td>
                            <td class="px-6 py-4 text-right">
                                <button :title="`Edit organisasi ${index + 1}`"
                                    class="px-3 py-2 h-9 mx-2 text-white bg-yellow-400 rounded-lg hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:ring-opacity-50 inline-flex">
                                    <PenToSquareIcon class="fill-current w-4" />
                                    <!-- Edit -->
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

    </main>
</template>