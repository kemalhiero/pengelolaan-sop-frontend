<script setup>
import { inject } from 'vue';
import CirclePlusIcon from '@/assets/icons/CirclePlusIcon.vue';
import TrashCanIcon from '@/assets/icons/TrashCanIcon.vue';

const { sopStep, updateSopStep } = inject('sopStep');

// Function to add a new step (empty object)
const addStep = () => {
    sopStep.value.push({
        kegiatan: '',
        tipeKegiatan: '',
        pelaksana: '',
        perusahaan: '',
        kelengkapan: '',
        mutuBakuWaktu: '',
        output: '',
        keterangan: ''
    })
};

// Function to remove a step by index
const removeStep = (index) => {
    sopStep.value.splice(index, 1)
};

</script>

<template>
    <div class="max-w-screen-xl mx-auto px-3 md:px-0">
        <div class="relative overflow-x-auto sm:rounded-lg">
            <table class="w-full text-sm text-left text-gray-500">
                <thead class="text-xs text-gray-900 uppercase bg-gray-50">
                    <tr>
                        <th scope="col" class="px-2 py-3">No</th>
                        <th scope="col" class="px-2 py-3">Kegiatan</th>
                        <th scope="col" class="px-2 py-3">Tipe Kegiatan</th>
                        <th scope="col" class="px-2 py-3">Pelaksana</th>
                        <th scope="col" class="px-2 py-3">Kelengkapan</th>
                        <th scope="col" class="px-2 py-3">Waktu</th>
                        <th scope="col" class="px-2 py-3">Output</th>
                        <th scope="col" class="px-2 py-3">Keterangan</th>
                        <th scope="col" class="px-2 py-3">Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(step, index) in sopStep" :key="index"
                        class="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                        <th scope="row" class="px-2 py-3 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                            {{ index + 1 }}
                        </th>
                        <td class="px-2 py-3">
                            <input v-model="step.kegiatan" class="w-full p-2 border border-gray-300 rounded-md" />
                        </td>
                        <td class="px-2 py-3">
                            <select v-model="step.tipeKegiatan" class="w-full p-2 border border-gray-300 rounded-md">
                                <template v-if="index == 0">
                                    <option value="" selected>Start</option>
                                </template>
                                <template v-else>
                                    <option value="">Task</option>
                                    <option value="">Decision</option>                                    
                                    <option value="">End</option>
                                </template>
                            </select>
                        </td>
                        <td class="px-2 py-3">
                            <select v-model="step.pelaksana" class="w-full p-2 border border-gray-300 rounded-md">
                                <option value="Mahasiswa">Mahasiswa</option>
                                <option value="Departemen">Departemen</option>
                                <option value="Perusahaan">Perusahaan</option>
                            </select>
                        </td>
                        <td class="px-2 py-3">
                            <input v-model="step.kelengkapan" class="w-full p-2 border border-gray-300 rounded-md" />
                        </td>
                        <td class="px-2 py-3">
                            <!-- <input v-model="step.mutuBakuWaktu" class="w-full p-2 border border-gray-300 rounded-md" /> -->
                            <div class="flex items-center">
                                <input type="number" v-model="step.mutuBakuWaktu" min="0"
                                    class="bg-gray-50 border-t border-b border-gray-300 text-gray-900 text-sm p-2.5 rounded-l-md w-16"
                                    placeholder="">
                                <select class="p-2 border border-gray-300 rounded-r-md w-20">
                                    <option value="h">Jam</option>
                                    <option value="m">Menit</option>
                                    <option value="d">Hari</option>
                                    <option value="w">Minggu</option>
                                    <option value="mo">Bulan</option>
                                    <option value="y">Tahun</option>
                                </select>
                            </div>
                        </td>
                        <td class="px-2 py-3">
                            <input v-model="step.output" class="w-full p-2 border border-gray-300 rounded-md" />
                        </td>
                        <td class="px-2 py-3">
                            <input v-model="step.keterangan" class="w-full p-2 border border-gray-300 rounded-md " />
                        </td>
                        <td class="px-2 py-3">
                            <button @click="removeStep(index)" :title="`Hapus tahapan ${index + 1}`" :disabled="sopStep.length == 1"
                                class="px-3 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 inline-flex disabled:cursor-not-allowed">
                                <TrashCanIcon class="fill-current w-4" />
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>

            <!-- Tombol Tambah -->
            <div class="flex justify-center mt-4">
                <button @click="addStep"
                    class="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 inline-flex">
                    <CirclePlusIcon class="fill-current w-6 mr-2" />
                    Tambah Tahapan
                </button>
            </div>
        </div>
    </div>
</template>
