<script setup>
import { computed, inject, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import useToastPromise from '@/utils/toastPromiseHandler';

import { createSopDrafter, getUserByRole, deleteSopDrafter } from '@/api/userApi';
import { getSopVersion, updateSopDetail } from '@/api/sopApi';
import { general, department, laboratory } from '@/data/letterCode.js';

import WarningText from '@/components/validation/WarningText.vue';
import PageTitle from '@/components/authenticated/PageTitle.vue';
import XMarkCloseIcon from '@/assets/icons/XMarkCloseIcon.vue';
import TrashCanIcon from '@/assets/icons/TrashCanIcon.vue';
import DataTable from '@/components/DataTable.vue';
import Error from '@/components/Error.vue';
import TableSkeleton from '@/components/TableSkeleton.vue';

const layoutType = inject('layoutType');
layoutType.value = 'admin';

const route = useRoute();
const router = useRouter();

const dataDrafter = ref([]);
const showDrafterModal = ref(false);
const showWarning = ref({
    drafter: false,
    number: false,
});
const form = ref({
    name: '',
    number: '',
    year: null,
    id_org: null,
    drafter: [],
    description: ''
});
let oldDrafters;
let oldSopNumber = 0;
const isLoading = ref(true);
const hasError = ref(false);

const isDataError = computed(() => {
    return !form.value || !form.value.name || !dataDrafter.value || !dataDrafter.value[0].name;
});

const letterCode = computed(() => {
    if (form.value.id_org !== null && form.value.id_org !== '') {
        return form.value.id_org === 0 ? department : laboratory;
    } else {
        return general;
    }
})

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
        showWarning.value.number = form.value.number < oldSopNumber || form.value.number > 999;
        if (showWarning.value.drafter || showWarning.value.number) return;

        await useToastPromise(
            () =>
                new Promise(async (resolve, reject) => {
                    let apdetSopDetail = await updateSopDetail(
                        route.params.id,
                        {
                            number: `T/${String(form.value.number).padStart(3, '0')}/${letterCode.value}/${form.value.year}`,
                            description: form.value.description,
                        }
                    );
                    if (!apdetSopDetail.success) {
                        console.error('Gagal memperbarui POS detail:', apdetSopDetail.error);
                        reject(apdetSopDetail.error?.message || apdetSopDetail.error || 'Terjadi kesalahan saat membuat POS');
                        return;
                    }

                    // Ambil data penyusun (drafter) lama dari hasil update, atau set ke array kosong jika tidak ada
                    const oldDrafterIds = oldDrafters.map(user => user.id);
                    const newDrafterIds = form.value.drafter.map(user => user.id);

                    // Jika ada perubahan: hapus drafter yang sebelumnya terdaftar tapi tidak dipilih lagi
                    for (let oldUser of oldDrafters) {
                        if (!newDrafterIds.includes(oldUser.id)) {
                            // Asumsikan ada fungsi deleteSopDrafter (tambahkan import sesuai kebutuhan)
                            let apuihSopDrafter = await deleteSopDrafter(route.params.id, oldUser.id);
                            if (!apuihSopDrafter.success) {
                                console.error('Gagal menghapus drafter:', apuihSopDrafter.error);
                                reject(apuihSopDrafter.error?.message || apuihSopDrafter.error || 'Terjadi kesalahan saat menghapus penyusun');
                                return;
                            }
                        }
                    }

                    // Untuk setiap drafter yang dipilih, cek apakah sudah terdaftar,
                    // jika belum, buat baru
                    for (let newUser of form.value.drafter) {
                        if (!oldDrafterIds.includes(newUser.id)) {
                            let tambahDrafterBaru = await createSopDrafter({
                                id_user: newUser.id,
                                id_sop_detail: route.params.id,
                            });
                            if (!tambahDrafterBaru.success) {
                                console.error('Gagal menambahkan drafter baru:', tambahDrafterBaru.error);
                                reject(tambahDrafterBaru.error?.message || tambahDrafterBaru.error || 'Terjadi kesalahan saat menambahkan penyusun');
                                return;
                            }
                        }
                    }

                    setTimeout(() => {
                        router.push({ name: 'SopDraftDetail', params: { id: route.params.id } });
                    }, 2000);
                    resolve();
                }),
            {
                messages: {
                    success: 'Sukses memperbarui data penugasan!',
                    error: (msg) => msg,
                },
                toastOptions: {
                    autoClose: 2000,
                    dangerouslyHTMLString: true,
                }
            }
        );
    } catch (error) {
        console.error('Error saat mengirim data:', error);
    }
};

const fetchDraft = async () => {
    try {
        const result = await getSopVersion(route.params.id);
        oldSopNumber = parseInt(result.data.number.split('/')[1]);
        form.value = {
            name: result.data.name,
            number: oldSopNumber,
            year: result.data.number.split('/')[4],
            id_org: result.data.organization.id,
            drafter: result.data.users || [],
            description: result.data.description
        };
        oldDrafters = JSON.parse(JSON.stringify(form.value.drafter));
    } catch (error) {
        console.error('Fetch error:', error);
    }
};

const fetchAllData = async () => {
    isLoading.value = true;
    hasError.value = false;
    try {
        await fetchDrafter();
        await fetchDraft();
    } catch (error) {
        console.error('Fetch data error:', error);
        hasError.value = true;
    } finally {
        isLoading.value = false;
    }
};

onMounted(fetchAllData);
</script>

<template>
    <TableSkeleton v-if="isLoading" :columns="1" :rows="10" class="mt-12 mx-56" />
    <Error v-else-if="hasError" @click="fetchAllData" />
    <template v-else>
        <PageTitle :judul="isDataError ? 'Ngapain iseng iseng?🤨' : 'Perbarui Data Penugasan POS'" />

        <section class="bg-white" v-if="!isDataError">
            <div class="py-8 px-4 mx-auto max-w-3xl">
                <form @submit.prevent="submitSop">
                    <div class="grid gap-4 sm:grid-cols-2 sm:gap-6">
                        <div class="col-span-2 sm:col-span-1">
                            <label for="num" class="block mb-2 text-sm font-medium text-gray-900">
                                Nomor<span class="text-red-600">*</span>
                            </label>
                            <div class="flex items-center">
                                <span class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-l-lg p-2.5"> T/ </span>
                                <input id="num" type="number" :min="form.number" max="999" required v-model="form.number" @click="showWarning.number = false"
                                    class="bg-gray-50 border-t border-b border-gray-300 text-gray-900 text-sm p-2.5 min-w-12 w-full"
                                    title="Masukkan no urut sop">
                                <span class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-r-lg p-2.5 w-fit whitespace-nowrap">
                                    /{{ letterCode + '/' + form.year }}
                                </span>
                            </div>
                            <WarningText v-show="showWarning.number" text="Nomor sudah dipakai, ganti dengan yang lain!" />
                        </div>

                        <div class="col-span-2">
                            <label class="block mb-2 text-sm font-medium">
                                User Penyusun<span class="text-red-600">*</span>
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
                                class="block w-full md:w-auto text-white bg-yellow-400 hover:bg-yellow-500 focus:ring-4 focus:outline-none focus:ring-yellow-300 font-medium rounded-lg text-sm px-3 py-2 text-center">
                                Pilih User
                            </button>

                            <WarningText v-show="showWarning.drafter"
                                text="Jangan lupa untuk memilih user yang akan ditugaskan!" />
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
                        class="block w-full md:w-auto text-white bg-yellow-400 hover:bg-yellow-500 focus:ring-4 focus:outline-none focus:ring-yellow-300 font-medium rounded-lg text-sm px-8 py-3 sm:mt-6 text-center">
                        Perbarui
                    </button>
                </form>
            </div>
        </section>
        <Error v-else @click="fetchAllData" />

        <div v-show="showDrafterModal" class="fixed inset-0 z-50 flex items-center justify-center w-full h-full">
            <div class="fixed inset-0 bg-gray-800 bg-opacity-30" @click="showDrafterModal = false"></div>
            <div class="relative w-full max-w-2xl max-h-full">
                <div class="relative bg-white rounded-lg shadow">
                    <div class="flex items-center justify-between p-4 md:p-5 border-b rounded-t">
                        <h3 class="text-xl font-medium text-gray-900">
                            Centang user yang akan ditugaskan untuk membuat POS
                        </h3>
                        <button type="button" @click="showDrafterModal = false"
                            class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center">
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
                    <div class="flex items-center p-4 md:p-5 space-x-3 rtl:space-x-reverse border-t border-gray-200 rounded-b">
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
</template>
