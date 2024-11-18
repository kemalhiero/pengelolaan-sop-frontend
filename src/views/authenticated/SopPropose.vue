<script setup>
import { onMounted, ref } from 'vue';
import { getOrg } from '@/api/orgApi';
import { initModals } from 'flowbite';

import PageTitle from '@/components/authenticated/PageTitle.vue';
import XMarkCloseIcon from '@/assets/icons/XMarkCloseIcon.vue';
import DataTable from '@/components/DataTable.vue';
import TrashCanIcon from '@/assets/icons/TrashCanIcon.vue';
import { getImplementer } from '@/api/sopImplementerApi';

// pelaksana
const executor = [
    { nama: 'pelaksana 1' },
    { nama: 'pelaksana 2' },
    { nama: 'pelaksana 3' },
    { nama: 'pelaksana 4' },
    { nama: 'pelaksana 5' },
    { nama: 'pelaksana 6' },
    { nama: 'pelaksana 7' },
];
const selectedExecutor = ref([]);
const removeExecutor = (index) => {
    selectedExecutor.value.splice(index, 1);
};

const editablePart = ref('000');

// penugasan
const employe = [
    { nama: 'John Doe' },
    { nama: 'Jane Smith' },
    { nama: 'Michael Johnson' },
    { nama: 'Kemal Muhammad Hiero' },
    { nama: 'Keke' },
    { nama: 'Jessica' },
];
const selectedEmploye = ref([]);
const removeEmploye = (index) => {
    selectedEmploye.value.splice(index, 1);
};

const dataOrg = ref([]);
const fetchOrg = async () => {
    try {
        const result = await getOrg();
        dataOrg.value = result.data;
    } catch (error) {
        console.error('Fetch error:', error);
    }
};

const dataImplementer = ref([]);
const fetchImplementer = async () => {
    try {
        const result = await getImplementer();
        dataImplementer.value = result.data;        
    } catch (error) {
        console.error('Fetch error:', error);
    }
}

onMounted(() => {
    fetchOrg();
    fetchImplementer();
    initModals();
});

</script>

<template>
    <main class="p-4 md:ml-64 h-auto pt-20">

        <PageTitle judul="Usulkan POS baru" />

        <section class="bg-white">
            <div class="py-8 px-4 mx-auto max-w-3xl">
                <form>
                    <div class="grid gap-4 sm:grid-cols-2 sm:gap-6">
                        <div class="sm:col-span-2">
                            <label for="name" class="block mb-2 text-sm font-medium text-gray-900">
                                Nama POS
                            </label>
                            <input type="text" name="name" id="name"
                                class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                                placeholder="Contoh : Pengusulan Kerja Praktik (langsung judul, tanpa perlu 'SOP' atau 'POS' di awal)">
                        </div>

                        <div class="sm:col-span-2">
                            <label for="name" class="block mb-2 text-sm font-medium text-gray-900">
                                Nomor POS
                            </label>
                            <div class="flex items-center">
                                <span
                                    class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-l-lg p-2.5">
                                    T/
                                </span>
                                <input type="text" v-model="editablePart"
                                    class="bg-gray-50 border-t border-b border-gray-300 text-gray-900 text-sm p-2.5"
                                    placeholder="Masukkan no urut sop">
                                <span
                                    class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-r-lg p-2.5">
                                    /UN16.17.02/OT.01.00/{{ new Date().getFullYear() }}
                                </span>
                            </div>
                        </div>

                        <div>
                            <label for="org" class="block mb-2 text-sm font-medium text-gray-900">Organisasi</label>
                            <select id="org"
                                class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5">
                                <option selected value="">Pilih organisasi</option>
                                <option v-for="(item, index) in dataOrg" :value="item.id" :key="`org-${index}`">{{
                                    item.name }}</option>
                            </select>
                        </div>

                        <div class="w-full">
                            <label for="sop-date-make" class="block mb-2 text-sm font-medium text-gray-900">
                                Tanggal Pembuatan
                            </label>
                            <input type="date" name="sop-date-make" id="sop-date-make"
                                class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                                placeholder="Masukkan tanggal">
                        </div>

                        <div class="sm:col-span-2">
                            <label class="block mb-2 text-sm font-medium">
                                Pelaksana
                            </label>

                            <div v-if="selectedExecutor.length > 0" class="my-4">
                                <ul class="flex flex-wrap gap-2">
                                    <li v-for="(item, index) in selectedExecutor" :key="index"
                                        class="bg-gray-200 rounded-lg p-1.5 flex items-center justify-between">
                                        <span class="mr-2">{{ item.nama }}</span>
                                        <button :title="`Hapus item ${index + 1}`" @click="removeExecutor(index)"
                                            type="button"
                                            class="p-1.5 text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 flex items-center justify-center">
                                            <TrashCanIcon class="fill-current w-4" />
                                        </button>
                                    </li>
                                </ul>
                            </div>

                            <button data-modal-target="executor-modal" data-modal-toggle="executor-modal"
                                class="block w-full md:w-auto text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-3 py-2 text-center"
                                type="button">
                                Tambah Pelaksana
                            </button>
                        </div>

                        <div class="sm:col-span-2">
                            <label class="block mb-2 text-sm font-medium">
                                Penugasan
                            </label>

                            <div v-if="selectedEmploye.length > 0" class="my-4">
                                <ul class="flex flex-wrap gap-2">
                                    <li v-for="(item, index) in selectedEmploye" :key="index"
                                        class="bg-gray-200 rounded-lg p-1.5 flex items-center justify-between">
                                        <span class="mr-2">{{ item.nama }}</span>
                                        <button :title="`Hapus item ${index + 1}`" @click="removeEmploye(index)"
                                            type="button"
                                            class="p-1.5 text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 flex items-center justify-center">
                                            <TrashCanIcon class="fill-current w-4" />
                                        </button>
                                    </li>
                                </ul>
                            </div>

                            <button data-modal-target="employe-modal" data-modal-toggle="employe-modal"
                                class="block w-full md:w-auto text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-3 py-2 text-center"
                                type="button">
                                Tambahkan User
                            </button>
                        </div>

                        <div class="sm:col-span-2">
                            <label for="description"
                                class="block mb-2 text-sm font-medium text-gray-900">Deskripsi</label>
                            <textarea id="description" rows="8"
                                class="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-primary-500 focus:border-primary-500"
                                placeholder="Ketikkan deskripsi SOP disini..."></textarea>
                        </div>
                    </div>
                    <button type="button"
                        class="inline-flex items-center px-5 py-2.5 mt-4 sm:mt-6 text-sm font-medium text-center text-white bg-primary-700 rounded-lg focus:ring-4 focus:ring-primary-200 hover:bg-primary-800">
                        Mulai buat SOP baru
                    </button>
                </form>
            </div>
        </section>
    </main>

    <div id="executor-modal" tabindex="-1"
        class="fixed top-0 left-0 right-0 z-50 hidden w-full p-4 overflow-x-hidden overflow-y-auto md:inset-0 h-[calc(100%-1rem)] max-h-full">
        <div class="relative w-full max-w-xl max-h-full">
            <!-- Modal content -->
            <div class="relative bg-white rounded-lg shadow dark:bg-gray-700">
                <!-- Modal header -->
                <div class="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600">
                    <h3 class="text-xl font-medium text-gray-900">
                        Centang peraturan yang akan ditambahkan ke SOP
                    </h3>
                    <!-- <Tooltip field="law-modal" text="Misal: Jika POS AP ini tidak dilaksanakan, mengakibatkan terhambatnya proses kerja praktik mahasiswa." /> -->
                    <button type="button"
                        class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
                        data-modal-hide="executor-modal">
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

                    <DataTable 
                        :data="executor" 
                        :columns="[
                            { field: 'implementer_name', label: 'Nama', sortable: true },
                        ]" 
                        :searchable="['nama']" 
                        :table-type="'check'" 
                        v-model:selectedItems="selectedExecutor" 
                    />

                </div>
                <!-- Modal footer -->
                <div
                    class="flex items-center p-4 md:p-5 space-x-3 rtl:space-x-reverse border-t border-gray-200 rounded-b">
                    <button :disabled="selectedExecutor.length == 0" data-modal-hide="executor-modal"
                        @click="console.log(selectedExecutor)" type="button"
                        class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center disabled:cursor-not-allowed disabled:bg-opacity-60">Tambahkan</button>
                </div>
            </div>
        </div>
    </div>

    <div id="employe-modal" tabindex="-1"
        class="fixed top-0 left-0 right-0 z-50 hidden w-full p-4 overflow-x-hidden overflow-y-auto md:inset-0 h-[calc(100%-1rem)] max-h-full">
        <div class="relative w-full max-w-2xl max-h-full">
            <!-- Modal content -->
            <div class="relative bg-white rounded-lg shadow dark:bg-gray-700">
                <!-- Modal header -->
                <div class="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600">
                    <h3 class="text-xl font-medium text-gray-900">
                        Centang user yang akan ditugaskan untuk membuat SOP
                    </h3>

                    <button type="button"
                        class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
                        data-modal-hide="employe-modal">
                        <XMarkCloseIcon class="w-3 h-3" />
                        <span class="sr-only">Tutup modal</span>
                    </button>
                </div>
                <!-- Modal body -->
                <div class="p-4 md:p-5 space-y-4">
                    <DataTable 
                        :data="employe" 
                        :columns="[
                            { field: 'nama', label: 'Nama', sortable: true },
                        ]" 
                        :searchable="['name']" 
                        :table-type="'check'" 
                        v-model:selectedItems="selectedEmploye" 
                    />

                </div>
                <!-- Modal footer -->
                <div
                    class="flex items-center p-4 md:p-5 space-x-3 rtl:space-x-reverse border-t border-gray-200 rounded-b">
                    <button :disabled="selectedEmploye.length == 0" data-modal-hide="employe-modal"
                        @click="console.log(selectedEmploye)" type="button"
                        class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center disabled:cursor-not-allowed disabled:bg-opacity-60">Tambahkan</button>
                </div>
            </div>
        </div>
    </div>
</template>
