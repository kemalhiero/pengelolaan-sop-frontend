<script setup>
import { computed, inject, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import useToastPromise from '@/utils/toastPromiseHandler';
import { createSopDrafter, getUserByRole } from '@/api/userApi';
import { createSopDetail, getLatestSopInYear, getOneSop } from '@/api/sopApi';

import PageTitle from '@/components/authenticated/PageTitle.vue';
import XMarkCloseIcon from '@/assets/icons/XMarkCloseIcon.vue';
import DataTable from '@/components/DataTable.vue';
import TrashCanIcon from '@/assets/icons/TrashCanIcon.vue';
import WarningText from '@/components/validation/WarningText.vue';
import { general, department, laboratory } from '@/data/letterCode';

const layoutType = inject('layoutType');
layoutType.value = 'admin';

const route = useRoute();
const router = useRouter();
const showDrafterModal = ref(false);
const currentYear = new Date().getFullYear();
const form = ref({
    name: '',
    number: '',
    drafter: [],
    latest_version: null,
    description: '',
    id_org: null,
});
let latestSopNumber = 0;
const dataDrafter = ref([]);
const showWarning = ref({
    drafter: false,
    number: false
});

const fetchData = async () => {
  try {
    const response = await getOneSop(route.params.id);
    form.value.name = response.data.name;
    form.value.id_org = response.data.organization.id;
    form.value.latest_version = Math.max(...response.data.version.map(v => v.version));
  } catch (error) {
    console.error('Fetch error:', error);
  }
};

const fetchLatestSopInYear = async () => {
  try {
    const response = await getLatestSopInYear(currentYear);
    latestSopNumber = parseInt(response.data.number.split("/")[1]);
    form.value.number = latestSopNumber + 1;
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

const removeDrafter = (index) => {
    form.value.drafter.splice(index, 1);
};

const submitSop = async () => {
    try {
        showWarning.value.drafter = !form.value.drafter.length;
        showWarning.value.number = form.value.number <= latestSopNumber || form.value.number > 999;
        if (showWarning.value.drafter || showWarning.value.number) return;

        await useToastPromise(
            () =>
                new Promise(async (resolve, reject) => {
                // 1. Buat detail POS
                const resultSopdetail = await createSopDetail(
                    route.params.id,
                    {
                        number: `T/${String(form.value.number).padStart(3, '0')}/${letterCode.value}/${currentYear}`,
                        description: form.value.description,
                        version: parseInt(form.value.latest_version) + 1,
                    }
                );
                if (!resultSopdetail.success) {
                    console.error('Error creating POS detail:', resultSopdetail.error);
                    reject(resultSopdetail.error?.message || resultSopdetail.error || 'Terjadi kesalahan saat membuat detail POS');
                    return;
                }

                // 2. Buat semua drafter sekaligus
                await Promise.all(
                    form.value.drafter.map(item =>
                        createSopDrafter({
                            id_user: item.id,
                            id_sop_detail: resultSopdetail.data.id_sop_detail,
                        })
                    )
                );
                resolve();
            }),
            {
                messages: {
                    success: 'POS versi baru berhasil dibuat!',
                    error: (msg) => msg,
                },
                toastOptions: {
                    autoClose: 2000,
                }
            }
        );

        setTimeout(() => {
            router.push(`/app/docs/${route.params.id}`)
        }, 2000) // Delay 2 detik

    } catch (error) {
        console.error('Error saat mengirim data:', error);
    }
};

const letterCode = computed(() => {
    if (form.value.id_org !== null && form.value.id_org !== '') {
        return form.value.id_org === 0 ? department : laboratory;
    } else {
        return general;
    }
})

onMounted( async() => {
    await fetchData();
    await fetchLatestSopInYear();
    await fetchDrafter();
});
</script>

<template>
    <PageTitle :judul="`Perbarui POS ${form.name}`" class="mt-3 mb-7"/>

    <section class="bg-white">
        <div class="py-8 px-4 mx-auto max-w-3xl">
            <form @submit.prevent="submitSop">
                <div class="grid gap-4 sm:grid-cols-2 sm:gap-6">
                    
                    <div class="col-span-2 sm:col-span-1">
                        <label for="num" class="block mb-2 text-sm font-medium text-gray-900">
                            Nomor
                            <span class="text-red-600">*</span>
                        </label>
                        <div class="flex items-center">
                            <span class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-l-lg p-2.5"> T/ </span>
                            <input id="num" type="number" :min="form.number" max="999" required v-model="form.number" @click="showWarning.number = false"
                                class="bg-gray-50 border-t border-b border-gray-300 text-gray-900 text-sm p-2.5 min-w-12 w-full"
                                title="Masukkan no urut sop">
                            <span class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-r-lg p-2.5 w-fit whitespace-nowrap">
                                /{{ letterCode + '/' + currentYear }}
                            </span>
                        </div>
                        <WarningText v-show="showWarning.number" text="Nomor sudah dipakai, ganti dengan yang lain!" />
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

                        <button @click="showDrafterModal = true" type="button"
                            class="block w-full md:w-auto text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-3 py-2 text-center">
                            Tambahkan Penyusun
                        </button>

                        <WarningText v-show="showWarning.drafter" text="Jangan lupa untuk memilih user yang akan ditugaskan!" />
                    </div>

                    <div class="col-span-2">
                        <label for="description" class="block mb-2 text-sm font-medium text-gray-900">
                            Deskripsi<span class="text-red-600">*</span>
                        </label>
                        <textarea id="description" rows="8" v-model="form.description" required minlength="10" maxlength="1000"
                            class="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-primary-500 focus:border-primary-500"
                            placeholder="ketikkan deskripsi POS disini..."></textarea>
                    </div>
                </div>
                <button type="submit"
                    class="block w-full md:w-auto text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-3 py-3 sm:mt-6 text-center">
                    Mulai buat POS versi terbaru
                </button>
            </form>
        </div>
    </section>

    <!-- TODO ntar tampilin juga user yang sudah terpilih sebelumnya (sudah terceklis saat modal ditampilin) -->
    <div v-show="showDrafterModal" class="fixed inset-0 z-50 flex items-center justify-center w-full h-full">
        <div class="fixed inset-0 bg-gray-800 bg-opacity-30" @click="showDrafterModal = false"></div>
        <div class="relative w-full max-w-2xl max-h-full">
            <div class="relative bg-white rounded-lg shadow">
                <div class="flex items-center justify-between p-4 md:p-5 border-b rounded-t">
                    <h3 class="text-xl font-medium text-gray-900">
                        Centang user yang akan ditugaskan untuk membuat POS
                    </h3>
                    <button type="button"
                        class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center"
                        @click="showDrafterModal = false">
                        <XMarkCloseIcon class="w-3 h-3" />
                        <span class="sr-only">Tutup modal</span>
                    </button>
                </div>
                <div class="p-4 md:p-5 space-y-4">
                    <DataTable 
                        :data="dataDrafter" 
                        :columns="[{ field: 'name', label: 'Nama', sortable: true, searchable: true },]"
                        :check-column="true"
                        v-model="form.drafter" 
                    />
                </div>
                <div
                    class="flex items-center p-4 md:p-5 space-x-3 rtl:space-x-reverse border-t border-gray-200 rounded-b">
                    <button :disabled="form.drafter.length == 0"
                        @click="showDrafterModal = false, showWarning.drafter = false" type="button"
                        class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center disabled:cursor-not-allowed disabled:bg-opacity-60">
                        Pilih
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>
