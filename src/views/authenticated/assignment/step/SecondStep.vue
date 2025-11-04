<script setup>
import { inject, ref, watch, nextTick, onBeforeUnmount, computed } from 'vue';
import CirclePlusIcon from '@/assets/icons/CirclePlusIcon.vue';
import TrashCanIcon from '@/assets/icons/TrashCanIcon.vue';
import GearIcon from '@/assets/icons/GearIcon.vue';

const { formData } = inject('sopFormData');
const isDisabled = inject('isDisabled');
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

// Function to insert a step at a specific index
const insertStep = (index) => {
    const newStep = {
        id_step: null,
        id_next_step_if_no: null,
        id_next_step_if_yes: null,
        seq_number: 0, // Will be updated by watcher
        name: '',
        type: 'task', // Default to 'task' for inserted steps
        id_implementer: implementerId,
        fittings: '',
        time: 0,
        time_unit: 'm',
        output: '',
        description: ''
    };
    sopStep.value.splice(index + 1, 0, newStep);
    updateSequenceNumbers();
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

const showTextEditModal = ref(false);
const editingField = ref('');
const editingIndex = ref(null);
const editingValue = ref('');
const textAreaRef = ref(null);

// Definisikan batas karakter untuk setiap field
const characterLimits = {
    name: 200,
    fittings: 200,
    output: 200,
    description: 300
};

// Computed property untuk mendapatkan batas karakter saat ini
const currentCharacterLimit = computed(() => {
    return characterLimits[editingField.value] || 0;
});

// Computed property untuk mendapatkan jumlah karakter saat ini
const currentCharacterCount = computed(() => {
    return editingValue.value ? editingValue.value.length : 0;
});

// Computed property untuk menentukan apakah mendekati batas
const isNearLimit = computed(() => {
    const limit = currentCharacterLimit.value;
    const count = currentCharacterCount.value;
    return count > limit * 0.8; // 80% dari batas
});

// Computed property untuk menentukan apakah melebihi batas
const isOverLimit = computed(() => {
    return currentCharacterCount.value > currentCharacterLimit.value;
});

function openTextEditModal(field, index, value) {
    if (isDisabled.value) return;
    editingField.value = field;
    editingIndex.value = index;
    editingValue.value = value;
    showTextEditModal.value = true;
    nextTick(() => {
        if (textAreaRef.value) textAreaRef.value.focus();
    });
}

function saveTextEditModal() {
    if (editingIndex.value !== null && editingField.value) {
        sopStep.value[editingIndex.value][editingField.value] = editingValue.value;
    }
    showTextEditModal.value = false;
}

function handleKey(e) {
    if (e.key === 'Escape' && showTextEditModal.value) {
        showTextEditModal.value = false;
    }
    // Simpan dengan Ctrl+Enter
    if (
        showTextEditModal.value &&
        (e.ctrlKey || e.metaKey) &&
        e.key === 'Enter'
    ) {
        saveTextEditModal();
    }
}

// Tambahkan watch untuk showTextEditModal
watch(showTextEditModal, (val) => {
    if (val) {
        window.addEventListener('keydown', handleKey);
    } else {
        window.removeEventListener('keydown', handleKey);
    }
});

// Pastikan event listener dibersihkan saat komponen unmount
onBeforeUnmount(() => {
    window.removeEventListener('keydown', handleKey);
});
</script>

<template>
    <div class="max-w-screen-xl mx-5 xl:mx-auto">
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
                            <input
                                v-model="step.name"
                                class="w-full p-2 border border-gray-300 rounded-md"
                                :readonly="true"
                                :disabled="isDisabled"
                                :class="{ 'cursor-pointer': !isDisabled }"
                                @click="!isDisabled && openTextEditModal('name', index, step.name)"
                                @keydown.enter="!isDisabled && openTextEditModal('name', index, step.name)"
                            />
                        </td>
                        <td class="px-1 py-3">
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
                            <div v-if="step.type === 'decision'" class="mt-2 text-xs text-gray-500">
                                <template v-if="step.id_next_step_if_yes || step.id_next_step_if_no">
                                    <div class="space-y-1">
                                        <div v-if="step.id_next_step_if_no" class="flex items-center">
                                            <span class="text-red-600 mr-0.5">✗</span>
                                            Salah → Tahap {{sopStep.findIndex(s => s.id_step === step.id_next_step_if_no) + 1 }}
                                        </div>
                                        <div v-if="step.id_next_step_if_yes" class="flex items-center">
                                            <span class="text-green-600 mr-0.5">✓</span>
                                            Benar → Tahap {{sopStep.findIndex(s => s.id_step === step.id_next_step_if_yes) + 1 }}
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
                                <option v-for="(item, index) in formData.implementer" :value="item.id" :key="index">{{ item.name }}</option>
                            </select>
                        </td>
                        <td class="px-2 py-3">
                            <input
                                v-model="step.fittings"
                                class="w-full p-2 border border-gray-300 rounded-md"
                                :readonly="true"
                                :disabled="isDisabled"
                                :class="{ 'cursor-pointer': !isDisabled }"
                                @click="!isDisabled && openTextEditModal('fittings', index, step.fittings)"
                                @keydown.enter="!isDisabled && openTextEditModal('fittings', index, step.fittings)"
                            />
                        </td>
                        <td class="px-2 py-3">
                            <div class="flex items-center">
                                <input type="number" v-model="step.time" min="0" :readonly="isDisabled" placeholder=""
                                    class="bg-gray-50 border-t border-b border-gray-300 text-gray-900 text-sm p-2.5 rounded-l-md w-14">
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
                            <input
                                v-model="step.output"
                                class="w-full p-2 border border-gray-300 rounded-md"
                                :readonly="true"
                                :disabled="isDisabled"
                                :class="{ 'cursor-pointer': !isDisabled }"
                                @click="!isDisabled && openTextEditModal('output', index, step.output)"
                                @keydown.enter="!isDisabled && openTextEditModal('output', index, step.output)"
                            />
                        </td>
                        <td class="px-2 py-3">
                            <input
                                v-model="step.description"
                                class="w-full p-2 border border-gray-300 rounded-md"
                                :readonly="true"
                                :disabled="isDisabled"
                                :class="{ 'cursor-pointer': !isDisabled }"
                                @click="!isDisabled && openTextEditModal('description', index, step.description)"
                                @keydown.enter="!isDisabled && openTextEditModal('description', index, step.description)"
                            />
                        </td>
                        <td class="px-2 py-3 relative">
                            <div class="flex justify-center gap-2">
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
                            <button v-if="index < sopStep.length - 1 && !isDisabled" @click="insertStep(index)" :title="`Sisipkan tahapan baru antara tahapan ${index + 1} dan ${index + 2}`"
                                class="group absolute -bottom-3 left-1/2 -translate-x-1/2 z-10 bg-white p-0.5 rounded-full">
                                <CirclePlusIcon class="fill-current w-5 text-blue-600 opacity-20 group-hover:opacity-100 transition-opacity duration-200" />
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- Tombol Tambah -->
        <div class="flex justify-center mt-4">
            <button @click="addStep" :disabled="isDisabled" :title="isDisabled ? 'Tidak dapat menambah tahapan!' : 'Tambah Tahapan'"
                class="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 inline-flex disabled:cursor-not-allowed disabled:bg-opacity-60">
                <CirclePlusIcon class="fill-current w-6 mr-2" />
                Tambah Tahapan
            </button>
        </div>

        <!-- Branch Configuration Modal -->
        <transition name="fade-modal">
            <div v-show="showBranchModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" @click="showBranchModal = false">
                <div class="bg-white p-6 rounded-lg w-96" @click.stop>
                    <h3 class="text-lg font-semibold mb-4">Atur Cabang Keputusan - Tahap {{ selectedStepIndex + 1 }}</h3>

                    <div class="mb-4">
                        <label class="block mb-2">❌Tahap Jika Salah:</label>
                        <select v-model="tempBranchConfig.id_next_step_if_no" class="w-full p-2 border border-gray-300 rounded-md">
                            <option value="">Pilih tahap</option>
                            <option v-for="(step, idx) in sopStep" :key="idx" :value="step.id_step" :disabled="idx === selectedStepIndex">
                                {{ `${idx + 1}. ${step.name}` }}
                            </option>
                        </select>
                    </div>

                    <div class="mb-4">
                        <label class="block mb-2">✅Tahap Jika Benar:</label>
                        <select v-model="tempBranchConfig.id_next_step_if_yes" class="w-full p-2 border border-gray-300 rounded-md">
                            <option value="">Pilih tahap</option>
                            <option v-for="(step, idx) in sopStep" :key="idx" :value="step.id_step" :disabled="idx === selectedStepIndex">
                                {{ `${idx + 1}. ${step.name}` }}
                            </option>
                        </select>
                    </div>

                    <div class="flex justify-end gap-2">
                        <button @click="showBranchModal = false" class="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">
                            Batal
                        </button>
                        <button @click="saveBranchConfig" class="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700">
                            Simpan
                        </button>
                    </div>
                </div>
            </div>
        </transition>

        <!-- Modal Editor Teks -->
        <transition name="fade-modal">
            <div v-show="showTextEditModal" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50" @click="showTextEditModal = false">
                <div class="bg-white p-0 rounded-2xl shadow-2xl w-[95vw] max-w-lg relative" @click.stop>
                    <!-- Header -->
                    <div class="flex items-center justify-between px-6 py-4">
                        <h3 class="text-base font-semibold">
                            Edit {{
                                    editingField === 'name' ? 'Kegiatan' :
                                    editingField === 'fittings' ? 'Kelengkapan' :
                                    editingField === 'output' ? 'Output' :
                                    editingField === 'description' ? 'Keterangan' : editingField
                            }}
                            Tahap {{ (editingIndex !== null ? editingIndex + 1 : '') }}
                        </h3>
                        <button @click="showTextEditModal = false" class="text-gray-400 hover:text-red-500 transition p-1 rounded-full focus:outline-none">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    <!-- Body -->
                    <div class="px-6">
                        <textarea
                            v-model="editingValue"
                            rows="8"
                            ref="textAreaRef"
                            :maxlength="currentCharacterLimit"
                            class="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition resize-vertical text-sm placeholder-gray-400"
                            :class="{ 
                                'border-red-300 focus:ring-red-200 focus:border-red-400': isOverLimit,
                                'border-yellow-300 focus:ring-yellow-200 focus:border-yellow-400': isNearLimit && !isOverLimit
                            }"
                            placeholder="Tulis di sini..."
                        ></textarea>
                        <!-- Character Counter -->
                        <div class="flex justify-between items-center mt-2">
                            <div class="text-xs text-gray-500">
                                <span v-if="isOverLimit" class="text-red-600">
                                    ⚠️ Melebihi batas karakter
                                </span>
                                <span v-else-if="isNearLimit" class="text-yellow-600">
                                    ⚠️ Mendekati batas karakter
                                </span>
                                <span v-else class="text-gray-500">
                                    Karakter yang digunakan
                                </span>
                            </div>
                            <div class="text-xs font-mono" 
                                 :class="{
                                    'text-red-600': isOverLimit,
                                    'text-yellow-600': isNearLimit && !isOverLimit,
                                    'text-gray-600': !isNearLimit
                                 }">
                                {{ currentCharacterCount }} / {{ currentCharacterLimit }}
                            </div>
                        </div>
                    </div>
                    <!-- Footer -->
                    <div class="flex justify-between items-center gap-2 px-6 py-4 bg-gray-50 rounded-b-2xl">
                        <p class="text-xs text-gray-500 flex items-center gap-2 m-0">
                            <span class="inline-flex items-center gap-1">
                                <kbd class="px-1 py-0.5 bg-gray-100 border rounded text-xs font-mono">Esc</kbd>
                                tutup
                            </span>
                            <span class="inline-flex items-center gap-1 ml-4">
                                <kbd class="px-1 py-0.5 bg-gray-100 border rounded text-xs font-mono">Ctrl</kbd>
                                <span class="mx-1">/</span>
                                <kbd class="px-1 py-0.5 bg-gray-100 border rounded text-xs font-mono">Cmd</kbd>
                                +
                                <kbd class="px-1 py-0.5 bg-gray-100 border rounded text-xs font-mono">Enter</kbd>
                                simpan
                            </span>
                        </p>
                        <div class="flex gap-2">
                            <button @click="showTextEditModal = false"
                                class="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-100 transition text-sm">
                                Batal
                            </button>
                            <button @click="saveTextEditModal" :disabled="isOverLimit"
                                class="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition text-sm shadow disabled:bg-gray-400 disabled:cursor-not-allowed">
                                Simpan
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </transition>
    </div>
</template>

<style scoped>
.fade-modal-enter-active, .fade-modal-leave-active {
  transition: opacity 0.25s cubic-bezier(.4,0,.2,1), transform 0.25s cubic-bezier(.4,0,.2,1);
}
.fade-modal-enter-from, .fade-modal-leave-to {
  opacity: 0;
  transform: translateY(24px);
}
.fade-modal-enter-to, .fade-modal-leave-from {
  opacity: 1;
  transform: translateY(0);
}
</style>
