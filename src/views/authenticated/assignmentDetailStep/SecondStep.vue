<script setup>
import { inject } from 'vue';
import CirclePlusIcon from '@/assets/icons/CirclePlusIcon.vue';
import TrashCanIcon from '@/assets/icons/TrashCanIcon.vue';

const { sopStep } = inject('sopStep');
const { formData } = inject('sopFormData');

// Function to add a new step (empty object)
const addStep = () => {
    sopStep.value.push({
        id_step: null,
        id_next_step_if_no: null,
        id_next_step_if_yes: null,
        seq_number: null,
        name: '',
        type: '',
        id_implementer: '',
        fittings: '',
        time: '',
        time_unit: 'h',
        output: '',
        description: ''
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
            <table class="w-full text-sm text-left">
                <thead class="text-xs uppercase bg-gray-50">
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
                        class="bg-white border-b">
                        <th scope="row" class="px-2 py-3 font-medium whitespace-nowrap">
                            {{ index + 1 }}
                        </th>
                        <td class="px-2 py-3">
                            <input type="hidden" v-model="step.id_step">
                            <input v-model="step.name" class="w-full p-2 border border-gray-300 rounded-md" />
                        </td>
                        <td class="px-2 py-3">
                            <select v-model="step.type" class="w-full p-2 border border-gray-300 rounded-md">
                                <template v-if="index == 0">
                                    <option value="terminator" selected>Start</option>
                                </template>
                                <template v-else>
                                    <option value="task">Task</option>
                                    <option value="decision">Decision</option>                                    
                                    <option value="terminator">End</option>
                                </template>
                            </select>
                        </td>
                        <td class="px-2 py-3">
                            <select v-model="step.id_implementer" class="w-full p-2 border border-gray-300 rounded-md">
                                <option v-for="(item, index) in formData.implementer" :value="item.id" :key="index">{{ item.name }}</option>
                            </select>
                        </td>
                        <td class="px-2 py-3">
                            <input v-model="step.fittings" class="w-full p-2 border border-gray-300 rounded-md" />
                        </td>
                        <td class="px-2 py-3">
                            <!-- <input v-model="step.mutuBakuWaktu" class="w-full p-2 border border-gray-300 rounded-md" /> -->
                            <div class="flex items-center">
                                <input type="number" v-model="step.time" min="0"
                                    class="bg-gray-50 border-t border-b border-gray-300 text-gray-900 text-sm p-2.5 rounded-l-md w-14"
                                    placeholder="">
                                <select v-model="step.time_unit" class="p-2 border border-gray-300 rounded-r-md w-20">
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
                            <input v-model="step.description" class="w-full p-2 border border-gray-300 rounded-md " />
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
