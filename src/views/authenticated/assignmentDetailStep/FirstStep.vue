<script setup>
import { onMounted, ref, inject } from 'vue';
import { getImplementer } from '@/api/implementerApi';

import CircleInfoIcon from '@/assets/icons/CircleInfoIcon.vue';
import TrashCanIcon from '@/assets/icons/TrashCanIcon.vue';
import XMarkCloseIcon from '@/assets/icons/XMarkCloseIcon.vue';
import DataTable from '@/components/DataTable.vue';
import Tooltip from '@/components/Tooltip.vue';
import WarningText from '@/components/validation/WarningText.vue';
import PulseLoading from '@/components/PulseLoading.vue';
import Divider from '@/components/Divider.vue';

const legalBasisData = inject('legalBasisData');
const picInfo = inject('picData');

const showModal = ref({
    legalBasis: false,
    executor: false
});

// Definisikan emit untuk validasi
const emit = defineEmits(['validate-step']);

// Inject form data dari komponen induk
const { formData, updateFormData } = inject('sopFormData');

const showWarningText = ref({
    section: false,
    implementer: false,
    legalBasis: false,
    implementQualification: false,
    // relatedSop: false,
    // equipment: false,
    // warning: false,
    // record: false
});

// Fungsi validasi untuk setiap field
const validateFields = () => {

    // Reset semua warning text
    Object.keys(showWarningText.value).forEach(key => {
        showWarningText.value[key] = false;
    });

    // Validasi dengan satu fungsi
    const validations = {
        section: () => !formData.value.section,
        implementer: () => formData.value.implementer.length === 0,
        legalBasis: () => formData.value.legalBasis.length === 0,
        implementQualification: () => formData.value.implementQualification.length === 0,
        // warning: () => !formData.value.warning,
        // record: () => formData.value.record.length === 0
    };

    Object.entries(validations).forEach(([key, validation]) => {
        if (validation()) {
            showWarningText.value[key] = true;
        }
    });

    // Cek apakah semua validasi lolos
    const isValid = Object.values(showWarningText.value).every(value => !value);

    // Emit event validasi
    emit('validate-step', {
        isValid: isValid,
        showWarningText: showWarningText.value,
        data: formData.value
    });

    return isValid;
};

// Expose metode validasi ke komponen induk
defineExpose({
    validateFields
});

const createArrayHandler = (fieldName) => ({
    newItem: ref(''),
    addItem() {
        if (this.newItem.value && !formData.value[fieldName].includes(this.newItem.value)) {
            updateFormData({ 
                [fieldName]: [...formData.value[fieldName], this.newItem.value] 
            });
            this.newItem.value = '';
        }
    },
    removeItem(index) {
        updateFormData({ 
            [fieldName]: formData.value[fieldName].filter((_, i) => i !== index) 
        });
    }
});

// pelaksana
const dataImplementer = ref([]);
const fetchImplementer = async () => {
    try {
        const result = await getImplementer();
        dataImplementer.value = result.data;
    } catch (error) {
        console.error('Fetch error:', error);
    }
};

const implementer = createArrayHandler('implementer');
const legalBasis = createArrayHandler('legalBasis');
const implementQualification = createArrayHandler('implementQualification');
const relatedSop = createArrayHandler('relatedSop');
const equipment = createArrayHandler('equipment');
const record = createArrayHandler('record');

// -----------------------
onMounted(() => {
    fetchImplementer();
});

</script>

<template>
    <div class="max-w-2xl mx-auto">
        <div class="my-4 inline-flex items-center">
            <CircleInfoIcon class="w-5 mr-2" />
            Informasi dari Penanggung Jawab, tidak bisa diubah!
        </div>

        <template v-if="picInfo">
            <div class="mb-4">
                <label for="sop-name" class="block mb-2 text-sm font-medium ">
                    Nama
                </label>
                <input type="text" id="sop-name"
                    class="bg-gray-50 border border-gray-300 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 "
                    :value="picInfo.name" readonly />
            </div>
    
            <div class="grid gap-4 sm:grid-cols-2 sm:gap-5 text-black mb-4">
                <div>
                    <label for="sop-number" class="block mb-2 text-sm font-medium ">
                        Nomor
                    </label>
                    <input type="text" id="sop-number"
                        class="bg-gray-50 border border-gray-300 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 "
                        :value="picInfo.number" readonly />
                </div>
                <div>
                    <label for="sop-assignment-time" class="block mb-2 text-sm font-medium ">
                        Waktu Penugasan
                    </label>
                    <input type="datetime" id="sop-assignment-time"
                        class="bg-gray-50 border border-gray-300 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                        :value="picInfo.creation_date" readonly />
                </div>
                <div>
                    <label for="sop-org" class="block mb-2 text-sm font-medium ">
                        Organisasi
                    </label>
                    <input type="text" id="sop-org"
                        class="bg-gray-50 border border-gray-300 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                        :value="picInfo.organization" readonly />
                </div>
                <div>
                    <label for="sop-last-update-date" class="block mb-2 text-sm font-medium ">
                        Terakhir diperbarui
                    </label>
                    <input type="datetime" id="sop-last-update-date"
                        class="bg-gray-50 border border-gray-300 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                        :value="picInfo.last_update_date ? picInfo.last_update_date : '-'" readonly />
                </div>
            </div>
    
            <div class="mb-5">
                <label for="sop-description" class="block mb-2 text-sm font-medium ">
                    Deskripsi
                </label>
                <textarea id="sop-description" disabled
                    class="bg-gray-50 border border-gray-300 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 h-48">{{ picInfo.description }}</textarea>
            </div>
    
            <div class="text-black flex flex-row">
                <div class="w-1/2">
                    <h2 class="mb-2 text-sm font-semibold">User yang ditugaskan:</h2>
                    <ul class="space-y-1 list-disc list-inside text-sm">
                        <li v-for="(item, index) in picInfo.drafter" :key="index">({{ item.id_number }}) {{ item.name }}</li>
                    </ul>
                </div>
                <div class="w-1/2">
                    <h2 class="mb-2 text-sm font-semibold">Penanggung Jawab:</h2>
                    <ul class="space-y-1 list-disc list-inside text-sm">
                        <li v-for="(item, index) in picInfo.pic" :key="index">({{ item.id_number }}) {{ item.name }}</li>
                    </ul>
                </div>
            </div>
        </template>
        <PulseLoading v-else />

        <Divider/>

        <div class="my-4 inline-flex items-center">
            <CircleInfoIcon class="w-5 mr-2" />
            Form berikut wajib diisi sebagai sebagai identitas dari SOP!
        </div>

        <div class="mb-4">
            <label for="sop-section" class="mb-2 text-sm font-medium inline-flex">
                Seksi<span class="text-red-600">*</span>
                <Tooltip field="section" text="Misal: Semua Seksi di Lingkungan Departemen Sistem Informasi" />
            </label>
            <input type="text" id="sop-section" v-model="formData.section" required
                class="bg-gray-50 border border-gray-300 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 " />
            <WarningText v-if="showWarningText.section" text="Harap isi data ini!" />
        </div>

        <div class="mb-4">
            <label class="block mb-2 text-sm font-medium">
                Pelaksana<span class="text-red-600">*</span>
            </label>

            <div v-if="formData.implementer.length > 0" class="my-4">
                <ul class="flex flex-wrap gap-2">
                    <li v-for="(item, index) in formData.implementer" :key="index"
                        class="bg-gray-200 rounded-lg p-1.5 flex items-center justify-between">
                        <span class="mr-2">{{ item.name }}</span>
                        <button :title="`Hapus item ${index + 1}`" @click="implementer.removeItem(index)" type="button"
                            class="p-1.5 text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 flex items-center justify-center">
                            <TrashCanIcon class="fill-current w-4" />
                        </button>
                    </li>
                </ul>
            </div>

            <button @click="showModal.executor = true"
                class="block w-full md:w-auto text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-3 py-2 text-center"
                type="button">
                Tambah Pelaksana
            </button>

            <WarningText v-if="showWarningText.implementer" text="Jangan lupa pilih pelaksana pada SOP!" />
        </div>

        <div class="mb-4">
            <label class="block mb-2 text-sm font-medium ">
                Dasar Hukum<span class="text-red-600">*</span>
            </label>

            <!-- Daftar Dasar Hukum yang Dipilih -->
            <div v-if="formData.legalBasis.length > 0" class="my-4">
                <ul>
                    <li v-for="(law, index) in formData.legalBasis" :key="index"
                        class="flex items-center justify-between p-2 bg-gray-200 rounded-lg mb-2">
                        <span class="text-sm">{{ law.legal }}</span>
                        <button :title="`Hapus peraturan ${index + 1}`" @click="legalBasis.removeItem(index)"
                            class="px-3 py-2 h-9 mx-2 text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 inline-flex">
                            <TrashCanIcon class="fill-current w-4" />
                        </button>
                    </li>
                </ul>
            </div>

            <button @click="showModal.legalBasis = true"
                class="block w-full md:w-auto text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-3 py-2 text-center"
                type="button">
                Tambah Dasar Hukum
            </button>

            <WarningText v-if="showWarningText.legalBasis" text="Jangan lupa pilih dasar hukum!" />
        </div>

        <div class="my-4">
            <label for="implement-qualification" class="mb-2 text-sm font-medium inline-flex">
                Kualifikasi Pelaksanaan<span class="text-red-600">*</span>
                <Tooltip field="implement-qualification" text="Misal: Memiliki kemampuan pengolahan data sederhana" />
            </label>
            <input type="text" id="implement-qualification" v-model="implementQualification.newItem.value" @keyup.enter.prevent="implementQualification.addItem"
                class="bg-gray-50 border border-gray-300 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 "
                placeholder="ketikkan, lalu tekan enter" title="Contoh: Memiliki Kemampuan pengolahan data sederhana" />
            <WarningText v-if="showWarningText.implementQualification"
                text="Jangan lupa ketikkan kualifikasi pelaksanaan!" />
            <!-- Daftar kualifikasi pelaksanaan -->
            <div v-if="formData.implementQualification.length > 0" class="my-4">
                <ul>
                    <li v-for="(iq, index) in formData.implementQualification" :key="index"
                        class="flex items-center justify-between p-2 bg-gray-200 rounded-lg mb-2">
                        <span>{{ iq }}</span>
                        <button :title="`Hapus item ${index + 1}`" @click="implementQualification.removeItem(index)"
                            class="p-2 mx-2 text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 inline-flex">
                            <TrashCanIcon class="fill-current w-4" />
                        </button>
                    </li>
                </ul>
            </div>
        </div>

        <div class="my-4">
            <label for="related-sop" class="mb-2 text-sm font-medium inline-flex">
                Keterkaitan dengan POS AP Lain
                <Tooltip field="related-sop" text="Misal: POS AP Pelaksanaan KP" />
            </label>
            <input type="text" id="related-sop" v-model="relatedSop.newItem.value" @keyup.enter.prevent="relatedSop.addItem"
                class="bg-gray-50 border border-gray-300 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 "
                placeholder="ketikkan, lalu tekan enter" />

            <!-- Daftar POS AP yang terkait -->
            <div v-if="formData.relatedSop.length > 0" class="my-4">
                <ul>
                    <li v-for="(rs, index) in formData.relatedSop" :key="index"
                        class="flex items-center justify-between p-2 bg-gray-200 rounded-lg mb-2">
                        <span>{{ rs }}</span>
                        <button :title="`Hapus item ${index + 1}`" @click="relatedSop.removeItem(index)"
                            class="p-2 mx-2 text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 inline-flex">
                            <TrashCanIcon class="fill-current w-4" />
                        </button>
                    </li>
                </ul>
            </div>
        </div>

        <div class="my-4">
            <label for="equipment-input" class="mb-2 text-sm font-medium inline-flex">
                Peralatan/Perlengkapan
                <Tooltip field="equipment" text="Misal: Komputer" />
            </label>
            <input type="text" id="equipment-input" v-model="equipment.newItem.value" @keyup.enter.prevent="equipment.addItem"
                class="bg-gray-50 border border-gray-300 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 "
                placeholder="ketikkan, lalu tekan enter" />
            <!-- Daftar peralatan/perlengkapan -->
            <div v-if="formData.equipment.length > 0" class="my-4">
                <ul class="flex flex-wrap gap-2">
                    <li v-for="(eq, index) in formData.equipment" :key="index"
                        class="bg-gray-200 rounded-lg p-1.5 flex items-center justify-between">
                        <span class="mr-2">{{ eq }}</span>
                        <button :title="`Hapus item ${index + 1}`" @click="equipment.removeItem(index)"
                            class="p-1.5 text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 flex items-center justify-center">
                            <TrashCanIcon class="fill-current w-4" />
                        </button>
                    </li>
                </ul>
            </div>
        </div>

        <div class="mb-4">
            <label for="sop-warning" class="mb-2 text-sm font-medium inline-flex">
                Peringatan
                <!-- <span class="text-red-600">*</span> -->
                <Tooltip field="warning" text="Misal: Jika POS AP ini tidak dilaksanakan, mengakibatkan terhambatnya proses 
                    kerja praktik mahasiswa." />
            </label>
            <textarea id="sop-warning" placeholder="ketikkan teks peringatan disini" v-model="formData.warning" required
                class="bg-gray-50 border border-gray-300 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 h-24"></textarea>
            <WarningText v-if="showWarningText.warning" text="Harap isi teks peringatan!" />
        </div>

        <div class="my-4">
            <label for="data-record-input" class="mb-2 text-sm font-medium inline-flex">
                Pencatatan dan Pendataan
                <!-- <span class="text-red-600">*</span> -->
                <Tooltip field="data-record" text="Misal: Dokumen" />
            </label>
            <input type="text" id="data-record-input" v-model="record.newItem.value" @keyup.enter.prevent="record.addItem"
                class="bg-gray-50 border border-gray-300 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 "
                placeholder="ketikkan, lalu tekan enter" />
            <WarningText v-if="showWarningText.record" text="Jangan lupa ketikkan media pencatatan dan pendataan!" />
            <!-- Daftar peralatan/perlengkapan -->
            <div v-if="formData.record.length > 0" class="my-4">
                <ul class="flex flex-wrap gap-2">
                    <li v-for="(rd, index) in formData.record" :key="index"
                        class="bg-gray-200 rounded-lg p-1.5 flex items-center justify-between">
                        <span class="mr-2">{{ rd }}</span>
                        <button :title="`Hapus item ${index + 1}`" @click="record.removeItem(index)"
                            class="p-1.5 text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 flex items-center justify-center">
                            <TrashCanIcon class="fill-current w-4" />
                        </button>
                    </li>
                </ul>
            </div>
        </div>

    </div>

    <!-- <button @click="console.log(form)">konsol</button> -->

    <!-- Large Modal -->
    <div v-show="showModal.legalBasis" class="fixed inset-0 z-50 flex items-center justify-center w-full h-full">
        <div class="fixed inset-0 bg-gray-800 bg-opacity-30" @click="showModal.legalBasis = false"></div>

        <div class="relative w-full max-w-4xl max-h-full">
            <div class="relative bg-white rounded-lg shadow">
                <!-- Modal header -->
                <div class="flex items-center justify-between p-4 md:p-5 border-b rounded-t">
                    <h3 class="text-xl font-medium text-gray-900 dark:text-white">
                        Centang peraturan yang akan ditambahkan ke SOP
                    </h3>
                    <!-- <Tooltip field="law-modal" text="Misal: Jika POS AP ini tidak dilaksanakan, mengakibatkan terhambatnya proses kerja praktik mahasiswa." /> -->
                    <button type="button"
                        class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center"
                        >
                        <XMarkCloseIcon class="w-3 h-3" />
                        <span class="sr-only">Tutup modal</span>
                    </button>
                </div>
                <!-- Modal body -->
                <div class="p-4 md:p-5 space-y-4">

                    <!-- <div class="flex justify-end mb-4">
                        <router-link to="#">
                            <button
                                class="text-white bg-[#2557D6] hover:bg-[#2557D6]/90 focus:ring-4 focus:ring-[#2557D6]/50 focus:outline-none font-medium rounded-lg text-sm py-2 px-3 text-center inline-flex items-center dark:focus:ring-[#2557D6]/50 me-2 mb-2 ml-auto"
                                title="">
                                <CirclePlusIcon class="w-5 mr-3 fill-current" />
                                Tambah SOP Baru
                            </button>
                        </router-link>
                    </div> -->

                    <DataTable v-if="legalBasisData"
                        :data="legalBasisData" 
                        :columns="[{ field: 'legal', label: 'Peraturan', sortable: true, searchable: true }]" 
                        :check-column="true"
                        v-model="formData.legalBasis" 
                    />
                    <PulseLoading v-else />

                </div>
                <!-- Modal footer -->
                <div
                    class="flex items-center p-4 md:p-5 space-x-3 rtl:space-x-reverse border-t border-gray-200 rounded-b">
                    <button :disabled="formData.legalBasis.length == 0" @click="showModal.legalBasis = false" type="button"
                        class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center disabled:cursor-not-allowed disabled:bg-opacity-60">Pilih</button>
                </div>
            </div>
        </div>
    </div>

    <div v-show="showModal.executor" class="fixed inset-0 z-50 flex items-center justify-center w-full h-full">
        <div class="fixed inset-0 bg-gray-800 bg-opacity-30" @click="showModal.executor = false"></div>

        <div class="relative w-full max-w-xl max-h-full">
            <div class="relative bg-white rounded-lg shadow">
                <div class="flex items-center justify-between p-4 md:p-5 border-b rounded-t">
                    <h3 class="text-xl font-medium text-gray-900">
                        Centang pelaksana yang akan ditambahkan ke SOP
                    </h3>
                    <button type="button"
                        class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center"
                        @click="showModal.executor = false">
                        <XMarkCloseIcon class="w-3 h-3" />
                        <span class="sr-only">Tutup modal</span>
                    </button>
                </div>
                <div class="p-4 md:p-5 space-y-4">
                    <DataTable
                        :data="dataImplementer" 
                        :columns="[{ field: 'name', label: 'Nama', sortable: true, searchable: true }]" 
                        :check-column="true"
                        v-model="formData.implementer"
                    />
                </div>
                <div
                    class="flex items-center p-4 md:p-5 space-x-3 rtl:space-x-reverse border-t border-gray-200 rounded-b">
                    <button :disabled="formData.implementer.length == 0" @click="showModal.executor = false" type="button"
                        class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center disabled:cursor-not-allowed disabled:bg-opacity-60">Pilih</button>
                </div>
            </div>
        </div>
    </div>

</template>
