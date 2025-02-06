<script setup>
import { inject, onMounted, ref, watch } from 'vue';
import { toast } from 'vue3-toastify';
import { useRouter } from 'vue-router';

import { updateHod, getCurrentHod, getHodCandidate } from '@/api/userApi';
import { useAuthStore } from '@/stores/auth';
import { logoutUser } from '@/api/authApi';
import getToken from '@/utils/getToken';

import DataTable from '@/components/DataTable.vue';
import XMarkCloseIcon from '@/assets/icons/XMarkCloseIcon.vue';
import PageTitle from '@/components/authenticated/PageTitle.vue';
import ExclamationMarkIcon from '@/assets/icons/ExclamationMarkIcon.vue';

const layoutType = inject('layoutType');
layoutType.value = 'admin';

const dataHod = ref('');
const dataCandidate = ref([]);
const selectedHod = ref(null);
const showAddModal = ref(false);
const changeHodStep = ref(1);
const authStore = useAuthStore();
const router = useRouter();

const fetchCandidate = async () => {
    try {
        const result = await getHodCandidate();
        dataCandidate.value = result.data;
    } catch (error) {
        console.error('Fetch error:', error);
    }
};

const fetchHod = async () => {
    try {
        const result = await getCurrentHod();
        dataHod.value = result.data;
    } catch (error) {
        console.error('Fetch error:', error);
    }
};

const submitHod = async () => {
    try {
        if (!selectedHod.value) {
            toast('Silakan pilih ketua departemen terlebih dahulu', {
                type: "warning",
                autoClose: 3000
            });
            return;
        };
        toast.promise(
            new Promise((resolve, reject) => {
                updateHod({
                    oldHodId: dataHod.value.id,
                    newHodId: selectedHod.value
                })
                    .then(response => {
                        if (!response.success) {
                            throw response;
                        }
                        resolve(response);
                        // fetchHod();
                        // fetchCandidate();

                        // handle logout
                        logoutUser(getToken());
                        authStore.logout();
                        setTimeout(() => {
                            router.push('/')
                        }, 5000);
                    })
                    .catch(error => reject(error));
            }),
            {
                pending: {
                    render() {
                        return 'Sedang memproses data...'
                    },
                    icon: '🔄'
                },
                success: {
                    render() {
                        return 'Ketua Departemen berhasil diubah. Harap untuk login ulang terlebih dahulu!'
                    },
                    icon: '✅'
                },
                error: {
                    render({ data }) {
                        return `Gagal: ${data.error?.message || 'Terjadi kesalahan'}`
                    },
                    icon: '❌'
                }
            },
            {
                closeButton: true,
            }
        );

        showAddModal.value = false; // Tutup modal setelah berhasil
    } catch (error) {
        console.error('Error saat mengirim data:', error);
        toast(`Data gagal ditambahkan! <br> ${error} `, {
            type: "error",
            autoClose: 5000,
            dangerouslyHTMLString: true
        });
    }
};

watch(showAddModal, (newValue) => {
    if (!newValue) {
        selectedHod.value = ''; // Reset nilai saat modal ditutup
        changeHodStep.value = 1;
    }
});

onMounted(() => {
    fetchHod();
    fetchCandidate();
});
</script>

<template>
    <main class="p-4 md:ml-64 h-auto pt-20">

        <PageTitle judul="Kelola Ketua Departemen" />

        <div class="container mx-auto p-8 lg:px-16">

            <div class="lg:col-span-2 p-6">
                <h2 class="text-2xl font-bold text-gray-800 mb-6">Info Ketua Departemen saat ini</h2>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="space-y-2">
                        <label class="block text-sm font-medium text-gray-700">Nama</label>
                        <div class="flex items-center border border-gray-300 rounded-lg shadow-sm">
                            <input type="text" disabled v-model="dataHod.name"
                                class="w-full pl-3 py-2 border-none bg-transparent" />
                        </div>
                    </div>
                    <div class="space-y-2">
                        <label class="block text-sm font-medium text-gray-700">NIM/NIP</label>
                        <div class="flex items-center border border-gray-300 rounded-lg shadow-sm">
                            <input type="text" disabled v-model="dataHod.id_number"
                                class="w-full pl-3 py-2 border-none bg-transparent" />
                        </div>
                    </div>
                    <div class="space-y-2">
                        <label class="block text-sm font-medium text-gray-700">Email</label>
                        <input type="email" disabled v-model="dataHod.email"
                            class="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                    <div class="space-y-2">
                        <label class="block text-sm font-medium text-gray-700">Gender</label>
                        <div class="flex items-center border border-gray-300 rounded-lg shadow-sm">
                            <input type="text" disabled v-model="dataHod.gender"
                                class="w-full pl-3 py-2 border-none bg-transparent" />
                        </div>
                    </div>
                </div>
                <div class="mt-10 flex justify-end">
                    <button type="button" @click="showAddModal = true"
                        class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:cursor-not-allowed disabled:bg-opacity-60 flex">
                        Perbarui ketua departemen?
                    </button>
                </div>
            </div>

        </div>

    </main>

    <div v-show="showAddModal" class="fixed inset-0 z-50 flex items-center justify-center w-full h-full">
        <div class="fixed inset-0 bg-gray-800 bg-opacity-30" @click="showAddModal = false"></div>
        <div class="relative w-full max-w-2xl max-h-full">
            <!-- Modal content -->
            <div v-show="changeHodStep == 1" class="relative bg-white rounded-lg shadow">
                <!-- Modal header -->
                <div class="flex items-center justify-between p-4 md:p-5 border-b rounded-t">
                    <h3 class="text-xl font-medium text-gray-900">
                        Pilih user yang akan ditugaskan menjadi kadep
                    </h3>
                    <button type="button"
                        class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center"
                        @click="showAddModal = false">
                        <XMarkCloseIcon class="w-3 h-3" />
                        <span class="sr-only">Tutup</span>
                    </button>
                </div>
                <!-- Modal body -->
                <form @submit.prevent="changeHodStep = 2">
                    <div class="p-4 md:p-5 space-y-4">
                        <DataTable :data="dataCandidate" :columns="[
                            { field: 'id_number', label: 'NIP', sortable: true, searchable: true },
                            { field: 'name', label: 'Nama', sortable: true, searchable: true },
                        ]" :radio-column="[
                            { field: 'id', label: 'Pilih' }
                        ]" value-field="id" v-model="selectedHod" />
                    </div>
                    <!-- Modal footer -->
                    <div
                        class="flex items-center p-4 md:p-5 space-x-3 rtl:space-x-reverse border-t border-gray-200 rounded-b">
                        <button type="submit" :disabled="!selectedHod"
                            class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center disabled:cursor-not-allowed disabled:bg-opacity-60">
                            Pilih
                        </button>
                    </div>
                </form>
            </div>

            <div v-show="changeHodStep == 2" class="relative bg-white rounded-lg shadow">
                <button type="button" @click="showAddModal = false"
                    class="absolute top-3 right-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 inline-flex justify-center items-center">
                    <XMarkCloseIcon class="w-3 h-3" />
                    <span class="sr-only">Tutup modal</span>
                </button>
                <div class="p-4 md:p-5 text-center">
                    <ExclamationMarkIcon class="mx-auto mb-4 text-gray-400 w-12 h-12" />
                    <h3 class="mb-2 text-xl font-normal text-gray-800">
                        Anda yakin ingin mengganti ketua departemen?
                    </h3>
                    <p class="text-gray-500 mb-1">
                        Role anda otomatis akan diubah menjadi penyusun di <span
                            title="Departemen Sistem Informasi">DSI</span> dan anda tidak bisa lagi mengakses menu
                        khusus ketua departemen!
                    </p>
                    <p class="text-gray-600 mb-5">
                        <span class="text-red-600">*</span>
                        Anda akan diminta untuk login ulang!
                        <span class="text-red-600">*</span>
                    </p>
                    <button @click="submitHod"
                        class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm inline-flex items-center px-5 py-2.5 text-center">
                        Yakin
                    </button>
                    <button @click="showAddModal = false"
                        class="py-2.5 px-5 ms-3 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100">
                        Batal
                    </button>
                </div>
            </div>

        </div>
    </div>

</template>
