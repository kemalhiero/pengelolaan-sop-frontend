<script setup>
import { computed, inject, onBeforeUnmount, ref, watch } from 'vue';
import { toast } from 'vue3-toastify';

import { saveSopDisplayConfig, clearSopDisplayConfig } from '@/api/sopApi';
import roleAbbreviation from '@/data/roleAbbrv.json';
import useToastPromise from '@/utils/toastPromiseHandler';
import GearIcon from '@/assets/icons/GearIcon.vue';
import SopInfoTemplate from '@/components/sop/SopInfoTemplate.vue';
import SopStepTemplate from '@/components/sop/SopStepTemplate.vue';
import SopBpmnTemplate from '@/components/sop/SopBpmnTemplate.vue';
import DeleteDataModal from '@/components/modal/DeleteDataModal.vue';

const activeTab = ref('document');
const showConfigPanel = ref(false);
const sopStep = computed(() => [...sopStepRaw.value].sort((a, b) => a.seq_number - b.seq_number));

const assignmentInfo = inject('assignmentInfo');
const { formData } = inject('sopFormData');
const sopStepRaw = inject('sopStep');
const sopConfig = inject('sopConfig');
const idsopdetail = inject('idsopdetail');
const fetchSopDisplayConfig = inject('fetchSopDisplayConfig');
const isDisabled = inject('isDisabled');
const { flowchartArrowConfig, bpmnArrowConfig } = inject('arrowConfigs');

// BARU: State untuk mode edit panah
const arrowEditMode = ref(false);

// State untuk menampung update konfigurasi panah dari komponen anak
const flowchartArrowConfigUpdates = ref({});
const bpmnArrowConfigUpdates = ref({});

// BARU: Refs untuk komponen template
const sopStepTemplateRef = ref(null);
const sopBpmnTemplateRef = ref(null);

// BARU: State untuk tracking perubahan layout
const layoutChangeDetected = ref(false);
const showLayoutChangeModal = ref(false);
const pendingLayoutSave = ref(null);

// BARU: Watch untuk mendeteksi perubahan yang mempengaruhi layout
watch([
    () => sopConfig.value?.firstPageSteps,
    () => sopConfig.value?.nextPageSteps
], ([newFirstPage, newNextPage], [oldFirstPage, oldNextPage]) => {
    if (oldFirstPage !== undefined && oldNextPage !== undefined) {
        if (newFirstPage !== oldFirstPage || newNextPage !== oldNextPage) {
            layoutChangeDetected.value = true;
        }
    }
}, { deep: true });

// Handler untuk menerima update dari komponen anak
const handleFlowchartArrowUpdate = (config) => {
    flowchartArrowConfigUpdates.value = config;
};

const handleBpmnArrowUpdate = (config) => {
    bpmnArrowConfigUpdates.value = config;
};

// BARU: Handler untuk edit manual panah
const handleFlowchartManualEdit = (config) => {
    if (config.reset) {
        delete flowchartArrowConfigUpdates.value[config.connectionId];
    } else {
        flowchartArrowConfigUpdates.value = {
            ...flowchartArrowConfigUpdates.value,
            [config.connectionId]: config
        };
    }
};

const handleBpmnManualEdit = (config) => {
    if (config.reset) {
        delete bpmnArrowConfigUpdates.value[config.connectionId];
    } else {
        bpmnArrowConfigUpdates.value = {
            ...bpmnArrowConfigUpdates.value,
            [config.connectionId]: config
        };
    }
};

// BARU: Toggle mode edit panah
const toggleArrowEditMode = () => {
    arrowEditMode.value = !arrowEditMode.value;
};

// BARU: Reset panah ke konfigurasi terakhir (database atau algoritma)
const resetArrowsToLastSaved = () => {
    if (activeTab.value === 'document') {
        flowchartArrowConfigUpdates.value = {};
        if (sopStepTemplateRef.value) {
            sopStepTemplateRef.value.resetArrowsToLastSaved();
        }
    } else if (activeTab.value === 'bpmn') {
        bpmnArrowConfigUpdates.value = {};
        if (sopBpmnTemplateRef.value) {
            sopBpmnTemplateRef.value.resetArrowsToLastSaved();
        }
    }
};

// PERBAIKAN: Fungsi untuk menangani perubahan layout dengan invalidasi panah
const handleLayoutChange = async (clearArrows = false) => {
    if (clearArrows) {
        // Hapus konfigurasi panah manual karena layout berubah
        try {
            await clearSopDisplayConfig(idsopdetail, 'document');
            await clearSopDisplayConfig(idsopdetail, 'bpmn');
            
            flowchartArrowConfigUpdates.value = {};
            bpmnArrowConfigUpdates.value = {};
            
            await fetchSopDisplayConfig();
            
            // BARU: Force refresh template components
            if (sopStepTemplateRef.value) {
                sopStepTemplateRef.value.forceRecalculation();
            }
            if (sopBpmnTemplateRef.value) {
                sopBpmnTemplateRef.value.forceRecalculation();
            }
            
            toast.success('Konfigurasi panah direset karena layout berubah', { autoClose: 3000 });
        } catch (err) {
            console.warn('Gagal menghapus konfigurasi panah:', err);
        }
    }
    
    layoutChangeDetected.value = false;
    showLayoutChangeModal.value = false;
    
    if (pendingLayoutSave.value) {
        await pendingLayoutSave.value();
        pendingLayoutSave.value = null;
    }
};

// Handler ESC
function handleEscClose(e) {
    if (e.key === 'Escape') {
        if (showConfigPanel.value) {
            showConfigPanel.value = false;
        }
        if (showLayoutChangeModal.value) {
            showLayoutChangeModal.value = false;
            pendingLayoutSave.value = null;
        }
    }
}

// Pasang/lepas event listener saat panel dibuka/ditutup
watch([showConfigPanel, showLayoutChangeModal], ([configPanel, layoutModal]) => {
    if (configPanel || layoutModal) {
        window.addEventListener('keydown', handleEscClose);
    } else {
        window.removeEventListener('keydown', handleEscClose);
    }
});

onBeforeUnmount(() => {
    window.removeEventListener('keydown', handleEscClose);
});

const saveSopConfig = async () => {
    try {
        // PERBAIKAN: Gunakan hasAnyArrowConfig untuk deteksi
        if (layoutChangeDetected.value && hasAnyArrowConfig.value) {
            pendingLayoutSave.value = async () => {
                return await executeConfigSave();
            };
            showLayoutChangeModal.value = true;
            return;
        }
        
        await executeConfigSave();
    } catch (err) {
        toast.error('Gagal menyimpan konfigurasi!', { autoClose: 3000 });
        throw err;
    }
};

// BARU: Fungsi untuk eksekusi penyimpanan konfigurasi
const executeConfigSave = async () => {
    const promise = new Promise(async (resolve, reject) => {
        try {
            const finalFlowchartConfig = { ...flowchartArrowConfig.value, ...flowchartArrowConfigUpdates.value };
            const finalBpmnConfig = { ...bpmnArrowConfig.value, ...bpmnArrowConfigUpdates.value };

            await saveSopDisplayConfig(idsopdetail, {
                nominal_basic_page_steps: sopConfig.value.firstPageSteps,
                nominal_steps_both_opc: sopConfig.value.nextPageSteps,
                kegiatan_width: sopConfig.value.widthKegiatan,
                kelengkapan_width: sopConfig.value.widthKelengkapan,
                waktu_width: sopConfig.value.widthWaktu,
                output_width: sopConfig.value.widthOutput,
                ket_width: sopConfig.value.widthKeterangan,
                flowchart_arrow_config: JSON.stringify(finalFlowchartConfig),
                bpmn_arrow_config: JSON.stringify(finalBpmnConfig)
            });
            
            showConfigPanel.value = false;
            arrowEditMode.value = false;
            layoutChangeDetected.value = false;
            resolve();
        } catch (err) {
            reject(err);
        }
    });

    useToastPromise(promise, {
        messages: { success: 'Konfigurasi berhasil disimpan!' },
        toastOptions: { autoClose: 3000 }
    });
};

// BARU: Ekspos fungsi saveSopConfig agar bisa dipanggil dari parent component
defineExpose({
    saveSopConfig
});

// BARU: State untuk modal konfirmasi hapus
const showDeleteModal = ref(false);

// BARU: Computed untuk mengecek apakah ada konfigurasi tersimpan
const hasArrowConfig = computed(() => {
    if (activeTab.value === 'document') {
        return flowchartArrowConfig.value && Object.keys(flowchartArrowConfig.value).length > 0;
    } else if (activeTab.value === 'bpmn') {
        return bpmnArrowConfig.value && Object.keys(bpmnArrowConfig.value).length > 0;
    }
    return false;
});

// BARU: Computed untuk mengecek apakah ada konfigurasi panah untuk layout change
const hasAnyArrowConfig = computed(() => {
    const flowchartHasConfig = flowchartArrowConfig.value && Object.keys(flowchartArrowConfig.value).length > 0;
    const bpmnHasConfig = bpmnArrowConfig.value && Object.keys(bpmnArrowConfig.value).length > 0;
    return flowchartHasConfig || bpmnHasConfig;
});

// BARU: Fungsi untuk membuka modal konfirmasi
const openDeleteModal = () => {
    showDeleteModal.value = true;
};

// BARU: Hapus konfigurasi manual panah dengan konfirmasi
const confirmDeleteArrowConfigs = async () => {
    showDeleteModal.value = false;
    await clearArrowConfigs();
};

// BARU: Hapus konfigurasi manual panah
const clearArrowConfigs = async () => {
    try {
        const type = activeTab.value;
        
        const promise = new Promise(async (resolve, reject) => {
            try {
                await clearSopDisplayConfig(idsopdetail, type);
                console.log(`Konfigurasi panah ${idsopdetail} untuk ${type} berhasil dihapus dari database.`);
                
                if (type === 'document') {
                    flowchartArrowConfigUpdates.value = {};
                } else {
                    bpmnArrowConfigUpdates.value = {};
                }
                
                await fetchSopDisplayConfig();
                resolve();
            } catch (err) {
                reject(err);
            }
        });

        useToastPromise(promise, {
            messages: { success: 'Konfigurasi panah berhasil dihapus!' },
            toastOptions: { autoClose: 3000 }
        });
    } catch (err) {
        toast.error('Gagal menghapus konfigurasi panah!', { autoClose: 3000 });
    }
};
</script>

<template>
    <div class="max-w-screen-xl mx-auto mb-10">
        <div class="max-w-4xl mx-auto text-center print:hidden">
            <p>
                Berikut pratinjau dokumen dari data yang sudah anda masukkan sebelumnya. <br> 
                Periksa terlebih dahulu sebelum dikirim!
            </p>
        </div>

        <SopInfoTemplate class="mt-8"
            :name="assignmentInfo.name" :number="assignmentInfo.number"
            :created-date="assignmentInfo.creation_date" :revision-date="assignmentInfo.last_update_date"
            :section="formData.section" :warning="formData.warning"
            :pic-name="assignmentInfo.pic.name" :pic-number="assignmentInfo.pic.id_number"
            :pic-role="roleAbbreviation[assignmentInfo.pic_position || assignmentInfo.pic.role]"
            :law-basis="formData.legalBasis.map(item => item.legal)"
            :implement-qualification="formData.implementQualification"
            :related-sop="formData.relatedSop"
            :equipment="formData.equipment"
            :record-data="formData.record"
        />

        <div class="flex justify-center my-6 print:hidden">
            <div class="inline-flex rounded-md shadow-sm" role="group">
                <button @click="activeTab = 'document'" type="button" 
                    class="px-4 py-2 text-sm font-medium bg-white border-2 rounded-l-lg hover:bg-gray-200 focus:z-10 focus:ring-2 focus:ring-blue-700"
                    :class="activeTab === 'document' ? 'text-blue-700 border-blue-700' : 'text-gray-900 border-gray-200 hover:text-blue-700'">
                    Flowchart
                </button>
                <button @click="activeTab = 'bpmn'" type="button" 
                    class="px-4 py-2 text-sm font-medium bg-white border-2 rounded-r-lg hover:bg-gray-200 focus:z-10 focus:ring-2 focus:ring-blue-700"
                    :class="activeTab === 'bpmn' ? 'text-blue-700 border-blue-700' : 'text-gray-900 border-gray-200 hover:text-blue-700'">
                    BPMN
                </button>
            </div>
        </div>

        <!-- BARU: Tombol toggle edit mode panah -->
        <div class="flex justify-center my-4 print:hidden" v-if="!isDisabled">
            <button 
                @click="toggleArrowEditMode"
                :class="[
                    'px-4 py-2 text-sm font-medium rounded-lg border-2 transition-all duration-300',
                    arrowEditMode 
                        ? 'bg-orange-100 border-orange-500 text-orange-700 hover:bg-orange-200' 
                        : 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200'
                ]"
            >
                <span class="flex items-center gap-2">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    {{ arrowEditMode ? 'Selesai Edit Panah' : 'Edit Panah' }}
                </span>
            </button>
        </div>

        <!-- BARU: Tombol reset panah saat mode edit aktif -->
        <div v-if="arrowEditMode" class="flex justify-center gap-3 my-4 print:hidden">
            <button 
                @click="resetArrowsToLastSaved"
                class="px-3 py-2 text-sm font-medium bg-blue-100 border-2 border-blue-500 text-blue-700 rounded-lg hover:bg-blue-200 transition-all duration-300"
            >
                <span class="flex items-center gap-2">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Reset ke Kondisi Terakhir
                </span>
            </button>
            <button 
                v-if="hasArrowConfig"
                @click="openDeleteModal"
                class="px-3 py-2 text-sm font-medium bg-red-100 border-2 border-red-500 text-red-700 rounded-lg hover:bg-red-200 transition-all duration-300"
            >
                <span class="flex items-center gap-2">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Hapus Konfigurasi Manual
                </span>
            </button>
        </div>

        <!-- BARU: Petunjuk mode edit yang lebih informatif -->
        <div v-if="arrowEditMode" class="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4 print:hidden">
            <div class="flex items-start gap-3">
                <svg class="w-5 h-5 text-orange-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div class="text-sm text-orange-800">
                    <p class="font-semibold mb-2">Mode Edit Panah Aktif</p>
                    <ul class="space-y-1 text-xs">
                        <li>• <span class="font-medium">Hijau:</span> Titik awal panah (dapat digeser)</li>
                        <li>• <span class="font-medium">Merah:</span> Titik akhir panah (dapat digeser)</li>
                        <li>• <span class="font-medium">Biru:</span> Titik belok (dapat digeser dan dihapus)</li>
                        <li>• <span class="font-medium">Double-click pada panah:</span> Tambah titik belok baru</li>
                        <li>• <span class="font-medium">Reset ke Kondisi Terakhir:</span> Kembalikan ke konfigurasi terakhir sebelum perubahan</li>
                        <li v-if="hasArrowConfig">• <span class="font-medium">Hapus Konfigurasi Manual:</span> Hapus semua konfigurasi panah manual dan gunakan panah otomatis</li>
                        <li v-else class="text-orange-600">• <span class="font-medium">Info:</span> Belum ada konfigurasi panah manual tersimpan untuk {{ activeTab === 'document' ? 'Flowchart' : 'BPMN' }}</li>
                    </ul>
                </div>
            </div>
        </div>

        <SopStepTemplate
            v-if="activeTab === 'document'"
            ref="sopStepTemplateRef"
            :implementer="formData.implementer"
            :steps="sopStep"
            :arrow-config="flowchartArrowConfig"
            :edit-mode="arrowEditMode"
            @arrow-config-updated="handleFlowchartArrowUpdate"
            @manual-edit="handleFlowchartManualEdit"
        />

        <SopBpmnTemplate
            v-else-if="activeTab === 'bpmn'"
            ref="sopBpmnTemplateRef"
            :name="assignmentInfo.name"
            :steps="sopStep"
            :implementer="formData.implementer"
            :arrow-config="bpmnArrowConfig"
            :edit-mode="arrowEditMode"
            @arrow-config-updated="handleBpmnArrowUpdate"
            @manual-edit="handleBpmnManualEdit"
        />

        <!-- DIPERBAIKI: Floating panel dengan positioning dan labeling yang lebih baik -->
        <div class="fixed bottom-6 right-6 z-50 print:hidden">
            <!-- BARU: Indikator mode edit yang lebih subtle -->
            <div v-if="arrowEditMode" 
                class="absolute bottom-full right-0 mb-3 w-64 bg-orange-50 rounded-lg shadow-lg border border-orange-200 p-3">
                <div class="flex items-center gap-2 text-orange-800">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    <span class="text-sm font-medium">Mode Edit Panah Aktif</span>
                </div>
                <p class="text-xs text-orange-600 mt-1">Geser titik kontrol untuk mengatur panah</p>
            </div>

            <div v-if="showConfigPanel"
                class="absolute bottom-full right-0 mb-3 w-80 bg-white rounded-lg shadow-xl border border-gray-200 transition-all duration-300 transform origin-bottom-right text-sm">
                <div class="flex justify-between items-center bg-blue-50 p-3 rounded-t-lg border-b border-gray-200">
                    <!-- DIPERBAIKI: Label yang lebih jelas -->
                    <span class="font-medium">Pengaturan Layout SOP</span>
                    <button @click="showConfigPanel = false" class="text-gray-500 hover:text-gray-700 focus:outline-none">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <form @submit.prevent="saveSopConfig">
                    <div class="p-4 space-y-3">
                        <!-- DIPERBAIKI: Grouping yang lebih jelas -->
                        <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-3">
                            <div class="flex items-center gap-2 text-yellow-800 mb-2">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
                                </svg>
                                <span class="text-xs font-semibold">Layout & Pagination</span>
                            </div>
                            <p class="text-xs text-yellow-700 mb-2">Pastikan konfigurasi manual sudah dihapus terlebih dahulu sebelum merubah layout & pagination!</p>
                        </div>
                        
                        <div class="font-bold mb-2">Jumlah Tahapan per Halaman</div>
                        <div class="flex items-center gap-3">
                            <label class="block text-gray-700 font-medium mb-0.5 w-2/3">Hal. 1</label>
                            <input type="number" min="3" v-model.number="sopConfig.firstPageSteps"
                                class="w-1/3 border rounded-lg px-3 py-2 focus:outline-none focus:ring focus:border-blue-300 text-sm" />
                        </div>
                        <div class="flex items-center gap-3">
                            <label class="block text-gray-700 font-medium mb-0.5 w-2/3">Hal. Berikutnya</label>
                            <input type="number" min="3" v-model.number="sopConfig.nextPageSteps"
                                class="w-1/3 border rounded-lg px-3 py-2 focus:outline-none focus:ring focus:border-blue-300 text-sm" />
                        </div>
                        <hr class="my-2" />
                        <div class="font-bold mb-2">Lebar Kolom (%)</div>
                        <div class="flex items-center gap-3">
                            <label class="block text-gray-700 font-medium mb-0.5 w-2/3">Kegiatan</label>
                            <input type="number" min="11" max="100" v-model.number="sopConfig.widthKegiatan"
                                class="w-1/3 border rounded-lg px-3 py-2 focus:outline-none focus:ring focus:border-blue-300 text-sm" />
                        </div>
                        <div class="flex items-center gap-3">
                            <label class="block text-gray-700 font-medium mb-0.5 w-2/3">Kelengkapan</label>
                            <input type="number" min="16" max="100" v-model.number="sopConfig.widthKelengkapan"
                                class="w-1/3 border rounded-lg px-3 py-2 focus:outline-none focus:ring focus:border-blue-300 text-sm" />
                        </div>
                        <div class="flex items-center gap-3">
                            <label class="block text-gray-700 font-medium mb-0.5 w-2/3">Waktu</label>
                            <input type="number" min="9" max="100" v-model.number="sopConfig.widthWaktu"
                                class="w-1/3 border rounded-lg px-3 py-2 focus:outline-none focus:ring focus:border-blue-300 text-sm" />
                        </div>
                        <div class="flex items-center gap-3">
                            <label class="block text-gray-700 font-medium mb-0.5 w-2/3">Output</label>
                            <input type="number" min="9" max="100" v-model.number="sopConfig.widthOutput"
                                class="w-1/3 border rounded-lg px-3 py-2 focus:outline-none focus:ring focus:border-blue-300 text-sm" />
                        </div>
                        <div class="flex items-center gap-3">
                            <label class="block text-gray-700 font-medium mb-0.5 w-2/3">Keterangan</label>
                            <input type="number" min="5" max="100" v-model.number="sopConfig.widthKeterangan"
                            class="w-1/3 border rounded-lg px-3 py-2 focus:outline-none focus:ring focus:border-blue-300 text-sm" />
                        </div>
                        <div class="text-xs text-gray-500 mb-2">
                            <span class="font-semibold">Catatan:</span> Lebar kolom <span class="font-semibold">Pelaksana</span> akan dibagi rata berdasarkan jumlah pelaksana yang dipilih. Setiap kolom memiliki lebar: 70 dibagi jumlah pelaksana (%).
                        </div>
                    </div>
                    <div class="flex justify-end p-3 border-t">
                        <button type="button" @click="fetchSopDisplayConfig"
                            class="bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg px-5 py-2 font-semibold shadow focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition-all duration-300 text-sm mr-2">
                            Reset
                        </button>
                        <button type="submit" :disabled="isDisabled"
                            class="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-5 py-2 font-semibold shadow focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 transition-all duration-300 text-sm disabled:opacity-50 disabled:cursor-not-allowed">
                            Simpan
                        </button>
                    </div>
                </form>
            </div>
            <!-- DIPERBAIKI: Label tombol yang lebih jelas -->
            <button @click="showConfigPanel = !showConfigPanel"
                :title="showConfigPanel ? 'Tutup Pengaturan Layout' : 'Pengaturan Layout'"
                class="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-3 shadow-lg flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 transition-all duration-300"
                :class="{ 'rotate-45 bg-red-600 hover:bg-red-700': showConfigPanel }">
                    <GearIcon class="w-6 h-6 fill-current" :class="{ 'rotate-45': showConfigPanel }" />
            </button>
        </div>

        <!-- BARU: Modal konfirmasi perubahan layout -->
        <DeleteDataModal
            v-model:showModal="showLayoutChangeModal"
            :deleteData="() => handleLayoutChange(true)"
            :text="`Perubahan jumlah tahapan per halaman akan mereset semua konfigurasi panah manual. Apakah Anda ingin melanjutkan?`"
        />
        
        <!-- BARU: Tambahan tombol untuk tetap simpan tanpa hapus panah -->
        <div v-if="showLayoutChangeModal" class="fixed inset-0 z-50 flex items-center justify-center w-full h-full">
            <div class="fixed inset-0 bg-gray-800 bg-opacity-30" @click="showLayoutChangeModal = false"></div>
            <div class="relative p-4 w-full max-w-md max-h-full z-10">
                <div class="relative bg-white rounded-lg shadow">
                    <div class="p-4 md:p-5 text-center">
                        <svg class="mx-auto mb-4 text-yellow-400 w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                        <h3 class="mb-5 text-lg font-normal text-gray-500">
                            Perubahan jumlah tahapan per halaman akan mereset semua konfigurasi panah manual. Bagaimana Anda ingin melanjutkan?
                        </h3>
                        <div class="flex flex-col gap-2">
                            <button @click="handleLayoutChange(true)"
                                class="text-white bg-red-600 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm inline-flex items-center justify-center px-5 py-2.5">
                                Reset Panah & Simpan Layout
                            </button>
                            <button @click="handleLayoutChange(false)"
                                class="text-white bg-blue-600 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm inline-flex items-center justify-center px-5 py-2.5">
                                Simpan Layout Saja
                            </button>
                            <button @click="showLayoutChangeModal = false; pendingLayoutSave = null;"
                                class="py-2.5 px-5 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-200 focus:z-10 focus:ring-4 focus:ring-gray-100">
                                Batal
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Modal konfirmasi hapus konfigurasi panah -->
        <DeleteDataModal
            v-model:showModal="showDeleteModal"
            :deleteData="confirmDeleteArrowConfigs"
            :text="`Anda yakin ingin menghapus semua konfigurasi manual panah untuk ${activeTab === 'document' ? 'Flowchart' : 'BPMN'}? Panah akan kembali menggunakan algoritma otomatis.`"
        />
    </div>
</template>
