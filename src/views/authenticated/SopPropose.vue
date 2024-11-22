<script setup>
import { onMounted, ref } from 'vue';
import { getOrg } from '@/api/orgApi';
import { getEmploye } from '@/api/userApi';

import PageTitle from '@/components/authenticated/PageTitle.vue';
import XMarkCloseIcon from '@/assets/icons/XMarkCloseIcon.vue';
import DataTable from '@/components/DataTable.vue';
import TrashCanIcon from '@/assets/icons/TrashCanIcon.vue';
import WarningText from '@/components/validation/WarningText.vue';

// tampil modal tambah data
const showEmployeModal = ref(false);

const currentYear = new Date().getFullYear();

// data dari api
const dataOrg = ref([]);
const dataEmploye = ref([]);


// data form
const form = ref({
    name: '',
    number: '',
    id_org: '',
    employe: [],
    description: ''
});

const formatNumber = () => {
    if (form.value.number) {
        // Pastikan angka menjadi tiga digit
        form.value.number = String(form.value.number).padStart(3, '0');
    }
};

// organisasi
const fetchOrg = async () => {
    try {
        const result = await getOrg();
        dataOrg.value = result.data;
    } catch (error) {
        console.error('Fetch error:', error);
    }
};

// penugasan
const fetchEmploye = async () => {
    try {
        const result = await getEmploye();
        dataEmploye.value = result.data;
    } catch (error) {
        console.error('Fetch error:', error);
    }
};
const removeEmploye = (index) => {
    form.value.employe.splice(index, 1);
};

const showWarningEmploye = ref(false);
const submitData = async () => {
    try {
        if (form.value.employe.length == 0) {
            return showWarningEmploye.value = true
        }
        console.log(form.value);
        showWarningEmploye.value = false;
    } catch (error) {
        console.error('Error saat mengirim data:', error);
    }
};

onMounted(() => {
    fetchOrg();
    fetchEmploye();
});

</script>

<template>
    <main class="p-4 md:ml-64 h-auto pt-20">

        <PageTitle judul="Usulkan POS baru" />

        <section class="bg-white">
            <div class="py-8 px-4 mx-auto max-w-3xl">
                <form @submit.prevent="submitData">
                    <div class="grid gap-4 sm:grid-cols-2 sm:gap-6">
                        <div class="col-span-2">
                            <label for="name" class="block mb-2 text-sm font-medium text-gray-900">
                                Nama
                            </label>
                            <input type="text" v-model="form.name" id="name" placeholder="ketik nama sop disini..."
                                required
                                class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                                title="Contoh : Pengusulan Kerja Praktik (langsung judul, tanpa perlu 'SOP' atau 'POS' di awal)">
                        </div>

                        <div class="col-span-2 sm:col-span-1">
                            <label for="name" class="block mb-2 text-sm font-medium text-gray-900">
                                Nomor
                            </label>
                            <div class="flex items-center">
                                <span
                                    class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-l-lg p-2.5">
                                    T/
                                </span>
                                <input type="number" min="1" max="999" required v-model="form.number"
                                    @blur="formatNumber"
                                    class="bg-gray-50 border-t border-b border-gray-300 text-gray-900 text-sm p-2.5 min-w-12 w-full"
                                    title="Masukkan no urut sop">
                                <span
                                    class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-r-lg p-2.5 w-fit whitespace-nowrap">
                                    /UN16.17.02/OT.01.00/{{ currentYear }}
                                </span>
                            </div>
                        </div>

                        <div class="col-span-2 sm:col-span-1">
                            <label for="org" class="block mb-2 text-sm font-medium text-gray-900">Organisasi</label>
                            <select id="org" v-model="form.id_org" required
                                class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5">
                                <option selected disabled value="">Pilih organisasi</option>
                                <option v-for="(item, index) in dataOrg" :value="item.id" :key="`org-${index}`">{{
                                    item.name }}</option>
                            </select>
                        </div>

                        <!-- <div class="w-full">
                            <label for="sop-date-make" class="block mb-2 text-sm font-medium text-gray-900">
                                Tanggal Pembuatan
                            </label>
                            <input type="date" name="sop-date-make" id="sop-date-make"
                                class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                                placeholder="Masukkan tanggal">
                        </div> -->

                        <div class="col-span-2">
                            <label class="block mb-2 text-sm font-medium">
                                Penugasan
                            </label>

                            <div v-if="form.employe.length > 0" class="my-4">
                                <ul class="flex flex-wrap gap-2">
                                    <li v-for="(item, index) in form.employe" :key="index"
                                        class="bg-gray-200 rounded-lg p-1.5 flex items-center justify-between">
                                        <span class="mr-2">{{ item.name }}</span>
                                        <button :title="`Hapus item ${index + 1}`" @click="removeEmploye(index)"
                                            type="button"
                                            class="p-1.5 text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 flex items-center justify-center">
                                            <TrashCanIcon class="fill-current w-4" />
                                        </button>
                                    </li>
                                </ul>
                            </div>

                            <button @click="showEmployeModal = true"
                                class="block w-full md:w-auto text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-3 py-2 text-center"
                                type="button">
                                Tambahkan User
                            </button>

                            <WarningText v-show="showWarningEmploye" text="Jangan lupa untuk memilih user yang akan ditugaskan!" />

                        </div>

                        <div class="col-span-2">
                            <label for="description"
                                class="block mb-2 text-sm font-medium text-gray-900">Deskripsi</label>
                            <textarea id="description" rows="8" v-model="form.description" required
                                class="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-primary-500 focus:border-primary-500"
                                placeholder="ketikkan deskripsi SOP disini..."></textarea>
                        </div>
                    </div>
                    <button type="submit"
                        class="block w-full md:w-auto text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-3 py-3 sm:mt-6 text-center">
                        Mulai buat SOP baru
                    </button>
                </form>
            </div>
        </section>
    </main>

    <div v-show="showEmployeModal" class="fixed inset-0 z-50 flex items-center justify-center w-full h-full">

        <div class="fixed inset-0 bg-gray-800 bg-opacity-30" @click="showEmployeModal = false"></div>

        <div class="relative w-full max-w-2xl max-h-full">
            <!-- Modal content -->
            <div class="relative bg-white rounded-lg shadow">
                <!-- Modal header -->
                <div class="flex items-center justify-between p-4 md:p-5 border-b rounded-t">
                    <h3 class="text-xl font-medium text-gray-900">
                        Centang user yang akan ditugaskan untuk membuat SOP
                    </h3>
                    <button type="button"
                        class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center"
                        @click="showEmployeModal = false">
                        <XMarkCloseIcon class="w-3 h-3" />
                        <span class="sr-only">Tutup modal</span>
                    </button>
                </div>
                <!-- Modal body -->
                <div class="p-4 md:p-5 space-y-4">
                    <DataTable :data="dataEmploye" :columns="[
                        { field: 'name', label: 'Nama', sortable: true },
                    ]" :searchable="['name']" :table-type="'check'" v-model:selectedItems="form.employe" />
                </div>
                <!-- Modal footer -->
                <div
                    class="flex items-center p-4 md:p-5 space-x-3 rtl:space-x-reverse border-t border-gray-200 rounded-b">
                    <button :disabled="form.employe.length == 0" @click="showEmployeModal = false, showWarningEmploye = false" type="button"
                        class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center disabled:cursor-not-allowed disabled:bg-opacity-60">
                        Pilih
                    </button>
                </div>
            </div>
        </div>

    </div>
</template>
