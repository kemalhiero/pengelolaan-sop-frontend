<script setup>
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { getOrg } from '@/api/orgApi';
import { getDrafter } from '@/api/userApi';
import { createDrafter } from '@/api/drafterApi';
import { createSop, createSopDetail } from '@/api/sopApi';

import PageTitle from '@/components/authenticated/PageTitle.vue';
import XMarkCloseIcon from '@/assets/icons/XMarkCloseIcon.vue';
import DataTable from '@/components/DataTable.vue';
import TrashCanIcon from '@/assets/icons/TrashCanIcon.vue';
import WarningText from '@/components/validation/WarningText.vue';
import ShowToast from '@/components/toast/ShowToast.vue';

const router = useRouter();
// tampil modal tambah data
const showDrafterModal = ref(false);

const currentYear = new Date().getFullYear();

// data dari api
const dataOrg = ref([]);
const dataDrafter = ref([]);

// data form
// TODO ambil dari data sop yang sekarang perbarui
const form = ref({
    name: 'Pengusulan Kerja Praktik',
    number: '',
    id_org: 1,
    drafter: [],
    description: ''
});

const toastOption = ref({
    isSucces: '',
    operation: ''
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
const fetchDrafter = async () => {
    try {
        const result = await getDrafter();
        dataDrafter.value = result.data;
    } catch (error) {
        console.error('Fetch error:', error);
    }
};
const removeDrafter = (index) => {
    form.value.drafter.splice(index, 1);
};

const showDrafterWarning = ref(false);

// sop
const submitSop = async () => {
    toastOption.value.operation = 'post'
    try {
        if (form.value.drafter.length == 0) {
            return showDrafterWarning.value = true
        }
        console.log(form.value);
        showDrafterWarning.value = false;

        const dataSop = await createSop({
            id_org: form.value.id_org,
            name: form.value.name
        });
        console.log(dataSop);
        
        const resultSopdetail = await createSopDetail(
            dataSop.data.id_sop,
            {
                number: form.value.number,
                description: form.value.description,
                version: 1
            }
        );
        console.log(resultSopdetail);
        
        form.value.drafter.forEach(async (item) => {
            await createDrafter({
                id_user: item.id,
                id_sop_detail: resultSopdetail.data.id_sop_detail,
            })
        });

        toastOption.value.isSucces = 'yes'
        console.log('sukses submit semua');
        setTimeout(() => {
            router.push('/app/docs')
        }, 2000) // Delay 2 detik

    } catch (error) {
        toastOption.value.isSucces = 'no'
        console.error('Error saat mengirim data:', error);
    }
};

onMounted(() => {
    fetchOrg();
    fetchDrafter();
});

</script>

<template>
    <main class="p-4 md:ml-64 h-auto pt-20">

        <ShowToast 
            :is-succes="toastOption.isSucces"
            :operation="toastOption.operation"
        />

        <PageTitle judul="Perbarui versi POS" />

        <section class="bg-white">
            <div class="py-8 px-4 mx-auto max-w-3xl">
                <form @submit.prevent="">
                    <div class="grid gap-4 sm:grid-cols-2 sm:gap-6">
                        <div class="col-span-2">
                            <label for="name" class="block mb-2 text-sm font-medium text-gray-900">
                                Nama
                            </label>
                            <input type="text" v-model="form.name" id="name" disabled
                                class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5">
                        </div>

                        <div class="col-span-2 sm:col-span-1">
                            <label for="name" class="block mb-2 text-sm font-medium text-gray-900">
                                Nomor<span class="text-red-600">*</span>
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
                            <label for="org" class="block mb-2 text-sm font-medium text-gray-900">
                                Organisasi
                            </label>
                            <select id="org" v-model="form.id_org" disabled
                                class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5">
                                <option selected disabled value="">Pilih organisasi</option>
                                <option v-for="(item, index) in dataOrg" :value="item.id" :key="`org-${index}`">{{
                                    item.name }}</option>
                            </select>
                        </div>

                        <div class="col-span-2">
                            <label class="block mb-2 text-sm font-medium">
                                Penugasan<span class="text-red-600">*</span>
                            </label>

                            <div v-if="form.drafter.length > 0" class="my-4">
                                <ul class="flex flex-wrap gap-2">
                                    <li v-for="(item, index) in form.drafter" :key="index"
                                        class="bg-gray-200 rounded-lg p-1.5 flex items-center justify-between">
                                        <span class="mr-2">{{ item.name }}</span>
                                        <button :title="`Hapus item ${index + 1}`" @click="removeDrafter(index)"
                                            type="button"
                                            class="p-1.5 text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 flex items-center justify-center">
                                            <TrashCanIcon class="fill-current w-4" />
                                        </button>
                                    </li>
                                </ul>
                            </div>

                            <button @click="showDrafterModal = true"
                                class="block w-full md:w-auto text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-3 py-2 text-center"
                                type="button">
                                Tambahkan User
                            </button>

                            <WarningText v-show="showDrafterWarning" text="Jangan lupa untuk memilih user yang akan ditugaskan!" />

                        </div>

                        <div class="col-span-2">
                            <label for="description"
                                class="block mb-2 text-sm font-medium text-gray-900">
                                Deskripsi<span class="text-red-600">*</span>
                            </label>
                            <textarea id="description" rows="8" v-model="form.description" required
                                class="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-primary-500 focus:border-primary-500"
                                placeholder="ketikkan deskripsi SOP disini..."></textarea>
                        </div>
                    </div>
                    <button type="submit"
                        class="block w-full md:w-auto text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-3 py-3 sm:mt-6 text-center">
                        Mulai buat SOP versi terbaru
                    </button>
                </form>
            </div>
        </section>
    </main>
    <!-- TODO ntar tampilin juga user yang sudah terpilih sebelumnya (sudah terceklis saat modal ditampilin) -->
    <div v-show="showDrafterModal" class="fixed inset-0 z-50 flex items-center justify-center w-full h-full">

        <div class="fixed inset-0 bg-gray-800 bg-opacity-30" @click="showDrafterModal = false"></div>

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
                        @click="showDrafterModal = false">
                        <XMarkCloseIcon class="w-3 h-3" />
                        <span class="sr-only">Tutup modal</span>
                    </button>
                </div>
                <!-- Modal body -->
                <div class="p-4 md:p-5 space-y-4">
                    <DataTable 
                        :data="dataDrafter" 
                        :columns="[ { field: 'name', label: 'Nama', sortable: true },]" 
                        :searchable="['name']" 
                        :table-type="'check'" 
                        v-model="form.drafter" />
                </div>
                <!-- Modal footer -->
                <div
                    class="flex items-center p-4 md:p-5 space-x-3 rtl:space-x-reverse border-t border-gray-200 rounded-b">
                    <button :disabled="form.drafter.length == 0" @click="showDrafterModal = false, showDrafterWarning = false" type="button"
                        class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center disabled:cursor-not-allowed disabled:bg-opacity-60">
                        Pilih
                    </button>
                </div>
            </div>
        </div>

    </div>
</template>
