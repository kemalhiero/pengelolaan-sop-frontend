<script setup>
import { computed, inject, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { toast } from 'vue3-toastify';

import { createSopDrafter, getUserByRole, deleteSopDrafter } from '@/api/userApi';
import { getSopVersion, updateSopDetail } from '@/api/sopApi';

import DataTable from '@/components/DataTable.vue';
import PageTitle from '@/components/authenticated/PageTitle.vue';
import XMarkCloseIcon from '@/assets/icons/XMarkCloseIcon.vue';
import TrashCanIcon from '@/assets/icons/TrashCanIcon.vue';
import WarningText from '@/components/validation/WarningText.vue';
import Error from '@/components/Error.vue';

const layoutType = inject('layoutType');
layoutType.value = 'admin';

const route = useRoute();
const router = useRouter();

const dataDrafter = ref([]);
const showDrafterModal = ref(false);
const showDrafterWarning = ref(false);
const form = ref({
    name: '',
    number: '',
    year: null,
    id_org: null,
    drafter: [],
    description: ''
});
let oldDrafters;

const isDataError = computed(() => {
    return !form.value || !form.value.name || !dataDrafter.value || !dataDrafter.value[0].name;
});

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
        if (form.value.drafter.length == 0) {
            return showDrafterWarning.value = true
        }
        showDrafterWarning.value = false;

        await updateSopDetail(
            route.params.id,
            {
                number: `T/${String(form.value.number).padStart(3, '0')}/UN16.17.02/OT.01.00/${form.value.year}`,
                description: form.value.description,
            }
        ).then(() => {
            console.log('SOP detail berhasil diperbarui');
        }).catch((error) => {
            console.error('Gagal memperbarui SOP detail:', error);
        });

        // Ambil data penyusun (drafter) lama dari hasil update, atau set ke array kosong jika tidak ada
        const oldDrafterIds = oldDrafters.map(user => user.id);
        const newDrafterIds = form.value.drafter.map(user => user.id);

        // Jika ada perubahan: hapus drafter yang sebelumnya terdaftar tapi tidak dipilih lagi
        for (const oldUser of oldDrafters) {
            if (!newDrafterIds.includes(oldUser.id)) {
                // Asumsikan ada fungsi deleteSopDrafter (tambahkan import sesuai kebutuhan)
                await deleteSopDrafter(route.params.id, oldUser.id).then(() => {
                    console.log(`Drafter ${oldUser.name} berhasil dihapus`);
                }).catch((error) => {
                    console.error(`Gagal menghapus drafter ${oldUser.name}:`, error);
                });
            }
        }

        // Untuk setiap drafter yang dipilih, cek apakah sudah terdaftar,
        // jika belum, buat baru
        for (const newUser of form.value.drafter) {
            if (!oldDrafterIds.includes(newUser.id)) {
                await createSopDrafter({
                    id_user: newUser.id,
                    id_sop_detail: route.params.id,
                });
            }
        }

        console.log('sukses submit semua');
        toast("Data berhasil diperbarui!", {
            type: "success",
            autoClose: 2000,
        });

        setTimeout(() => {
            router.push({name: 'SopDraftDetail', params: { id: route.params.id }});
        }, 2000) // Delay 2 detik

    } catch (error) {
        console.error('Error saat mengirim data:', error);
        toast(`Data gagal ditambahkan! <br> ${error} `, {
            type: "error",
            autoClose: 5000,
            dangerouslyHTMLString: true
        });
    }
};

const fetchDraft = async () => {
    try {
        const result = await getSopVersion(route.params.id);
        form.value = {
            name: result.data.name,
            number: result.data.number.split('/')[1],
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
    await fetchDrafter();
    await fetchDraft();
};

onMounted(fetchAllData);
</script>

<template>
    <PageTitle :judul="isDataError? 'Ngapain iseng iseng?🤨' : 'Perbarui Data Penugasan SOP'" />

    <section class="bg-white" v-if="!isDataError">
        <div class="py-8 px-4 mx-auto max-w-3xl">
            <form @submit.prevent="submitSop">
                <div class="grid gap-4 sm:grid-cols-2 sm:gap-6">
                    <div class="col-span-2 sm:col-span-1">
                        <label for="num" class="block mb-2 text-sm font-medium text-gray-900">
                            Nomor<span class="text-red-600">*</span>
                        </label>
                        <div class="flex items-center">
                            <span class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-l-lg p-2.5">
                                T/
                            </span>
                            <input name="num" type="number" min="1" max="999" required v-model="form.number" @blur=""
                                class="bg-gray-50 border-t border-b border-gray-300 text-gray-900 text-sm p-2.5 min-w-12 w-full"
                                title="Masukkan no urut sop">
                            <span class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-r-lg p-2.5 w-fit whitespace-nowrap">
                                /UN16.17.02/OT.01.00/{{ form.year }}
                            </span>
                        </div>
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
                                    <button :title="`Hapus item ${index + 1}`" @click="removeDrafter(index)"
                                        type="button"
                                        class="p-1.5 text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 flex items-center justify-center">
                                        <TrashCanIcon class="fill-current w-4" />
                                    </button>
                                </li>
                            </ul>
                        </div>

                        <button @click="showDrafterModal = true"
                            class="block w-full md:w-auto text-white bg-yellow-400 hover:bg-yellow-500 focus:ring-4 focus:outline-none focus:ring-yellow-300 font-medium rounded-lg text-sm px-3 py-2 text-center"
                            type="button">
                            Pilih User
                        </button>

                        <WarningText v-show="showDrafterWarning"
                            text="Jangan lupa untuk memilih user yang akan ditugaskan!" />
                    </div>

                    <div class="col-span-2">
                        <label for="description" class="block mb-2 text-sm font-medium text-gray-900">
                            Deskripsi<span class="text-red-600">*</span>
                        </label>
                        <textarea id="description" rows="8" v-model="form.description" required minlength="10" maxlength="1000"
                            class="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-primary-500 focus:border-primary-500"
                            placeholder="ketikkan deskripsi SOP disini..."></textarea>
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
                        :columns="[{ field: 'name', label: 'Nama', sortable: true, searchable: true },]"
                        :check-column="true"
                        v-model="form.drafter" 
                    />
                </div>
                <!-- Modal footer -->
                <div
                    class="flex items-center p-4 md:p-5 space-x-3 rtl:space-x-reverse border-t border-gray-200 rounded-b">
                    <button :disabled="form.drafter.length == 0"
                        @click="showDrafterModal = false, showDrafterWarning = false" type="button"
                        class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center disabled:cursor-not-allowed disabled:bg-opacity-60">
                        Pilih
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>
