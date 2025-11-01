<script setup>
import { inject, onMounted, ref, computed, watch } from 'vue';
import { useRouter } from 'vue-router';

import useToastPromise from '@/utils/toastPromiseHandler';
import { useAuthStore } from '@/stores/auth';
import { getOrg } from '@/api/orgApi';
import { createSopDrafter, getUserByRole, getUserProfile } from '@/api/userApi';
import { createSop, createSopDetail, deleteSop, getAllSop, getLatestSopInYear } from '@/api/sopApi';
import { general, department, laboratory } from '@/data/letterCode.js';

import DataTable from '@/components/DataTable.vue';
import PageTitle from '@/components/authenticated/PageTitle.vue';
import XMarkCloseIcon from '@/assets/icons/XMarkCloseIcon.vue';
import TrashCanIcon from '@/assets/icons/TrashCanIcon.vue';
import WarningText from '@/components/validation/WarningText.vue';

const layoutType = inject('layoutType');
layoutType.value = 'admin';

const router = useRouter();
const showModal = ref({
    drafter: false, 
    sopCopy: false
});
const currentYear = new Date().getFullYear();
const dataOrg = ref([]);
const dataDrafter = ref([]);
const filteredDrafters = ref([]);
const showWarning = ref({
    drafter: false,
    number: false
});
const form = ref({
    name: '',
    number: 0,
    id_org: '',
    drafter: [],
    description: '',
    sop_copy: null,
    year: currentYear
});
const implementedSop = ref([]);
const authStore = useAuthStore();
let latestSopNumber = 0;

const selectedSopToCopy = computed(() => {
    if (!form.value.sop_copy) return null;
    return implementedSop.value.find(sop => sop.id === form.value.sop_copy);
});

const fetchOrg = async () => {
    try {
        const result = await getOrg();
        dataOrg.value = result.data;
    } catch (error) {
        console.error('Fetch error:', error);
    }
};

const fetchDrafter = async () => {
    try {
        const result = await getUserByRole('penyusun');
        dataDrafter.value = result.data;
    } catch (error) {
        console.error('Fetch error:', error);
    }
};

const fetchLatestSopInYear = async (year) => {
  try {
    const response = await getLatestSopInYear(year);
    if (response.data) {
        latestSopNumber = parseInt(response.data.number.split("/")[1]);
        form.value.number = latestSopNumber + 1;
    } else {
        latestSopNumber = 0;
        form.value.number = 1;
    }
  } catch (error) {
    latestSopNumber = 0;
    form.value.number = 1;
    console.error('Fetch error:', error);
  }
};

const fetchImplementedSop = async () => {
    try {
        const result = await getAllSop();
        implementedSop.value = result.data || [];
    } catch (error) {
        console.error('Fetch error:', error);
    }
};

const removeDrafter = (index) => {
    form.value.drafter.splice(index, 1);
};

const submitSop = async () => {
    try {
        // Validasi paralel & singkat
        showWarning.value.drafter = !form.value.drafter.length;
        showWarning.value.number = form.value.number <= latestSopNumber || form.value.number > 999;
        if (showWarning.value.drafter || showWarning.value.number) return;

        await useToastPromise( () =>
            new Promise(async (resolve, reject) => {
                let createdSopId = null;

                let dataSop = await createSop({
                    id_org: form.value.id_org,
                    name: form.value.name
                }) || null;
                createdSopId = dataSop?.data?.id_sop;
                if (!dataSop.success) {
                    console.error('Error creating POS:', dataSop.error);
                    reject(dataSop.error?.message || dataSop.error || 'Terjadi kesalahan saat membuat POS');
                    return;
                }

                let resultSopdetail = await createSopDetail(
                    dataSop.data.id_sop,
                    {
                        number: `T/${String(form.value.number).padStart(3, '0')}/${letterCode.value}/${form.value.year}`,
                        description: form.value.description,
                        version: 1,
                        copy_from: form.value.sop_copy || null,
                    }
                ) || null;

                if (!resultSopdetail.success) {
                    await deleteSop(createdSopId);
                    console.error('Error creating POS detail:', resultSopdetail.error);
                    reject(resultSopdetail.error?.message || resultSopdetail.error || 'Terjadi kesalahan saat membuat detail POS');
                    return;
                }

                await Promise.all(
                    form.value.drafter.map(item =>
                        createSopDrafter({
                            id_user: item.id,
                            id_sop_detail: resultSopdetail.data.id_sop_detail,
                        })
                    )
                );

                setTimeout(() => {
                    router.push('/app/docs');
                }, 2000);
                resolve();
            }),
            {
                messages: {
                    success: 'Sukses mengusulkan POS baru!',
                    error: (msg) => msg,
                },
                toastOptions: {
                    autoClose: 2000,
                    dangerouslyHTMLString: true,
                }
            }
        );
    } catch (error) {
        console.error('Error:', error);
    }
};

const fetchProfile = async () => {
    try {
        const result = await getUserProfile();
        const org = dataOrg.value.find(org => org.name === result.data.org);
        if (org) {
            dataOrg.value = [org];
            form.value.id_org = org.id;
        }
    } catch (error) {
        console.error('Fetch error:', error);
    }
};

const letterCode = computed(() => {
    if (form.value.id_org !== null && form.value.id_org !== '') {
        return form.value.id_org === 0 ? department : laboratory;
    } else {
        return general;
    }
});

const showDrafterList = () => {
    if (form.value.id_org !== 0) {
        filteredDrafters.value = dataDrafter.value.filter(
            (drafter) => drafter.id_org === form.value.id_org
        );
    } else {
        // Jika tidak ada organisasi yang dipilih atau organisasinya adalah departemen (id_org=0), tampilkan semua penyusun
        filteredDrafters.value = dataDrafter.value;
    }
    showModal.value.drafter = true;
};

watch(() => form.value.year, (newYear) => {
    if (newYear) {
        fetchLatestSopInYear(newYear);
    }
});

onMounted(() => {
    fetchOrg();
    fetchDrafter();
    fetchLatestSopInYear(form.value.year);
    if (authStore.userRole == 'pj') {
        fetchProfile();
    }
    fetchImplementedSop();
});
</script>

<template>
    <PageTitle judul="Usulkan POS baru" class="mt-3 mb-7" />

    <div class="py-8 px-4 mx-auto max-w-3xl">
        <form @submit.prevent="submitSop">
            <div class="grid gap-4 sm:grid-cols-2 sm:gap-6">
                <div class="col-span-2">
                    <label for="name" class="block mb-2 text-sm font-medium">
                        Nama<span class="text-red-600">*</span>
                    </label>
                    <input type="text" v-model="form.name" id="name" placeholder="ketik nama POS disini..." required minlength="5" maxlength="100"
                        class="bg-gray-50 border border-gray-300 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                        title="Contoh : Pengusulan Kerja Praktik (langsung judul, tanpa perlu 'POS' di awal)">
                </div>

                <div class="col-span-2 sm:col-span-1">
                    <label for="num" class="block mb-2 text-sm font-medium">
                        Nomor<span class="text-red-600">*</span>
                    </label>
                    <div class="flex items-center">
                        <span class="bg-gray-50 border border-gray-300 text-sm rounded-l-lg p-2.5"> T/ </span>
                        <input id="num" type="number" :min="form.number" max="999" required v-model="form.number" @click="showWarning.number = false"
                            class="bg-gray-50 border-t border-b border-gray-300 text-sm p-2.5 min-w-12 w-full"
                            title="Masukkan no urut sop">
                        <span class="bg-gray-50 border-t border-b border-gray-300 text-sm p-2.5 w-fit whitespace-nowrap">
                            /{{ letterCode }}/
                        </span>
                        <input id="year" type="number" :min="2010" :max="currentYear + 5" required v-model="form.year"
                            class="bg-gray-50 border border-gray-300 text-sm rounded-r-lg p-2.5 min-w-20 w-full"
                            title="Masukkan tahun">
                    </div>
                    <WarningText v-show="showWarning.number" text="Nomor sudah dipakai, ganti dengan yang lain!" />
                </div>

                <div class="col-span-2 sm:col-span-1">
                    <label for="org" class="block mb-2 text-sm font-medium">
                        Organisasi<span class="text-red-600">*</span>
                    </label>
                    <select id="org" v-model="form.id_org" required
                        class="bg-gray-50 border border-gray-300 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5">
                        <template v-if="authStore.userRole == 'kadep'">
                            <option selected disabled value="">Pilih organisasi</option>
                            <option v-for="(item, index) in dataOrg" :value="item.id" :key="`org-${index}`">
                                {{ item.name }}
                            </option>
                        </template>
                        <template v-else>
                            <option selected :value="dataOrg[0]?.id">{{ dataOrg[0]?.name }}</option>
                        </template>
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
                                <button :title="`Hapus item ${index + 1}`" @click="removeDrafter(index)" type="button"
                                    class="p-1.5 text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 flex items-center justify-center">
                                    <TrashCanIcon class="fill-current w-4" />
                                </button>
                            </li>
                        </ul>
                    </div>

                    <button @click="showDrafterList" type="button" :disabled="form.id_org === null || form.id_org === ''" :title="form.id_org ? 'Pilih penyusun' : 'Pilih organisasi terlebih dahulu!'"
                        class="block w-full md:w-auto text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-2.5 py-1.5 text-center disabled:cursor-not-allowed disabled:bg-opacity-60">
                        Tambahkan Penyusun
                    </button>

                    <WarningText v-show="showWarning.drafter" text="Jangan lupa untuk memilih user yang akan ditugaskan!" />
                </div>

                <div class="col-span-2">
                    <label for="description" class="block mb-2 text-sm font-medium">
                        Deskripsi<span class="text-red-600">*</span>
                    </label>
                    <textarea id="description" rows="8" v-model="form.description" required minlength="10" maxlength="1000"
                        class="block p-2.5 w-full text-sm bg-gray-50 rounded-lg border border-gray-300 focus:ring-primary-500 focus:border-primary-500"
                        placeholder="ketikkan deskripsi POS disini..."></textarea>
                </div>

                <div class="col-span-2">
                    <label class="block mb-2 text-sm font-medium">
                        Salin dari POS yang sudah ada (opsional)
                    </label>
                    <div v-if="selectedSopToCopy" class="mb-2 flex items-center gap-x-2">
                        <p class="text-sm text-gray-500">
                            POS yang dipilih: <span class="font-medium">{{ selectedSopToCopy.name }} ({{ selectedSopToCopy.org_name }})</span>
                        </p>
                        <button @click="form.sop_copy = null" type="button" title="Batalkan pemilihan POS ini"
                            class="p-1.5 text-white bg-gray-200 hover:bg-red-500 active:bg-red-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 flex items-center justify-center">
                            <XMarkCloseIcon class="fill-current w-4" />
                        </button>
                    </div>
                    <button @click="showModal.sopCopy = true" type="button"
                        class="block w-full md:w-auto text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-2.5 py-1.5 text-center">
                        {{ form.sop_copy === null ? 'Pilih' : 'Ganti' }} POS yang akan disalin
                    </button>
                </div>
            </div>
            <button type="submit"
                class="block w-full md:w-auto text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2.5 sm:mt-6 text-center">
                Mulai buat POS baru
            </button>
        </form>
    </div>

    <div v-show="showModal.drafter" class="fixed inset-0 z-50 flex items-center justify-center w-full h-full">
        <div class="fixed inset-0 bg-gray-800 bg-opacity-30" @click="showModal.drafter = false"></div>
        <div class="relative w-full max-w-2xl max-h-full">
            <div class="relative bg-white rounded-lg shadow">
                <div class="flex items-center justify-between p-4 md:p-5 border-b rounded-t">
                    <h3 class="text-xl font-medium">Centang user penyusun yang akan ditugaskan!</h3>
                    <button type="button" @click="showModal.drafter = false"
                        class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center">
                        <XMarkCloseIcon class="w-3 h-3" />
                        <span class="sr-only">Tutup modal</span>
                    </button>
                </div>
                <div class="p-4 md:p-5 space-y-4">
                    <DataTable 
                        :data="filteredDrafters" v-model="form.drafter"
                        :columns="[{ field: 'name', label: 'Nama', sortable: true, searchable: true }]"
                        :check-column="true" 
                    />
                </div>
                <div class="flex items-center p-4 md:p-5 space-x-3 border-t border-gray-200 rounded-b">
                    <button :disabled="form.drafter.length == 0"
                        @click="showModal.drafter = false, showWarning.drafter = false" type="button"
                        class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center disabled:cursor-not-allowed disabled:bg-opacity-60">
                        Pilih
                    </button>
                </div>
            </div>
        </div>
    </div>

    <div v-show="showModal.sopCopy" class="fixed inset-0 z-50 flex items-center justify-center w-full h-full">
        <div class="fixed inset-0 bg-gray-800 bg-opacity-30" @click="showModal.sopCopy = false"></div>
        <div class="relative w-full max-w-2xl max-h-full">
            <div class="relative bg-white rounded-lg shadow">
                <div class="flex items-center justify-between p-4 md:p-5 border-b rounded-t">
                    <h3 class="text-xl font-medium">Pilih POS yang akan disalin!</h3>
                    <button type="button" @click="showModal.sopCopy = false"
                        class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center">
                        <XMarkCloseIcon class="w-3 h-3" />
                        <span class="sr-only">Tutup modal</span>
                    </button>
                </div>
                <div class="p-4 md:p-5 space-y-4">
                    <DataTable 
                        :data="implementedSop" v-model="form.sop_copy"
                        :columns="[
                            { field: 'name', label: 'Nama', sortable: true, searchable: true },
                            { field: 'org_name', label: 'Organisasi', sortable: true, searchable: true },
                        ]"
                        :radio-column="[{ field: 'id', label: 'Pilih' }]" value-field="id"
                    />
                </div>
                <div class="flex items-center p-4 md:p-5 space-x-3 border-t border-gray-200 rounded-b">
                    <button :disabled="form.sop_copy == null"
                        @click="showModal.sopCopy = false" type="button"
                        class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center disabled:cursor-not-allowed disabled:bg-opacity-60">
                        Pilih
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>
