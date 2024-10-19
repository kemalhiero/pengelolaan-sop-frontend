<script setup>
import { ref } from 'vue';
import CirclePlusIcon from '@/assets/icons/CirclePlusIcon.vue';
import TrashCanIcon from '@/assets/icons/TrashCanIcon.vue';

// Define an array of steps with default empty values
const steps = ref([
    {
        kegiatan: '',
        pelaksana: '',
        tipePelaksana: '',
        perusahaan: '',
        kelengkapan: '',
        mutuBakuWaktu: '',
        output: '',
        keterangan: ''
    }
]);

// Function to add a new step (empty object)
const addStep = () => {
    steps.value.push({
        kegiatan: '',
        pelaksana: '',
        tipePelaksana: '',
        perusahaan: '',
        kelengkapan: '',
        mutuBakuWaktu: '',
        output: '',
        keterangan: ''
    })
};

// Function to remove a step by index
const removeStep = (index) => {
    steps.value.splice(index, 1)
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
                    <tr v-for="(step, index) in steps" :key="index"
                        class="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                        <th scope="row" class="px-2 py-3 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                            {{ index + 1 }}
                        </th>
                        <td class="px-2 py-3">
                            <input v-model="step.kegiatan" class="w-full p-2 border border-gray-300 rounded-md" />
                        </td>
                        <td class="px-2 py-3">
                            <select v-model="step.tipePelaksana" class="w-full p-2 border border-gray-300 rounded-md">
                                <option value="">Start/End</option>
                                <option value="">Task</option>
                                <option value="">Decision</option>
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
                            <input v-model="step.mutuBakuWaktu" class="w-full p-2 border border-gray-300 rounded-md" />
                        </td>
                        <td class="px-2 py-3">
                            <input v-model="step.output" class="w-full p-2 border border-gray-300 rounded-md" />
                        </td>
                        <td class="px-2 py-3">
                            <input v-model="step.keterangan" class="w-full p-2 border border-gray-300 rounded-md" />
                        </td>
                        <td class="px-2 py-3">
                            <button @click="removeStep(index)" :title="`Hapus tahapan ${index + 1}`"
                                class="px-3 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 inline-flex">
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
