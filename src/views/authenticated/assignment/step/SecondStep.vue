<script setup>
import { inject, ref, watch } from 'vue';
import CirclePlusIcon from '@/assets/icons/CirclePlusIcon.vue';
import TrashCanIcon from '@/assets/icons/TrashCanIcon.vue';
import GearIcon from '@/assets/icons/GearIcon.vue';

const { formData } = inject('sopFormData');
const sopStep = inject('sopStep');
watch(
    sopStep,
    () => {
        if (sopStep.value.length > 0) {
            sopStep.value.sort((a, b) => a.seq_number - b.seq_number);
        }
    },
    { deep: true, immediate: true }
);
const isDisabled = inject('isDisabled');

// Modal state
const showBranchModal = ref(false);
const selectedStepIndex = ref(null);
const tempBranchConfig = ref({
    id_next_step_if_yes: null,
    id_next_step_if_no: null
});

// Function to open branch configuration modal
const openBranchModal = (index) => {
    selectedStepIndex.value = index;
    tempBranchConfig.value = {
        id_next_step_if_yes: sopStep.value[index].id_next_step_if_yes,
        id_next_step_if_no: sopStep.value[index].id_next_step_if_no
    };
    showBranchModal.value = true;
};

// Function to save branch configuration
const saveBranchConfig = () => {
    if (selectedStepIndex.value !== null) {
        sopStep.value[selectedStepIndex.value].id_next_step_if_yes = tempBranchConfig.value.id_next_step_if_yes;
        sopStep.value[selectedStepIndex.value].id_next_step_if_no = tempBranchConfig.value.id_next_step_if_no;
    }
    showBranchModal.value = false;
};

// Function to add a new step (empty object)
const addStep = () => {
    // Set seq_number berdasarkan posisi dalam array
    const newSeqNumber = sopStep.value.length + 1;
    sopStep.value.push({
        id_step: null,
        id_next_step_if_no: null,
        id_next_step_if_yes: null,
        seq_number: newSeqNumber, // Tetapkan sequence number berdasarkan posisi
        name: '',
        type: '',
        id_implementer: implementerId,
        fittings: '',
        time: 0,
        time_unit: 'm',
        output: '',
        description: ''
    });
};

// Function to remove a step by index
const removeStep = (index) => {
    sopStep.value.splice(index, 1);
    // Perbarui seq_number untuk semua langkah setelah penghapusan
    updateSequenceNumbers();
};

// Function to update sequence numbers for all steps
const updateSequenceNumbers = () => {
    sopStep.value.forEach((step, index) => {
        step.seq_number = index + 1;
    });
};

// Watch for changes in step array to ensure sequence numbers are up to date
watch(() => sopStep.value.length, () => {
    updateSequenceNumbers();
});

// Watch for changes in step type
watch(() => sopStep.value.map(step => step.type), (newTypes) => {
    sopStep.value.forEach((step, index) => {
        if (step.type !== 'decision') {
            // Reset next step IDs if type is not decision
            step.id_next_step_if_yes = null;
            step.id_next_step_if_no = null;
        }
    });
}, { deep: true });

// Watch implementer changes to auto-assign when there's only one
let implementerId = 0;
watch(() => formData.value.implementer,
    (newValue) => {
        if (newValue && newValue.length === 1 && sopStep.value) {
            // When there's exactly one implementer, auto-assign its ID to all steps
            implementerId = newValue[0].id;
            sopStep.value = sopStep.value.map(step => ({
                ...step,
                id_implementer: implementerId
            }));
        }
    },
    { immediate: true }
);

// Initialize sequence numbers when component is loaded
updateSequenceNumbers();
</script>

<template>
    <div class="max-w-screen-xl mx-auto px-3 md:px-0">
        <div class="relative overflow-x-auto sm:rounded-lg">
            <table class="w-full text-sm text-left">
                <thead class="text-xs uppercase bg-gray-50">
                    <tr>
                        <th scope="col" class="px-2 py-3">No</th>
                        <th scope="col" class="px-2 py-3">Kegiatan<span class="text-red-600">*</span></th>
                        <th scope="col" class="px-2 py-3">Tipe Kegiatan<span class="text-red-600">*</span></th>
                        <th scope="col" class="px-2 py-3">Pelaksana<span class="text-red-600">*</span></th>
                        <th scope="col" class="px-2 py-3">Kelengkapan</th>
                        <th scope="col" class="px-2 py-3">Waktu<span class="text-red-600">*</span></th>
                        <th scope="col" class="px-2 py-3">Output</th>
                        <th scope="col" class="px-2 py-3">Keterangan</th>
                        <th scope="col" class="px-2 py-3">Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(step, index) in sopStep" :key="index" class="bg-white border-b">
                        <th scope="row" class="px-2 py-3 font-medium whitespace-nowrap">
                            {{ step.seq_number || index + 1 }}
                        </th>
                        <td class="px-2 py-3">
                            <input type="hidden" v-model="step.id_step">
                            <input v-model="step.name" class="w-full p-2 border border-gray-300 rounded-md" :readonly="isDisabled" />
                        </td>
                        <td class="px-2 py-3">
                            <select v-model="step.type" class="w-full p-2 border border-gray-300 rounded-md disabled:opacity-100" :disabled="isDisabled">
                                <template v-if="index == 0">
                                    <option value="terminator" selected>Start</option>
                                </template>
                                <template v-else>
                                    <option value="task">Task</option>
                                    <option value="decision">Decision</option>
                                    <option v-if="index === sopStep.length - 1" value="terminator">End</option>
                                </template>
                            </select>
                            <!-- Tambahkan div untuk ringkasan cabang -->
                            <div v-if="step.type === 'decision'" class="mt-2 text-xs text-gray-500">
                                <template v-if="step.id_next_step_if_yes || step.id_next_step_if_no">
                                    <div class="space-y-1">
                                        <div v-if="step.id_next_step_if_no" class="flex items-center">
                                            <span class="text-red-600 mr-1">✗</span>
                                            Salah → Tahap {{sopStep.findIndex(s => s.id_step ===
                                            step.id_next_step_if_no) + 1 }}
                                        </div>
                                        <div v-if="step.id_next_step_if_yes" class="flex items-center">
                                            <span class="text-green-600 mr-1">✓</span>
                                            Benar → Tahap {{sopStep.findIndex(s => s.id_step ===
                                            step.id_next_step_if_yes) + 1 }}
                                        </div>
                                    </div>
                                </template>
                                <template v-else>
                                    <span class="italic">Belum diatur</span>
                                </template>
                            </div>
                        </td>
                        <td class="px-2 py-3">
                            <select v-model="step.id_implementer" class="w-full p-2 border border-gray-300 rounded-md disabled:opacity-100" :disabled="isDisabled">
                                <option v-for="(item, index) in formData.implementer" :value="item.id" :key="index">{{
                                    item.name }}</option>
                            </select>
                        </td>
                        <td class="px-2 py-3">
                            <input v-model="step.fittings" class="w-full p-2 border border-gray-300 rounded-md" :readonly="isDisabled" />
                        </td>
                        <td class="px-2 py-3">
                            <div class="flex items-center">
                                <input type="number" v-model="step.time" min="0" :readonly="isDisabled"
                                    class="bg-gray-50 border-t border-b border-gray-300 text-gray-900 text-sm p-2.5 rounded-l-md w-14"
                                    placeholder="">
                                <select v-model="step.time_unit" class="p-2 border border-gray-300 rounded-r-md w-20 disabled:opacity-100" :disabled="isDisabled">
                                    <option value="m">Menit</option>
                                    <option value="h">Jam</option>
                                    <option value="d">Hari</option>
                                    <option value="w">Minggu</option>
                                    <option value="mo">Bulan</option>
                                    <option value="y">Tahun</option>
                                </select>
                            </div>
                        </td>
                        <td class="px-2 py-3">
                            <input v-model="step.output" class="w-full p-2 border border-gray-300 rounded-md" :readonly="isDisabled" />
                        </td>
                        <td class="px-2 py-3">
                            <input v-model="step.description" class="w-full p-2 border border-gray-300 rounded-md " :readonly="isDisabled" />
                        </td>
                        <td class="px-2 py-3">
                            <div class="flex gap-2">
                                <button @click="removeStep(index)" :title="isDisabled ? 'Tidak dapat menghapus tahapan!' : `Hapus tahapan ${index + 1}`"
                                    :disabled="sopStep.length == 1 || isDisabled"
                                    class="px-3 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 inline-flex disabled:cursor-not-allowed disabled:bg-opacity-60">
                                    <TrashCanIcon class="fill-current w-4" />
                                </button>
                                <button v-if="step.type === 'decision'" @click="openBranchModal(index)"
                                    :title="isDisabled ? 'Tidak dapat mengkonfigurasi item!' : 'Konfigurasi Cabang Decision'" :disabled="isDisabled"
                                    class="px-3 py-2 text-white bg-gray-600 rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 inline-flex disabled:cursor-not-allowed disabled:bg-opacity-60">
                                    <GearIcon class="fill-current w-4" />
                                </button>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>

            <!-- Tombol Tambah -->
            <div class="flex justify-center mt-4">
                <button @click="addStep" :disabled="isDisabled"
                    :title="isDisabled ? 'Tidak dapat menambah tahapan!' : 'Tambah Tahapan'"
                    class="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 inline-flex disabled:cursor-not-allowed disabled:bg-opacity-60">
                    <CirclePlusIcon class="fill-current w-6 mr-2" />
                    Tambah Tahapan
                </button>
            </div>
        </div>

        <!-- Branch Configuration Modal -->
        <div v-if="showBranchModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
            @click="showBranchModal = false">
            <div class="bg-white p-6 rounded-lg w-96" @click.stop>
                <h3 class="text-lg font-semibold mb-4">Atur Cabang Keputusan - Tahap {{ selectedStepIndex + 1 }}</h3>

                <div class="mb-4">
                    <label class="block mb-2">❌Tahap Jika Salah:</label>
                    <select v-model="tempBranchConfig.id_next_step_if_no"
                        class="w-full p-2 border border-gray-300 rounded-md">
                        <option value="">Pilih tahap</option>
                        <option v-for="(step, idx) in sopStep" :key="idx" :value="step.id_step"
                            :disabled="idx === selectedStepIndex">
                            {{ `${idx + 1}. ${step.name}` }}
                        </option>
                    </select>
                </div>

                <div class="mb-4">
                    <label class="block mb-2">✅Tahap Jika Benar:</label>
                    <select v-model="tempBranchConfig.id_next_step_if_yes"
                        class="w-full p-2 border border-gray-300 rounded-md">
                        <option value="">Pilih tahap</option>
                        <option v-for="(step, idx) in sopStep" :key="idx" :value="step.id_step"
                            :disabled="idx === selectedStepIndex">
                            {{ `${idx + 1}. ${step.name}` }}
                        </option>
                    </select>
                </div>

                <div class="flex justify-end gap-2">
                    <button @click="showBranchModal = false"
                        class="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">
                        Batal
                    </button>
                    <button @click="saveBranchConfig"
                        class="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700">
                        Simpan
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>
