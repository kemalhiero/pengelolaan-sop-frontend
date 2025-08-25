<script setup>
import { computed, inject, onBeforeUnmount, ref, watch, nextTick, defineEmits } from 'vue';
import { toast } from 'vue3-toastify';

import { saveFlowchartConfig, saveBpmnConfig, clearFlowchartConfig, clearBpmnConfig, saveSopLayout } from '@/api/sopApi';
import roleAbbreviation from '@/data/roleAbbrv.json';
import useToastPromise from '@/utils/toastPromiseHandler';
import GearIcon from '@/assets/icons/GearIcon.vue';
import SopInfoTemplate from '@/components/sop/SopInfoTemplate.vue';
import SopStepTemplate from '@/components/sop/SopStepTemplate.vue';
import SopBpmnTemplate from '@/components/sop/SopBpmnTemplate.vue';
import DeleteDataModal from '@/components/modal/DeleteDataModal.vue';

const emit = defineEmits(['update:is-editing']);
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
const { flowchartLabelConfig, bpmnLabelConfig } = inject('labelConfigs');

// BARU: State untuk mode edit panah
const arrowEditMode = ref(false);
const isEditing = ref(false);

watch(isEditing, (newValue) => {
    emit('update:is-editing', newValue);
});

// State untuk menampung update konfigurasi panah dari komponen anak
const flowchartArrowConfigUpdates = ref({});
const bpmnArrowConfigUpdates = ref({});

// BARU: State untuk label configurations
const flowchartLabelConfigUpdates = ref({
  custom_labels: {},
  positions: {}
});
const bpmnLabelConfigUpdates = ref({
  custom_labels: {},
  positions: {}
});

// BARU: Refs untuk komponen template
const sopStepTemplateRef = ref(null);
const sopBpmnTemplateRef = ref(null);

const handleLabelEdit = (config) => {
    if (activeTab.value === 'document') {
        // Track perubahan untuk save - tidak perlu update sopStepRaw langsung
        const targetStep = sopStep.value?.find(step => {
            if (step.type === 'decision') {
                const yesConnId = `conn-${step.seq_number}-to-${step.id_next_step_if_yes ? sopStep.value.find(s => s.id_step === step.id_next_step_if_yes)?.seq_number : 'unknown'}-yes`;
                const noConnId = `conn-${step.seq_number}-to-${step.id_next_step_if_no ? sopStep.value.find(s => s.id_step === step.id_next_step_if_no)?.seq_number : 'unknown'}-no`;
                return yesConnId === config.connectionId || noConnId === config.connectionId;
            }
            return false;
        });
        
        if (targetStep) {
            const condition = config.connectionId.includes('-yes') ? 'yes' : 'no';
            const stepKey = `step-${targetStep.seq_number}-${condition}`;
            
            if (config.newLabel) {
                flowchartLabelConfigUpdates.value.custom_labels = {
                    ...flowchartLabelConfigUpdates.value.custom_labels,
                    [stepKey]: config.newLabel
                };
            } else {
                if (flowchartLabelConfigUpdates.value.custom_labels) {
                    delete flowchartLabelConfigUpdates.value.custom_labels[stepKey];
                }
            }
        }
    } else if (activeTab.value === 'bpmn') {
        // Logic serupa untuk BPMN - terpisah dari flowchart
        const targetStep = sopStep.value?.find(step => {
            if (step.type === 'decision') {
                const yesConnId = `conn-${step.seq_number}-to-${step.id_next_step_if_yes ? sopStep.value.find(s => s.id_step === step.id_next_step_if_yes)?.seq_number : 'unknown'}-yes`;
                const noConnId = `conn-${step.seq_number}-to-${step.id_next_step_if_no ? sopStep.value.find(s => s.id_step === step.id_next_step_if_no)?.seq_number : 'unknown'}-no`;
                return yesConnId === config.connectionId || noConnId === config.connectionId;
            }
            return false;
        });
        
        if (targetStep) {
            const condition = config.connectionId.includes('-yes') ? 'yes' : 'no';
            const stepKey = `step-${targetStep.seq_number}-${condition}`;
            
            if (config.newLabel) {
                bpmnLabelConfigUpdates.value.custom_labels = {
                    ...bpmnLabelConfigUpdates.value.custom_labels,
                    [stepKey]: config.newLabel
                };
            } else {
                if (bpmnLabelConfigUpdates.value.custom_labels) {
                    delete bpmnLabelConfigUpdates.value.custom_labels[stepKey];
                }
            }
        }
    }
};

// BARU: Handler untuk edit manual panah
const handleFlowchartManualEdit = (config) => {
    if (config.reset) {
        delete flowchartArrowConfigUpdates.value[config.connectionId];
        if (flowchartLabelConfigUpdates.value.positions) {
            delete flowchartLabelConfigUpdates.value.positions[config.connectionId];
        }
    } else if (config.type === 'label-position') {
        // Update posisi label saja
        flowchartLabelConfigUpdates.value.positions = {
            ...flowchartLabelConfigUpdates.value.positions,
            [config.connectionId]: config.labelPosition
        };
    } else if (config.type === 'arrow') {
        // Update konfigurasi panah
        flowchartArrowConfigUpdates.value = {
            ...flowchartArrowConfigUpdates.value,
            [config.connectionId]: {
                startPoint: config.startPoint,
                endPoint: config.endPoint,
                bendPoints: config.bendPoints,
                sSide: config.sSide,
                eSide: config.eSide
            }
        };
    }
};

const handleBpmnManualEdit = (config) => {
    if (config.reset) {
        delete bpmnArrowConfigUpdates.value[config.connectionId];
        if (bpmnLabelConfigUpdates.value.positions) {
            delete bpmnLabelConfigUpdates.value.positions[config.connectionId];
        }
    } else if (config.type === 'decision-text') {
        // Handle decision text positioning dengan key yang tepat
        if (config.textPosition) {
            bpmnLabelConfigUpdates.value.positions = {
                ...bpmnLabelConfigUpdates.value.positions,
                [config.stepId]: config.textPosition
            };
        }
    } else if (config.type === 'label-position') {
        // Update posisi label saja
        bpmnLabelConfigUpdates.value.positions = {
            ...bpmnLabelConfigUpdates.value.positions,
            [config.connectionId]: config.labelPosition
        };
    } else if (config.type === 'arrow') {
        // Update konfigurasi panah
        bpmnArrowConfigUpdates.value = {
            ...bpmnArrowConfigUpdates.value,
            [config.connectionId]: {
                startPoint: config.startPoint,
                endPoint: config.endPoint,
                bendPoints: config.bendPoints,
                sSide: config.sSide,
                eSide: config.eSide
            }
        };
    }
};

const toggleArrowEditMode = async () => {
    if (arrowEditMode.value) {
        // Saat selesai edit, simpan otomatis
        if (hasUnsavedArrowChanges.value) {
            try {
                await saveCurrentTabConfig();
                toast.success('Perubahan berhasil disimpan!', { autoClose: 3000 });
            } catch (err) {
                toast.error('Gagal menyimpan perubahan!', { autoClose: 3000 });
                return; // Jangan keluar dari mode edit jika gagal simpan
            }
        }
        arrowEditMode.value = false;
        isEditing.value = false;
    } else {
        arrowEditMode.value = true;
        isEditing.value = true;
    }
};

const saveCurrentTabConfig = async () => {
    const payload = {};
    const flowchartLabelUpdates = flowchartLabelConfigUpdates.value || {};
    const bpmnLabelUpdates = bpmnLabelConfigUpdates.value || {};

    if (activeTab.value === 'document') {
        // PERBAIKAN: Ambil semua konfigurasi dari child, bukan hanya update
        const allFlowchartArrowConfigs = sopStepTemplateRef.value?.getArrowConfigs() || {};
        console.log('[ThirdStep] Saving flowchart arrows:', allFlowchartArrowConfigs);
        payload.flowchart_arrow_config = JSON.stringify(allFlowchartArrowConfigs);

        // Selalu simpan konfigurasi label yang sudah digabung
        const currentFlowchartLabelConfig = flowchartLabelConfig.value || {};
        const mergedFlowchartLabelConfig = {
            custom_labels: {
                ...(currentFlowchartLabelConfig.custom_labels || {}),
                ...flowchartLabelUpdates.custom_labels
            },
            positions: {
                ...(currentFlowchartLabelConfig.positions || {}),
                ...flowchartLabelUpdates.positions
            }
        };
        payload.flowchart_label_config = JSON.stringify(mergedFlowchartLabelConfig);

        await saveFlowchartConfig(idsopdetail, payload);
    } else if (activeTab.value === 'bpmn') {
        // PERBAIKAN: Ambil semua konfigurasi dari child, bukan hanya update
        const allBpmnArrowConfigs = sopBpmnTemplateRef.value?.getArrowConfigs() || {};
        console.log('[ThirdStep] Saving BPMN arrows:', allBpmnArrowConfigs);
        payload.bpmn_arrow_config = JSON.stringify(allBpmnArrowConfigs);

        // Selalu simpan konfigurasi label yang sudah digabung
        const currentBpmnLabelConfig = bpmnLabelConfig.value || {};
        const mergedBpmnLabelConfig = {
            custom_labels: {
                ...(currentBpmnLabelConfig.custom_labels || {}),
                ...bpmnLabelUpdates.custom_labels
            },
            positions: {
                ...(currentBpmnLabelConfig.positions || {}),
                ...bpmnLabelUpdates.positions
            }
        };
        payload.bpmn_label_config = JSON.stringify(mergedBpmnLabelConfig);

        console.log('[ThirdStep] BPMN payload being saved:', payload);
        await saveBpmnConfig(idsopdetail, payload);
    }

    // Reset updates setelah simpan
    if (activeTab.value === 'document') {
        flowchartArrowConfigUpdates.value = {};
        flowchartLabelConfigUpdates.value = { custom_labels: {}, positions: {} };
    } else {
        bpmnArrowConfigUpdates.value = {};
        bpmnLabelConfigUpdates.value = { custom_labels: {}, positions: {} };
    }
    
    // PERBAIKAN: Refresh data dan tunggu sampai selesai
    await fetchSopDisplayConfig();
    await nextTick();
    
    // PERBAIKAN: Force refresh yang lebih gentle tanpa reset besar-besaran
    if (sopStepTemplateRef.value) {
        setTimeout(() => {
            sopStepTemplateRef.value.forceRecalculation();
        }, 100);
    }
    if (sopBpmnTemplateRef.value) {
        setTimeout(() => {
            sopBpmnTemplateRef.value.forceRecalculation();
        }, 100);
    }
};

const hasLabelChanges = computed(() => {
    const flowchartLabelUpdates = flowchartLabelConfigUpdates.value || {};
    const bpmnLabelUpdates = bpmnLabelConfigUpdates.value || {};
    
    const flowchartHasChanges = Object.keys(flowchartLabelUpdates.custom_labels || {}).length > 0 || 
                               Object.keys(flowchartLabelUpdates.positions || {}).length > 0;
    const bpmnHasChanges = Object.keys(bpmnLabelUpdates.custom_labels || {}).length > 0 || 
                          Object.keys(bpmnLabelUpdates.positions || {}).length > 0;
    
    return flowchartHasChanges || bpmnHasChanges;
});

// BARU: Reset panah ke konfigurasi terakhir (database atau algoritma)
const resetArrowsToLastSaved = () => {
    if (!hasUnsavedArrowChanges.value) {
        toast.info('Tidak ada perubahan yang perlu direset', { autoClose: 3000 });
        return;
    }
    
    console.log(`[ThirdStep] Resetting ${activeTab.value} to last saved state`);
    
    if (activeTab.value === 'document') {
        flowchartArrowConfigUpdates.value = {};
        flowchartLabelConfigUpdates.value = { custom_labels: {}, positions: {} };
        
        if (sopStepTemplateRef.value) {
            sopStepTemplateRef.value.resetArrowsToLastSaved();
        }
        
    } else if (activeTab.value === 'bpmn') {
        bpmnArrowConfigUpdates.value = {};
        bpmnLabelConfigUpdates.value = { custom_labels: {}, positions: {} };
        
        if (sopBpmnTemplateRef.value) {
            // PERBAIKAN: Panggil reset dengan urutan yang benar
            sopBpmnTemplateRef.value.resetDecisionTextPositions();
            sopBpmnTemplateRef.value.resetArrowsToLastSaved();
        }
    }
    
    console.log(`[ThirdStep] Reset completed for ${activeTab.value}`);
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

const finalFlowchartArrowConfig = computed(() => {
    const merged = { ...flowchartArrowConfig.value, ...flowchartArrowConfigUpdates.value };
    console.log('finalFlowchartArrowConfig - Database config:', flowchartArrowConfig.value);
    console.log('finalFlowchartArrowConfig - Updates config:', flowchartArrowConfigUpdates.value);
    return merged;
});

const finalBpmnArrowConfig = computed(() => {
    const merged = { ...bpmnArrowConfig.value, ...bpmnArrowConfigUpdates.value };
    console.log('finalBpmnArrowConfig - Database config:', bpmnArrowConfig.value);
    console.log('finalBpmnArrowConfig - Updates config:', bpmnArrowConfigUpdates.value);
    return merged;
});

const executeConfigSave = async () => {
    const promise = new Promise(async (resolve, reject) => {
        try {
            const payload = {
                nominal_basic_page_steps: sopConfig.value.firstPageSteps,
                nominal_steps_both_opc: sopConfig.value.nextPageSteps,
                kegiatan_width: sopConfig.value.widthKegiatan,
                kelengkapan_width: sopConfig.value.widthKelengkapan,
                waktu_width: sopConfig.value.widthWaktu,
                output_width: sopConfig.value.widthOutput,
                ket_width: sopConfig.value.widthKeterangan
            };
            
            // PERBAIKAN: Gunakan API layout untuk konfigurasi layout saja
            await saveSopLayout(idsopdetail, payload);
            
            showConfigPanel.value = false;
            arrowEditMode.value = false;
            isEditing.value = false;
            
            await fetchSopDisplayConfig();
            
            if (sopStepTemplateRef.value) {
                sopStepTemplateRef.value.forceRecalculation();
            }
            if (sopBpmnTemplateRef.value) {
                sopBpmnTemplateRef.value.forceRecalculation();
            }
            
            resolve();
        } catch (err) {
            console.error('Error saving POS layout config:', err);
            reject(err);
        }
    });

    useToastPromise(promise, {
        messages: { success: 'Konfigurasi layout berhasil disimpan!' },
        toastOptions: { autoClose: 3000 }
    });
};

const finalFlowchartLabelConfig = computed(() => {
    const current = flowchartLabelConfig.value || { custom_labels: {}, positions: {} };
    const updates = flowchartLabelConfigUpdates.value || { custom_labels: {}, positions: {} };
    return {
        custom_labels: { ...(current.custom_labels || {}), ...(updates.custom_labels || {}) },
        positions: { ...(current.positions || {}), ...(updates.positions || {}) }
    };
});

const finalBpmnLabelConfig = computed(() => {
    const current = bpmnLabelConfig.value || { custom_labels: {}, positions: {} };
    const updates = bpmnLabelConfigUpdates.value || { custom_labels: {}, positions: {} };
    return {
        custom_labels: { ...(current.custom_labels || {}), ...(updates.custom_labels || {}) },
        positions: { ...(current.positions || {}), ...(updates.positions || {}) }
    };
});

// BARU: Hapus konfigurasi manual panah
const clearArrowConfigs = async () => {
    try {
        const promise = new Promise(async (resolve, reject) => {
            try {
                if (activeTab.value === 'document') {
                    await clearFlowchartConfig(idsopdetail);
                    flowchartArrowConfigUpdates.value = {};
                    flowchartLabelConfigUpdates.value = { custom_labels: {}, positions: {} };
                } else if (activeTab.value === 'bpmn') {
                    await clearBpmnConfig(idsopdetail);
                    bpmnArrowConfigUpdates.value = {};
                    bpmnLabelConfigUpdates.value = { custom_labels: {}, positions: {} };
                }
                
                console.log(`Konfigurasi ${activeTab.value} berhasil dihapus dari database.`);
                
                // Refresh konfigurasi dari database
                await fetchSopDisplayConfig();
                
                // Force refresh template components
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
            messages: { success: `Konfigurasi ${activeTab.value === 'document' ? 'Flowchart' : 'BPMN'} berhasil dihapus!` },
            toastOptions: { autoClose: 3000 }
        });
    } catch (err) {
        toast.error('Gagal menghapus konfigurasi!', { autoClose: 3000 });
    }
};

const handleTabChange = async (newTab) => {
    if (isEditing.value) {
        toast.warning('Selesaikan edit terlebih dahulu!', { autoClose: 3000 });
        return;
    }
    activeTab.value = newTab;
};

// BARU: Computed untuk mengecek apakah form layout harus disabled
const isLayoutFormDisabled = computed(() => {
    return hasAnyArrowConfig.value || isDisabled.value;
});

// BARU: State untuk modal konfirmasi hapus
const showDeleteModal = ref(false);

// BARU: Computed untuk mengecek apakah ada konfigurasi tersimpan
const hasArrowConfig = computed(() => {
    if (activeTab.value === 'document') {
        const hasArrow = flowchartArrowConfig.value && Object.keys(flowchartArrowConfig.value).length > 0;
        const hasLabel = flowchartLabelConfig.value && (Object.keys(flowchartLabelConfig.value.custom_labels || {}).length > 0 || Object.keys(flowchartLabelConfig.value.positions || {}).length > 0);
        return hasArrow || hasLabel;
    } else if (activeTab.value === 'bpmn') {
        const hasArrow = bpmnArrowConfig.value && Object.keys(bpmnArrowConfig.value).length > 0;
        const hasLabel = bpmnLabelConfig.value && (Object.keys(bpmnLabelConfig.value.custom_labels || {}).length > 0 || Object.keys(bpmnLabelConfig.value.positions || {}).length > 0);
        return hasArrow || hasLabel;
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

// BARU: Computed untuk mengecek apakah ada perubahan yang belum disimpan
const hasUnsavedArrowChanges = computed(() => {
    if (activeTab.value === 'document') {
        const updates = flowchartArrowConfigUpdates.value || {};
        const hasUpdates = Object.keys(updates).length > 0;
        return hasUpdates || hasLabelChanges.value;
    } else if (activeTab.value === 'bpmn') {
        const updates = bpmnArrowConfigUpdates.value || {};
        const hasUpdates = Object.keys(updates).length > 0;
        return hasUpdates || hasLabelChanges.value;
    }
    
    return false;
});
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
                <button @click="handleTabChange('document')" type="button" 
                    :disabled="isEditing && activeTab !== 'document'"
                    class="px-4 py-2 text-sm font-medium bg-white border-2 rounded-l-lg hover:bg-gray-200 focus:z-10 focus:ring-2 focus:ring-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    :class="activeTab === 'document' ? 'text-blue-700 border-blue-700' : 'text-gray-900 border-gray-200 hover:text-blue-700'">
                    Flowchart
                    <span v-if="isEditing && activeTab === 'document'" class="ml-1 text-orange-600">●</span>
                </button>
                <button @click="handleTabChange('bpmn')" type="button" 
                    :disabled="isEditing && activeTab !== 'bpmn'"
                    class="px-4 py-2 text-sm font-medium bg-white border-2 rounded-r-lg hover:bg-gray-200 focus:z-10 focus:ring-2 focus:ring-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    :class="activeTab === 'bpmn' ? 'text-blue-700 border-blue-700' : 'text-gray-900 border-gray-200 hover:text-blue-700'">
                    BPMN
                    <span v-if="isEditing && activeTab === 'bpmn'" class="ml-1 text-orange-600">●</span>
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
                    {{ arrowEditMode ? (hasUnsavedArrowChanges ? 'Selesai & Simpan' : 'Selesai') : 'Edit Panah & Label' }}
                    <span v-if="hasUnsavedArrowChanges && arrowEditMode" class="w-2 h-2 bg-red-500 rounded-full"></span>
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
                    <p class="font-semibold mb-2">Mode Edit Panah & Label Aktif</p>
                    <p class="text-xs mb-2 font-medium text-red-700">⚠️ Tab lain dinonaktifkan saat editing. Klik "Selesai & Simpan" untuk mengakhiri.</p>
                    <ul class="space-y-1 text-xs">
                        <li>• <span class="font-medium">Hijau:</span> Titik awal panah (dapat digeser)</li>
                        <li>• <span class="font-medium">Merah:</span> Titik akhir panah (dapat digeser)</li>
                        <li>• <span class="font-medium">Biru:</span> Titik belok (dapat digeser dan dihapus)</li>
                        <li>• <span class="font-medium">Double-click pada panah:</span> Tambah titik belok baru</li>
                        <li>• <span class="font-medium">Double-click pada label:</span> Edit teks label (maks. 20 karakter)</li>
                        <li>• <span class="font-medium">Drag label:</span> Pindah posisi label</li>
                        <li v-if="activeTab === 'bpmn'">• <span class="font-medium">Drag teks decision:</span> Pindah posisi teks (BPMN)</li>
                        <li>
                            • <span class="font-medium">Reset ke Kondisi Terakhir:</span> 
                            <span v-if="hasUnsavedArrowChanges" class="text-green-700">
                                Kembalikan ke konfigurasi terakhir sebelum perubahan
                            </span>
                            <span v-else class="text-orange-600">
                                Belum ada perubahan terbaru pada {{ activeTab === 'document' ? 'Flowchart' : 'BPMN' }}
                            </span>
                        </li>
                        <li>
                            • <span class="font-medium">Hapus Konfigurasi Manual:</span>
                            <span v-if="hasArrowConfig" class="text-green-700">
                                Hapus semua konfigurasi manual dan gunakan panah otomatis
                            </span>
                            <span v-else class="text-orange-600">
                                Belum ada konfigurasi manual tersimpan untuk {{ activeTab === 'document' ? 'Flowchart' : 'BPMN' }}
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
            :arrow-config="finalFlowchartArrowConfig"
            :label-config="finalFlowchartLabelConfig"
            :layout-config="sopConfig"
            :edit-mode="arrowEditMode"
            @manual-edit="handleFlowchartManualEdit"
            @label-edit="handleLabelEdit"
        />

        <SopBpmnTemplate
            v-else-if="activeTab === 'bpmn'"
            ref="sopBpmnTemplateRef"
            :name="assignmentInfo.name"
            :steps="sopStep"
            :implementer="formData.implementer"
            :arrow-config="finalBpmnArrowConfig"
            :label-config="finalBpmnLabelConfig"
            :edit-mode="arrowEditMode"
            @manual-edit="handleBpmnManualEdit"
            @label-edit="handleLabelEdit"
        />

        <div class="fixed bottom-6 right-6 z-50 print:hidden">
            <div v-if="showConfigPanel && activeTab === 'document'"
                class="absolute bottom-full right-0 mb-3 w-80 bg-white rounded-lg shadow-xl border border-gray-200 transition-all duration-300 transform origin-bottom-right text-sm">
                <div class="flex justify-between items-center bg-blue-50 p-3 rounded-t-lg border-b border-gray-200">
                    <span class="font-medium">Pengaturan Layout POS</span>
                    <button @click="showConfigPanel = false" class="text-gray-500 hover:text-gray-700 focus:outline-none">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <form @submit.prevent="saveSopConfig">
                    <div class="p-4 space-y-3 overflow-y-auto" :style="{ maxHeight: 'calc(100vh - 220px)' }">
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
                        <button type="button" @click="fetchSopDisplayConfig" :disabled="isLayoutFormDisabled"
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
            <button @click="showConfigPanel = !showConfigPanel" :title="showConfigPanel ? 'Tutup Pengaturan Layout' : 'Pengaturan Layout'" v-if="activeTab === 'document' && !isDisabled"
                class="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-3 shadow-lg flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 transition-all duration-300"
                :class="{ 'rotate-45 bg-red-600 hover:bg-red-700': showConfigPanel }">
                    <GearIcon class="w-6 h-6 fill-current" :class="{ 'rotate-45': showConfigPanel }" />
            </button>
        </div>

        <!-- Modal konfirmasi hapus konfigurasi panah -->
        <DeleteDataModal
            v-model:showModal="showDeleteModal"
            :deleteData="confirmDeleteArrowConfigs"
            :text="`Anda yakin ingin menghapus semua konfigurasi manual untuk ${activeTab === 'document' ? 'Flowchart' : 'BPMN'}? Panah/Label akan kembali menggunakan algoritma otomatis.`"
        />
    </div>
</template>
