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

// PERBAIKAN: Handler untuk menjaga konfigurasi sementara
const handleFlowchartArrowUpdate = (config) => {
    // Merge dengan konfigurasi update yang sudah ada, jangan replace
    flowchartArrowConfigUpdates.value = {
        ...flowchartArrowConfigUpdates.value,
        ...config
    };
};

const handleBpmnArrowUpdate = (config) => {
    // Merge dengan konfigurasi update yang sudah ada, jangan replace
    bpmnArrowConfigUpdates.value = {
        ...bpmnArrowConfigUpdates.value,
        ...config
    };
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
    // Jika tidak ada perubahan yang belum disimpan, tidak perlu reset
    if (!hasUnsavedArrowChanges.value) {
        toast.info('Tidak ada perubahan yang perlu direset', { autoClose: 3000 });
        return;
    }
    
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

// PERBAIKAN: Watch untuk panel konfigurasi saja
watch(showConfigPanel, (configPanel) => {
    if (configPanel) {
        window.addEventListener('keydown', handleEscClose);
    } else {
        window.removeEventListener('keydown', handleEscClose);
    }
});

function handleEscClose(e) {
    if (e.key === 'Escape') {
        if (showConfigPanel.value) {
            showConfigPanel.value = false;
        }
    }
}

onBeforeUnmount(() => {
    window.removeEventListener('keydown', handleEscClose);
});

const saveSopConfig = async () => {
    try {
        await executeConfigSave();
    } catch (err) {
        toast.error('Gagal menyimpan konfigurasi!', { autoClose: 3000 });
        throw err;
    }
};

const finalFlowchartConfig = computed(() => {
    const merged = { ...flowchartArrowConfig.value, ...flowchartArrowConfigUpdates.value };
    // console.log('finalFlowchartConfig - Database config:', flowchartArrowConfig.value);
    // console.log('finalFlowchartConfig - Updates config:', flowchartArrowConfigUpdates.value);
    // console.log('finalFlowchartConfig - Merged config:', merged);
    return merged;
});

const finalBpmnConfig = computed(() => {
    const merged = { ...bpmnArrowConfig.value, ...bpmnArrowConfigUpdates.value };
    // console.log('finalBpmnConfig - Database config:', bpmnArrowConfig.value);
    // console.log('finalBpmnConfig - Updates config:', bpmnArrowConfigUpdates.value);
    // console.log('finalBpmnConfig - Merged config:', merged);
    return merged;
});

// BARU: Fungsi untuk eksekusi penyimpanan konfigurasi
const executeConfigSave = async () => {
    const promise = new Promise(async (resolve, reject) => {
        try {
            await saveSopDisplayConfig(idsopdetail, {
                nominal_basic_page_steps: sopConfig.value.firstPageSteps,
                nominal_steps_both_opc: sopConfig.value.nextPageSteps,
                kegiatan_width: sopConfig.value.widthKegiatan,
                kelengkapan_width: sopConfig.value.widthKelengkapan,
                waktu_width: sopConfig.value.widthWaktu,
                output_width: sopConfig.value.widthOutput,
                ket_width: sopConfig.value.widthKeterangan,
                flowchart_arrow_config: JSON.stringify(finalFlowchartConfig.value),
                bpmn_arrow_config: JSON.stringify(finalBpmnConfig.value)
            });
            
            showConfigPanel.value = false;
            arrowEditMode.value = false;
            
            // BARU: Setelah simpan, refresh dari database dan force recalculation
            await fetchSopDisplayConfig();
            
            // BARU: Force refresh template components untuk memastikan menggunakan data terbaru
            if (sopStepTemplateRef.value) {
                sopStepTemplateRef.value.forceRecalculation();
            }
            if (sopBpmnTemplateRef.value) {
                sopBpmnTemplateRef.value.forceRecalculation();
            }
            
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

// BARU: Hapus konfigurasi manual panah
const clearArrowConfigs = async () => {
    try {
        const type = activeTab.value;
        
        const promise = new Promise(async (resolve, reject) => {
            try {
                await clearSopDisplayConfig(idsopdetail, type);
                console.log(`Konfigurasi panah ${idsopdetail} untuk ${type} berhasil dihapus dari database.`);
                
                // PERBAIKAN: Reset semua state updates sementara
                if (type === 'document') {
                    flowchartArrowConfigUpdates.value = {};
                } else {
                    bpmnArrowConfigUpdates.value = {};
                }
                
                // Refresh konfigurasi dari database
                await fetchSopDisplayConfig();
                
                // BARU: Force refresh template components untuk memastikan menggunakan algoritma
                if (sopStepTemplateRef.value) {
                    sopStepTemplateRef.value.forceRecalculation();
                }
                if (sopBpmnTemplateRef.value) {
                    sopBpmnTemplateRef.value.forceRecalculation();
                }
                
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

// BARU: Computed untuk mengecek apakah form layout harus disabled
const isLayoutFormDisabled = computed(() => {
    return hasAnyArrowConfig.value || isDisabled.value;
});

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
    // const bpmnHasConfig = bpmnArrowConfig.value && Object.keys(bpmnArrowConfig.value).length > 0;
    return flowchartHasConfig;
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

// PERBAIKAN: Watch untuk debug perubahan arrowConfig dari injected values
// watch([flowchartArrowConfig, bpmnArrowConfig], ([newFlowchart, newBpmn], [oldFlowchart, oldBpmn]) => {
//     console.log('Injected flowchartArrowConfig changed from:', oldFlowchart, 'to:', newFlowchart);
//     console.log('Injected bpmnArrowConfig changed from:', oldBpmn, 'to:', newBpmn);
// }, { deep: true });

// PERBAIKAN: Watch untuk debug perubahan updates
// watch([flowchartArrowConfigUpdates, bpmnArrowConfigUpdates], ([newFlowchartUpdates, newBpmnUpdates], [oldFlowchartUpdates, oldBpmnUpdates]) => {
//     console.log('FlowchartArrowConfigUpdates changed from:', oldFlowchartUpdates, 'to:', newFlowchartUpdates);
//     console.log('BpmnArrowConfigUpdates changed from:', oldBpmnUpdates, 'to:', newBpmnUpdates);
// }, { deep: true });

// BARU: Computed untuk mengecek apakah ada perubahan yang belum disimpan
const hasUnsavedArrowChanges = computed(() => {
    if (activeTab.value === 'document') {
        // Bandingkan flowchartArrowConfigUpdates dengan yang sudah disimpan
        const updates = flowchartArrowConfigUpdates.value;
        const saved = flowchartArrowConfig.value || {};
        
        // Jika tidak ada updates sama sekali, tidak ada perubahan
        if (!updates || Object.keys(updates).length === 0) {
            return false;
        }
        
        // Cek setiap connection yang ada updates
        for (const connectionId in updates) {
            const updatedConfig = updates[connectionId];
            const savedConfig = saved[connectionId];
            
            // Jika tidak ada config tersimpan untuk connection ini, berarti ada perubahan baru
            if (!savedConfig) {
                return true;
            }
            
            // Bandingkan konfigurasi secara detail
            if (hasConfigurationDifference(updatedConfig, savedConfig)) {
                return true;
            }
        }
        
        return false;
    } else if (activeTab.value === 'bpmn') {
        // Bandingkan bpmnArrowConfigUpdates dengan yang sudah disimpan
        const updates = bpmnArrowConfigUpdates.value;
        const saved = bpmnArrowConfig.value || {};
        
        // Jika tidak ada updates sama sekali, tidak ada perubahan
        if (!updates || Object.keys(updates).length === 0) {
            return false;
        }
        
        // Cek setiap connection yang ada updates
        for (const connectionId in updates) {
            const updatedConfig = updates[connectionId];
            const savedConfig = saved[connectionId];
            
            // Jika tidak ada config tersimpan untuk connection ini, berarti ada perubahan baru
            if (!savedConfig) {
                return true;
            }
            
            // Bandingkan konfigurasi secara detail
            if (hasConfigurationDifference(updatedConfig, savedConfig)) {
                return true;
            }
        }
        
        return false;
    }
    
    return false;
});

// BARU: Fungsi helper untuk membandingkan konfigurasi panah
const hasConfigurationDifference = (config1, config2) => {
    if (!config1 || !config2) return true;
    
    // Bandingkan startPoint
    if (config1.startPoint && config2.startPoint) {
        if (Math.abs(config1.startPoint.x - config2.startPoint.x) > 1 || 
            Math.abs(config1.startPoint.y - config2.startPoint.y) > 1) {
            return true;
        }
    } else if (config1.startPoint !== config2.startPoint) {
        return true;
    }
    
    // Bandingkan endPoint
    if (config1.endPoint && config2.endPoint) {
        if (Math.abs(config1.endPoint.x - config2.endPoint.x) > 1 || 
            Math.abs(config1.endPoint.y - config2.endPoint.y) > 1) {
            return true;
        }
    } else if (config1.endPoint !== config2.endPoint) {
        return true;
    }
    
    // Bandingkan bendPoints
    const bendPoints1 = config1.bendPoints || [];
    const bendPoints2 = config2.bendPoints || [];
    
    if (bendPoints1.length !== bendPoints2.length) {
        return true;
    }
    
    for (let i = 0; i < bendPoints1.length; i++) {
        if (Math.abs(bendPoints1[i].x - bendPoints2[i].x) > 1 || 
            Math.abs(bendPoints1[i].y - bendPoints2[i].y) > 1) {
            return true;
        }
    }
    
    // Bandingkan sSide dan eSide
    if (config1.sSide !== config2.sSide || config1.eSide !== config2.eSide) {
        return true;
    }
    
    // Bandingkan label position jika ada
    if (config1.labelPosition && config2.labelPosition) {
        if (Math.abs(config1.labelPosition.x - config2.labelPosition.x) > 1 || 
            Math.abs(config1.labelPosition.y - config2.labelPosition.y) > 1) {
            return true;
        }
    } else if (config1.labelPosition !== config2.labelPosition) {
        return true;
    }
    
    return false;
};

// BARU: Watch untuk debug perubahan yang belum disimpan
// watch(hasUnsavedArrowChanges, (newValue, oldValue) => {
//     console.log(`[ThirdStep] hasUnsavedArrowChanges changed from ${oldValue} to ${newValue}`);
//     if (newValue) {
//         const activeUpdates = activeTab.value === 'document' ? flowchartArrowConfigUpdates.value : bpmnArrowConfigUpdates.value;
//         console.log(`[ThirdStep] Unsaved changes detected:`, activeUpdates);
//     }
// });

// // BARU: Watch untuk debug perubahan updates
// watch([flowchartArrowConfigUpdates, bpmnArrowConfigUpdates], ([newFlowchartUpdates, newBpmnUpdates]) => {
//     console.log('[ThirdStep] Arrow config updates changed:', {
//         flowchart: newFlowchartUpdates,
//         bpmn: newBpmnUpdates
//     });
// }, { deep: true });
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

        <div v-if="arrowEditMode" class="flex justify-center gap-3 my-4 print:hidden">
            <button 
                @click="resetArrowsToLastSaved"
                :disabled="!hasUnsavedArrowChanges"
                :class=" [
                    'px-3 py-2 text-sm font-medium border-2 rounded-lg transition-all duration-300',
                    hasUnsavedArrowChanges 
                        ? 'bg-blue-100 border-blue-500 text-blue-700 hover:bg-blue-200 cursor-pointer' 
                        : 'bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed opacity-50'
                ]"
            >
                <span class="flex items-center gap-2">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Reset ke Kondisi Terakhir
                </span>
            </button>
            <button 
                :disabled="!hasArrowConfig" 
                @click="openDeleteModal"
                :class=" [
                    'px-3 py-2 text-sm font-medium border-2 rounded-lg transition-all duration-300',
                    hasArrowConfig 
                        ? 'bg-red-100 border-red-500 text-red-700 hover:bg-red-200 cursor-pointer' 
                        : 'bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed opacity-50'
                ]"
            >
                <span class="flex items-center gap-2">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Hapus Konfigurasi Manual
                </span>
            </button>
        </div>

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
                        <li>
                            • <span class="font-medium">Reset ke Kondisi Terakhir:</span> 
                            <span v-if="hasUnsavedArrowChanges" class="text-green-700">
                                Kembalikan ke konfigurasi terakhir sebelum perubahan
                            </span>
                            <span v-else class="text-orange-600">
                                Belum ada perubahan panah terbaru pada {{ activeTab === 'document' ? 'Flowchart' : 'BPMN' }}
                            </span>
                        </li>
                        <li>
                            • <span class="font-medium">Hapus Konfigurasi Manual:</span>
                            <span v-if="hasArrowConfig" class="text-green-700">
                                Hapus semua konfigurasi panah manual dan gunakan panah otomatis
                            </span>
                            <span v-else class="text-orange-600">
                                Belum ada konfigurasi panah manual tersimpan untuk {{ activeTab === 'document' ? 'Flowchart' : 'BPMN' }}
                            </span>
                        </li>
                    </ul>
                </div>
            </div>
        </div>

        <SopStepTemplate
            v-if="activeTab === 'document'"
            ref="sopStepTemplateRef"
            :implementer="formData.implementer"
            :steps="sopStep"
            :arrow-config="finalFlowchartConfig"
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
            :arrow-config="finalBpmnConfig"
            :edit-mode="arrowEditMode"
            @arrow-config-updated="handleBpmnArrowUpdate"
            @manual-edit="handleBpmnManualEdit"
        />

        <div class="fixed bottom-6 right-6 z-50 print:hidden">
            <div v-if="showConfigPanel && activeTab === 'document'"
                class="absolute bottom-full right-0 mb-3 w-80 bg-white rounded-lg shadow-xl border border-gray-200 transition-all duration-300 transform origin-bottom-right text-sm">
                <div class="flex justify-between items-center bg-blue-50 p-3 rounded-t-lg border-b border-gray-200">
                    <span class="font-medium">Pengaturan Layout SOP</span>
                    <button @click="showConfigPanel = false" class="text-gray-500 hover:text-gray-700 focus:outline-none">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <form @submit.prevent="saveSopConfig">
                    <div class="p-4 space-y-3">
                        <div v-if="hasAnyArrowConfig" class="bg-red-50 border border-red-200 rounded-lg p-3 mb-3">
                            <div class="flex items-center gap-2 text-red-800 mb-2">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
                                </svg>
                                <span class="text-xs font-semibold">Konfigurasi Panah Manual Aktif</span>
                            </div>
                            <p class="text-xs text-red-700 mb-2">
                                Hapus konfigurasi panah manual terlebih dahulu sebelum mengubah layout & pagination!
                            </p>
                        </div>
                        <div v-else class="bg-green-50 border border-green-200 rounded-lg p-3 mb-3">
                            <div class="flex items-center gap-2 text-green-800 mb-2">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span class="text-xs font-semibold">Layout & Pagination</span>
                            </div>
                            <p class="text-xs text-green-700 mb-2">
                                Anda dapat mengubah pengaturan layout dan pagination
                            </p>
                        </div>
                        
                        <div class="font-bold mb-2" :class="{ 'opacity-50': isLayoutFormDisabled }">Jumlah Tahapan per Halaman</div>
                        <div class="flex items-center gap-3">
                            <label class="block text-gray-700 font-medium mb-0.5 w-2/3" :class="{ 'opacity-50': isLayoutFormDisabled }">Hal. 1</label>
                            <input type="number" min="3" v-model.number="sopConfig.firstPageSteps"
                                :disabled="isLayoutFormDisabled" :class="{ 'opacity-50': isLayoutFormDisabled }"
                                class="w-1/3 border rounded-lg px-3 py-2 focus:outline-none focus:ring focus:border-blue-300 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed" />
                        </div>
                        <div class="flex items-center gap-3">
                            <label class="block text-gray-700 font-medium mb-0.5 w-2/3" :class="{ 'opacity-50': isLayoutFormDisabled }">Hal. Berikutnya</label>
                            <input type="number" min="3" v-model.number="sopConfig.nextPageSteps"
                                :disabled="isLayoutFormDisabled" :class="{ 'opacity-50': isLayoutFormDisabled }"
                                class="w-1/3 border rounded-lg px-3 py-2 focus:outline-none focus:ring focus:border-blue-300 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed" />
                        </div>
                        <hr class="my-2" />
                        <div class="font-bold mb-2" :class="{ 'opacity-50': isLayoutFormDisabled }">Lebar Kolom (%)</div>
                        <div class="flex items-center gap-3">
                            <label class="block text-gray-700 font-medium mb-0.5 w-2/3" :class="{ 'opacity-50': isLayoutFormDisabled }">Kegiatan</label>
                            <input type="number" min="11" max="100" v-model.number="sopConfig.widthKegiatan"
                                :disabled="isLayoutFormDisabled" :class="{ 'opacity-50': isLayoutFormDisabled }"
                                class="w-1/3 border rounded-lg px-3 py-2 focus:outline-none focus:ring focus:border-blue-300 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed" />
                        </div>
                        <div class="flex items-center gap-3">
                            <label class="block text-gray-700 font-medium mb-0.5 w-2/3" :class="{ 'opacity-50': isLayoutFormDisabled }">Kelengkapan</label>
                            <input type="number" min="16" max="100" v-model.number="sopConfig.widthKelengkapan"
                                :disabled="isLayoutFormDisabled" :class="{ 'opacity-50': isLayoutFormDisabled }"
                                class="w-1/3 border rounded-lg px-3 py-2 focus:outline-none focus:ring focus:border-blue-300 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed" />
                        </div>
                        <div class="flex items-center gap-3">
                            <label class="block text-gray-700 font-medium mb-0.5 w-2/3" :class="{ 'opacity-50': isLayoutFormDisabled }">Waktu</label>
                            <input type="number" min="9" max="100" v-model.number="sopConfig.widthWaktu"
                                :disabled="isLayoutFormDisabled" :class="{ 'opacity-50': isLayoutFormDisabled }"
                                class="w-1/3 border rounded-lg px-3 py-2 focus:outline-none focus:ring focus:border-blue-300 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed" />
                        </div>
                        <div class="flex items-center gap-3">
                            <label class="block text-gray-700 font-medium mb-0.5 w-2/3" :class="{ 'opacity-50': isLayoutFormDisabled }">Output</label>
                            <input type="number" min="9" max="100" v-model.number="sopConfig.widthOutput"
                                :disabled="isLayoutFormDisabled" :class="{ 'opacity-50': isLayoutFormDisabled }"
                                class="w-1/3 border rounded-lg px-3 py-2 focus:outline-none focus:ring focus:border-blue-300 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed" />
                        </div>
                        <div class="flex items-center gap-3">
                            <label class="block text-gray-700 font-medium mb-0.5 w-2/3" :class="{ 'opacity-50': isLayoutFormDisabled }">Keterangan</label>
                            <input type="number" min="5" max="100" v-model.number="sopConfig.widthKeterangan"
                                :disabled="isLayoutFormDisabled" :class="{ 'opacity-50': isLayoutFormDisabled }"
                                class="w-1/3 border rounded-lg px-3 py-2 focus:outline-none focus:ring focus:border-blue-300 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed" />
                        </div>
                        <div class="text-xs text-gray-500 mb-2">
                            <span class="font-semibold">Catatan:</span> Lebar kolom <span class="font-semibold">Pelaksana</span> akan dibagi rata berdasarkan jumlah pelaksana yang dipilih. Setiap kolom memiliki lebar: 70 dibagi jumlah pelaksana (%).
                        </div>
                    </div>
                    <div class="flex justify-end p-3 border-t">
                        <button type="button" @click="fetchSopDisplayConfig"
                            :disabled="isLayoutFormDisabled"
                            class="bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg px-5 py-2 font-semibold shadow focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition-all duration-300 text-sm mr-2 disabled:opacity-50 disabled:cursor-not-allowed">
                            Reset
                        </button>
                        <button type="submit" :disabled="isLayoutFormDisabled"
                            class="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-5 py-2 font-semibold shadow focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 transition-all duration-300 text-sm disabled:opacity-50 disabled:cursor-not-allowed">
                            Simpan
                        </button>
                    </div>
                </form>
            </div>
            <button @click="showConfigPanel = !showConfigPanel" :title="showConfigPanel ? 'Tutup Pengaturan Layout' : 'Pengaturan Layout'" v-if="activeTab === 'document'"
                class="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-3 shadow-lg flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 transition-all duration-300"
                :class="{ 'rotate-45 bg-red-600 hover:bg-red-700': showConfigPanel }">
                    <GearIcon class="w-6 h-6 fill-current" :class="{ 'rotate-45': showConfigPanel }" />
            </button>
        </div>

        <!-- Modal konfirmasi hapus konfigurasi panah -->
        <DeleteDataModal
            v-model:showModal="showDeleteModal"
            :deleteData="confirmDeleteArrowConfigs"
            :text="`Anda yakin ingin menghapus semua konfigurasi manual panah untuk ${activeTab === 'document' ? 'Flowchart' : 'BPMN'}? Panah akan kembali menggunakan algoritma otomatis.`"
        />
    </div>
</template>
