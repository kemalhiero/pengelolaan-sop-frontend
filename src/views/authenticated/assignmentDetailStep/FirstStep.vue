<script setup>
import { onMounted, ref } from 'vue';
import { initModals } from 'flowbite';
import { getImplementer } from '@/api/sopImplementerApi';

import CircleInfoIcon from '@/assets/icons/CircleInfoIcon.vue';
import TrashCanIcon from '@/assets/icons/TrashCanIcon.vue';
import XMarkCloseIcon from '@/assets/icons/XMarkCloseIcon.vue';
import DataTable from '@/components/DataTable.vue';
import Tooltip from '@/components/Tooltip.vue';

// Data peraturan
const data = [
    { id: 1, nama: 'Peraturan Pemerintah Nomor 95 Tahun 2021 tentang Perguruan Tinggi Negeri Badan Hukum Universitas Andalas' },
    { id: 2, nama: ' Peraturan Rektor Universitas Andalas Nomor 8 Tahun 2022 tentang Organisasi dan Tata Kerja Organ Pengelola Universitas Andalas' }
];

const form = ref({
    section: '',
    implementer: [],
    legalBasis: [],
    implementQualification: [],
    relatedSop: [],
    equipment: [],
    warning: '',
    record: []
});

const showModal = ref({
    legalBasis: false,
    executor: false
})

// Fungsi untuk menghapus peraturan yang sudah dipilih
const removeLaw = (index) => {
    form.value.legalBasis.splice(index, 1);
};

// pelaksana
const dataImplementer = ref([]);

const fetchImplementer = async () => {
    try {
        const result = await getImplementer();
        dataImplementer.value = result.data;        
    } catch (error) {
        console.error('Fetch error:', error);
    }
}
const removeImplementer = (index) => {
    form.value.implementer.splice(index, 1);
};

// kualifikasi pelaksanaan
const newIQItem = ref([]);

const addIQ = () => {
    if (newIQItem.value && !form.value.implementQualification.includes(newIQItem.value)) {
        form.value.implementQualification.push(newIQItem.value); // Menambahkan item baru
        newIQItem.value = ''; // Mengosongkan input setelah ditambah
    }
    console.log(form.value.implementQualification);
};

const removeImplementQualification = (index) => {
    form.value.implementQualification.splice(index, 1);
}

// keterkaitan dengan pos ap lain
const newRelatedSopItem = ref([]);

const addRelatedSop = () => {
    if (newRelatedSopItem.value && !form.value.relatedSop.includes(newRelatedSopItem.value)) {
        form.value.relatedSop.push(newRelatedSopItem.value); // Menambahkan item baru
        newRelatedSopItem.value = ''; // Mengosongkan input setelah ditambah
    }
    console.log(form.value.relatedSop);
};

const removeRelatedSop = (index) => {
    form.value.relatedSop.splice(index, 1);
}

// peralatan/perlengkapan
const newEquipmentItem = ref([]);

const addEquipment = () => {
    if (newEquipmentItem.value && !form.value.equipment.includes(newEquipmentItem.value)) {
        form.value.equipment.push(newEquipmentItem.value); // Menambahkan item baru
        newEquipmentItem.value = ''; // Mengosongkan input setelah ditambah
    }
    console.log(form.value.equipment);
};

const removeEquipment = (index) => {
    form.value.equipment.splice(index, 1);
}

// pencatatan dan pendataan
const newRecordItem = ref([]);

const addRecord = () => {
    if (newRecordItem.value && !form.value.record.includes(newRecordItem.value)) {
        form.value.record.push(newRecordItem.value); // Menambahkan item baru
        newRecordItem.value = ''; // Mengosongkan input setelah ditambah
    }
    console.log(form.value.record);
};

const removeRecord = (index) => {
    form.value.record.splice(index, 1);
}

// -----------------------
onMounted(() => {
    initModals();
    fetchImplementer();
});

</script>

<template>
    <div class="max-w-2xl mx-auto">
        <div class="my-4 inline-flex items-center">
            <CircleInfoIcon class="w-5 mr-2" />
            Informasi dari Penanggung Jawab, tidak bisa diubah!
        </div>

        <div class="mb-4">
            <label for="sop-number" class="block mb-2 text-sm font-medium ">
                Nama
            </label>
            <input type="text" id="sop-number"
                class="bg-gray-50 border border-gray-300 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 "
                value="Pendaftaran Kerja Praktik" readonly />
        </div>

        <div class="grid gap-4 sm:grid-cols-2 sm:gap-5 text-black mb-4">
            <div>
                <label for="sop-number" class="block mb-2 text-sm font-medium ">
                    Nomor
                </label>
                <input type="text" id="sop-number"
                    class="bg-gray-50 border border-gray-300 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 "
                    value="T/001/UN16.17.02/OT.01.00/2024" readonly />
            </div>
            <div>
                <label for="sop-date" class="block mb-2 text-sm font-medium ">
                    Tanggal
                </label>
                <input type="text" id="sop-date"
                    class="bg-gray-50 border border-gray-300 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                    value="11/10/2024" readonly />
            </div>
            <div>
                <label for="sop-org" class="block mb-2 text-sm font-medium ">
                    Organisasi
                </label>
                <input type="text" id="sop-org"
                    class="bg-gray-50 border border-gray-300 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                    value="Departemen Sistem Informasi" readonly />
            </div>
            <div>
                <label for="sop-pic" class="block mb-2 text-sm font-medium ">
                    Penanggung Jawab
                </label>
                <input type="text" id="sop-pic"
                    class="bg-gray-50 border border-gray-300 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                    value="Husnil Kamil" readonly />
            </div>
        </div>

        <div class="mb-5">
            <label for="sop-description" class="block mb-2 text-sm font-medium ">
                Deskripsi
            </label>
            <textarea id="sop-description" disabled
                class="bg-gray-50 border border-gray-300 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 h-48">Lorem ipsum dolor sit amet consectetur adipisicing elit. Assumenda incidunt dolores veniam molestias doloribus voluptatem itaque fugiat commodi quibusdam voluptate eveniet quo eligendi, laudantium cupiditate obcaecati quaerat praesentium a labore reiciendis, aut cumque! Exercitationem ea quaerat iure quae dolorem, temporibus perferendis aperiam ducimus nemo dolor harum reiciendis atque? Vitae, ipsum.</textarea>
        </div>

        <div class="grid gap-4 sm:grid-cols-2 sm:gap-6 text-black">
            <div class="mb-5">
                <h2 class="mb-2 text-sm font-semibold text-gray-900 dark:text-white">Pelaksana:</h2>
                <ul class="max-w-md space-y-1 list-disc list-inside text-sm">
                    <li>Mahasiswa</li>
                    <li>Departemen</li>
                    <li>Perusahaan</li>
                </ul>
            </div>
            <div class="mb-5">
                <h2 class="mb-2 text-sm font-semibold text-gray-900 dark:text-white">User yang ditugaskan:</h2>
                <ul class="max-w-md space-y-1 list-disc list-inside text-sm">
                    <li>Kemal</li>
                    <li>Kamal</li>
                    <li>Kamil</li>
                </ul>
            </div>
        </div>

        <div class="inline-flex items-center justify-center w-full">
            <hr class="w-64 h-1 my-8 bg-gray-300 border-0 rounded">
            <div class="absolute px-4 -translate-x-1/2 bg-white left-1/2">
                <svg class="w-4 h-4 text-gray-700" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor" viewBox="0 0 18 14">
                    <path
                        d="M6 0H2a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h4v1a3 3 0 0 1-3 3H2a1 1 0 0 0 0 2h1a5.006 5.006 0 0 0 5-5V2a2 2 0 0 0-2-2Zm10 0h-4a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h4v1a3 3 0 0 1-3 3h-1a1 1 0 0 0 0 2h1a5.006 5.006 0 0 0 5-5V2a2 2 0 0 0-2-2Z" />
                </svg>
            </div>
        </div>

        <div class="my-4 inline-flex items-center">
            <CircleInfoIcon class="w-5 mr-2" />
            Form berikut wajib diisi sebagai sebagai identitas dari SOP!
        </div>

        <div class="mb-4">
            <label for="sop-section" class="block mb-2 text-sm font-medium ">
                Seksi
            </label>
            <input type="text" id="sop-section" v-model="form.section"
                class="bg-gray-50 border border-gray-300 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 "
                value="Semua Seksi di Lingkungan Departemen Sistem Informasi" />
        </div>

        <div class="mb-4">
            <label class="block mb-2 text-sm font-medium">
                Pelaksana
            </label>

            <div v-if="form.implementer.length > 0" class="my-4">
                <ul class="flex flex-wrap gap-2">
                    <li v-for="(item, index) in form.implementer" :key="index"
                        class="bg-gray-200 rounded-lg p-1.5 flex items-center justify-between">
                        <span class="mr-2">{{ item.name }}</span>
                        <button :title="`Hapus item ${index + 1}`" @click="removeImplementer(index)"
                            type="button"
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
        </div>


        <div class="mb-4">
            <label class="block mb-2 text-sm font-medium ">
                Dasar Hukum
            </label>

            <!-- Daftar Dasar Hukum yang Dipilih -->
            <div v-if="form.legalBasis.length > 0" class="my-4">
                <ul>
                    <li v-for="(law, index) in form.legalBasis" :key="index"
                        class="flex items-center justify-between p-2 bg-gray-200 rounded-lg mb-2">
                        <span class="text-sm">{{ law.nama }}</span>
                        <button :title="`Hapus peraturan ${index + 1}`" @click="removeLaw(index)"
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
        </div>

        <div class="my-4">
            <label for="implement-qualification" class="mb-2 text-sm font-medium inline-flex">
                Kualifikasi Pelaksanaan
                <Tooltip field="implement-qualification" text="Misal: Memiliki kemampuan pengolahan data sederhana" />
            </label>
            <input type="text" id="implement-qualification" v-model="newIQItem" @keyup.enter.prevent="addIQ"
                class="bg-gray-50 border border-gray-300 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 "
                placeholder="ketikkan, lalu tekan enter" title="Contoh: Memiliki Kemampuan pengolahan data sederhana" />

            <!-- Daftar kualifikasi pelaksanaan -->
            <div v-if="form.implementQualification.length > 0" class="my-4">
                <ul>
                    <li v-for="(iq, index) in form.implementQualification" :key="index"
                        class="flex items-center justify-between p-2 bg-gray-200 rounded-lg mb-2">
                        <span>{{ iq }}</span>
                        <button :title="`Hapus item ${index + 1}`" @click="removeImplementQualification(index)"
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
            <input type="text" id="related-sop" v-model="newRelatedSopItem" @keyup.enter.prevent="addRelatedSop"
                class="bg-gray-50 border border-gray-300 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 "
                placeholder="ketikkan, lalu tekan enter" />

            <!-- Daftar POS AP yang terkait -->
            <div v-if="form.relatedSop.length > 0" class="my-4">
                <ul>
                    <li v-for="(rs, index) in form.relatedSop" :key="index"
                        class="flex items-center justify-between p-2 bg-gray-200 rounded-lg mb-2">
                        <span>{{ rs }}</span>
                        <button :title="`Hapus item ${index + 1}`" @click="removeRelatedSop(index)"
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
            <input type="text" id="equipment-input" v-model="newEquipmentItem" @keyup.enter.prevent="addEquipment"
                class="bg-gray-50 border border-gray-300 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 "
                placeholder="ketikkan, lalu tekan enter" />

            <!-- Daftar peralatan/perlengkapan -->
            <div v-if="form.equipment.length > 0" class="my-4">
                <ul class="flex flex-wrap gap-2">
                    <li v-for="(rs, index) in form.equipment" :key="index"
                        class="bg-gray-200 rounded-lg p-1.5 flex items-center justify-between">
                        <span class="mr-2">{{ rs }}</span>
                        <button :title="`Hapus item ${index + 1}`" @click="removeEquipment(index)"
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
                <Tooltip field="warning" text="Misal: Jika POS AP ini tidak dilaksanakan, mengakibatkan terhambatnya proses 
                    kerja praktik mahasiswa." />
            </label>
            <textarea id="sop-warning" placeholder="ketikkan teks peringatan disini" v-model="form.warning"
                class="bg-gray-50 border border-gray-300 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 h-24"></textarea>
        </div>

        <div class="my-4">
            <label for="data-record-input" class="mb-2 text-sm font-medium inline-flex">
                Pencatatan dan Pendataan
                <Tooltip field="data-record" text="Misal: Dokumen" />
            </label>
            <input type="text" id="data-record-input" v-model="newRecordItem" @keyup.enter.prevent="addRecord"
                class="bg-gray-50 border border-gray-300 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 "
                placeholder="ketikkan, lalu tekan enter" />

            <!-- Daftar peralatan/perlengkapan -->
            <div v-if="form.record.length > 0" class="my-4">
                <ul class="flex flex-wrap gap-2">
                    <li v-for="(rs, index) in form.record" :key="index"
                        class="bg-gray-200 rounded-lg p-1.5 flex items-center justify-between">
                        <span class="mr-2">{{ rs }}</span>
                        <button :title="`Hapus item ${index + 1}`" @click="removeRecord(index)"
                            class="p-1.5 text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 flex items-center justify-center">
                            <TrashCanIcon class="fill-current w-4" />
                        </button>
                    </li>
                </ul>
            </div>
        </div>

    </div>

    <button @click="console.log(form)">konsol</button>

    <!-- Large Modal -->
    <div v-show="showModal.legalBasis" class="fixed inset-0 z-50 flex items-center justify-center w-full h-full">
        <div class="fixed inset-0 bg-gray-800 bg-opacity-30" @click="showModal.legalBasis = false"></div>
        
        <div class="relative w-full max-w-4xl max-h-full">
            <div class="relative bg-white rounded-lg shadow">
                <!-- Modal header -->
                <div class="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600">
                    <h3 class="text-xl font-medium text-gray-900 dark:text-white">
                        Centang peraturan yang akan ditambahkan ke SOP
                    </h3>
                    <!-- <Tooltip field="law-modal" text="Misal: Jika POS AP ini tidak dilaksanakan, mengakibatkan terhambatnya proses kerja praktik mahasiswa." /> -->
                    <button type="button"
                        class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
                        data-modal-hide="law-basis-modal">
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

                    <DataTable :data="data" :columns="[
                        { field: 'nama', label: 'Nama', sortable: true },
                    ]" :searchable="['nama']" :table-type="'check'" v-model:selectedItems="form.legalBasis" />

                </div>
                <!-- Modal footer -->
                <div
                    class="flex items-center p-4 md:p-5 space-x-3 rtl:space-x-reverse border-t border-gray-200 rounded-b">
                    <button :disabled="form.legalBasis.length == 0"
                        @click="showModal.legalBasis = false" type="button"
                        class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center disabled:cursor-not-allowed disabled:bg-opacity-60">Tambahkan</button>
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
                        :columns="[
                            { field: 'name', label: 'Nama', sortable: true },
                        ]" 
                        :searchable="['name']" 
                        :table-type="'check'" 
                        v-model:selectedItems="form.implementer" 
                    />
                </div>
                <div
                    class="flex items-center p-4 md:p-5 space-x-3 rtl:space-x-reverse border-t border-gray-200 rounded-b">
                    <button :disabled="form.implementer.length == 0"
                        @click="showModal.executor = false" type="button"
                        class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center disabled:cursor-not-allowed disabled:bg-opacity-60">Tambahkan</button>
                </div>
            </div>
        </div>
    </div>

</template>
