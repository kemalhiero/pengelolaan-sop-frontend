<script setup>
import { computed, inject, onBeforeUnmount, ref, watch } from 'vue';
import { toast } from 'vue3-toastify';

import { saveSopDisplayConfig } from '@/api/sopApi';
import roleAbbreviation from '@/data/roleAbbrv.json';
import useToastPromise from '@/utils/toastPromiseHandler';
import GearIcon from '@/assets/icons/GearIcon.vue';
import SopInfoTemplate from '@/components/sop/SopInfoTemplate.vue';
import SopStepTemplate from '@/components/sop/SopStepTemplate.vue';
import SopBpmnTemplate from '@/components/sop/SopBpmnTemplate.vue';

const activeTab = ref('document');
const showConfigPanel = ref(false);
const sopStep = computed(() => [...sopStepRaw.value].sort((a, b) => a.seq_number - b.seq_number));

const assignmentInfo = inject('assignmentInfo');
const { formData } = inject('sopFormData');
const sopStepRaw = inject('sopStep');
const sopConfig = inject('sopConfig');
const idsopdetail = inject('idsopdetail');
const fetchSopDisplayConfig = inject('fetchSopDisplayConfig'); // fungsi untuk mengambil konfigurasi awal
const isDisabled = inject('isDisabled');

// Handler ESC
function handleEscClose(e) {
    if (e.key === 'Escape' && showConfigPanel.value) {
        showConfigPanel.value = false;
    }
}

// Pasang/lepas event listener saat panel dibuka/ditutup
watch(showConfigPanel, (val) => {
    if (val) {
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
        const promise = new Promise(async (resolve, reject) => {
            try {
                await saveSopDisplayConfig(idsopdetail, {
                    nominal_basic_page_steps: sopConfig.value.firstPageSteps,
                    nominal_steps_both_opc: sopConfig.value.nextPageSteps,
                    kegiatan_width: sopConfig.value.widthKegiatan,
                    kelengkapan_width: sopConfig.value.widthKelengkapan,
                    waktu_width: sopConfig.value.widthWaktu,
                    output_width: sopConfig.value.widthOutput,
                    ket_width: sopConfig.value.widthKeterangan
                });
                showConfigPanel.value = false;
                resolve();
            } catch (err) {
                reject(err);
            }
        });

        useToastPromise(promise, {
            messages: { success: 'Konfigurasi berhasil disimpan!' },
            toastOptions: { autoClose: 3000 }
        });
    } catch (err) {
        toast.error('Gagal menyimpan konfigurasi!', { autoClose: 3000 });
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

        <SopStepTemplate v-if="activeTab === 'document'" :implementer="formData.implementer" :steps="sopStep" />

        <SopBpmnTemplate v-else-if="activeTab === 'bpmn'"
            :name="assignmentInfo.name" :steps="sopStep" 
            :implementer="formData.implementer" 
        />

        <!-- Floating sop display config panel -->
        <div class="fixed bottom-6 right-6 z-50 print:hidden" v-show="activeTab === 'document'">
            <div v-if="showConfigPanel"
                class="absolute bottom-full right-0 mb-3 w-80 bg-white rounded-lg shadow-xl border border-gray-200 transition-all duration-300 transform origin-bottom-left text-sm">
                <div class="flex justify-between items-center bg-blue-50 p-3 rounded-t-lg border-b border-gray-200">
                    <span class="font-medium">Konfigurasi Tampilan SOP</span>
                    <button @click="showConfigPanel = false" class="text-gray-500 hover:text-gray-700 focus:outline-none">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <form @submit.prevent="saveSopConfig">
                    <div class="p-4 space-y-3">
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
            <!-- Floating config button -->
            <button @click="showConfigPanel = !showConfigPanel"
                :title="showConfigPanel ? 'Tutup Panel Konfigurasi' : 'Atur Tampilan SOP'"
                class="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-3 shadow-lg flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 transition-all duration-300"
                :class="{ 'rotate-45 bg-red-600 hover:bg-red-700': showConfigPanel }">
                    <GearIcon class="w-6 h-6 fill-current" :class="{ 'rotate-45': showConfigPanel }" />
            </button>
        </div>
    </div>
</template>
