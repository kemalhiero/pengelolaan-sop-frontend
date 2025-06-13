<script setup>
import { inject, onMounted, ref } from 'vue';
import { toast } from 'vue3-toastify';
import { useAuthStore } from '@/stores/auth';
import useToastPromise from '@/utils/toastPromiseHandler';
import { useRouter } from 'vue-router';
import getToken from '@/utils/getToken';

import { logoutUser } from '@/api/authApi';
import { addPic, getAllPic, getPicCandidate, getPicDetail, getCurrentPic, updatePic, downgradeRole, changeOrganization } from '@/api/userApi';
import { getOrg } from '@/api/orgApi';
import roleAbbreviation from '@/data/roleAbbrv.json';

import Error from '@/components/Error.vue';
import DataTable from '@/components/DataTable.vue';
import EmptyState from '@/components/EmptyState.vue';
import TableSkeleton from '@/components/TableSkeleton.vue';
import XMarkCloseIcon from '@/assets/icons/XMarkCloseIcon.vue';
import PageTitle from '@/components/authenticated/PageTitle.vue';
import AddDataButton from '@/components/modal/AddDataButton.vue';
import ExclamationMarkIcon from '@/assets/icons/ExclamationMarkIcon.vue';
import { computed } from 'vue';

const layoutType = inject('layoutType');
layoutType.value = 'admin';

const dataPic = ref();
const dataCandidate = ref([]);
const showAddModal = ref(false);
const selectedPic = ref();
const isLoading = ref(true);
const hasError = ref(false);
const selectedDataDetail = ref(null);
const showDetailModal = ref(false);
const showChangePicModal = ref(false);
const changePicStep = ref(1);

const picModalStep = ref(1);
const dataOrganization = ref([]);
const allOrganization = ref([]);
const selectedOrg = ref('');
const authStore = useAuthStore();
const router = useRouter();

const fetchPic = async () => {
    try {
        isLoading.value = true;
        hasError.value = false;

        let result;
        if (authStore.userRole === 'kadep') {
            result = await getAllPic();
            dataPic.value = result?.data || [];
        } else {
            result = await getCurrentPic();
            dataPic.value = result?.data || null;
            if (result.data.gender == 'pria') {
                dataPic.value.gender = 'Laki-laki'
            } else if (result.data.gender == 'wanita') {
                dataPic.value.gender = 'Perempuan'
            }
        }
        if (!result?.success) {
            hasError.value = true;
            dataPic.value = authStore.userRole === 'kadep' ? [] : null;
            console.error('API Error:', result?.error);
        }

    } catch (error) {
        console.error('Fetch error:', error);
        hasError.value = true;
    } finally {
        isLoading.value = false;
    }
};

const fetchPicCandidate = async () => {
    try {
        dataCandidate.value = [];
        const result = await getPicCandidate();
        dataCandidate.value = result.data;
    } catch (error) {
        console.error('Fetch error:', error);
    }
};

const fetchOrg = async () => {
    try {
        const result = await getOrg();
        // Ambil nama organisasi yang sudah ada di dataPic
        const existingOrgNames = dataPic.value.map(pic => pic.org);
        // Filter organisasi: id !== 0 (dsi) dan nama belum ada di dataPic
        dataOrganization.value = result.data.filter(
            org => org.id !== 0 && !existingOrgNames.includes(org.name)
        );
        allOrganization.value = result.data.filter(
            org => org.id !== 0
        );
    } catch (error) {
        console.error('Fetch error:', error);
    }
};

const submitPic = async () => {
    try {
        await useToastPromise(
            new Promise((resolve, reject) => {
                addPic({ id: selectedPic.value, org: selectedOrg.value })
                    .then((res) => {
                        // Reset selectedPic and selectedOrg after submission
                        selectedPic.value = null;
                        selectedOrg.value = null;
                        showAddModal.value = false;
                        setTimeout(() => location.reload(), 2000);
                        resolve(res);
                    })
                    .catch((err) => {
                        reject(err);
                    });
            }),
            {
                messages: {
                    success: "Berhasil menambahkan Penanggung Jawab!",
                    error: (err) => `Gagal menghapus data! <br> ${err}`
                },
                toastOptions: {
                    autoClose: 2000,
                    dangerouslyHTMLString: true
                }
            }
        );
    } catch (error) {
        console.error('Fetch error:', error);
    }
};

const transferRole = async () => {
    try {
        await useToastPromise(
            new Promise((resolve, reject) => {
                updatePic({ id: selectedPic.value })
                    .then((res) => {
                        // Reset selectedPic and selectedOrg after submission
                        selectedPic.value = null;
                        showChangePicModal.value = false;

                        // handle logout
                        logoutUser(getToken());
                        authStore.logout();
                        setTimeout(() => {
                            router.push('/')
                        }, 3000);
                        resolve(res);
                    })
                    .catch((err) => {
                        reject(err);
                    });
            }),
            {
                messages: {
                    success: "Berhasil memperbarui Penanggung Jawab!",
                    error: (err) => `Gagal memperbarui data! <br> ${err}`
                },
                toastOptions: {
                    autoClose: 3000,
                    dangerouslyHTMLString: true
                }
            }
        );
    } catch (error) {
        console.error('Fetch error:', error);
    }
};

const handleDetailClick = async (id) => {
    const response = await getPicDetail(id);
    selectedDataDetail.value = response.data;

    // ubah nilai
    if (response.data.gender == 'pria') {
        selectedDataDetail.value.gender = 'Laki-laki'
    } else if (response.data.gender == 'wanita') {
        selectedDataDetail.value.gender = 'Perempuan'
    }

    if (response.data.role == 'pj') {
        selectedDataDetail.value.role = 'Penanggung Jawab'
    }

    showDetailModal.value = true;
};

const closeDetailModal = () => {
    showDetailModal.value = false;
    selectedDataDetail.value = null;
};

const nextAddModalStep = () => {
    if (picModalStep.value === 1) {
        if (selectedOrg.value === undefined || selectedOrg.value === null) {
            toast('Pilih organisasi terlebih dahulu!', {
                type: "warning",
                autoClose: 3000
            });
            return;
        }
        picModalStep.value = 2;
    } else if (picModalStep.value === 2) {
        submitPic();
        showAddModal.value = false;
        picModalStep.value = 1;
    }
};

const showEditModal = ref(false);
const editData = ref({
    id: '', // default id, sesuaikan dengan data jika ada field id
    name: '', // default name, sesuaikan dengan data jika ada field name
    role: 'pj', // default role, sesuaikan dengan data jika ada field role
    org: '' // default org, sesuaikan dengan data jika ada field org_id
});

let foundToEdit = null;
const handleEditClick = (id) => {
    foundToEdit = dataPic.value.find(item => item.id === id);
    if (foundToEdit) {
        editData.value.id = foundToEdit.id;
        editData.value.name = foundToEdit.name;
        editData.value.org = allOrganization.value.find(org => org.name === foundToEdit.org)?.id || '';
    }
    showEditModal.value = true;
};

const isOrgChanged = computed(() => {
    if (!foundToEdit) return false;
    const originalOrgId = allOrganization.value.find(org => org.name === foundToEdit.org)?.id || '';
    return editData.value.org !== originalOrgId;
});

const closeEditModal = () => {
    showEditModal.value = false;
    Object.assign(editData.value, { id: '', name: '', org: '', role: 'pj' });
};

const submitEdit = async () => {
    try {
        await useToastPromise(
            new Promise(async (resolve, reject) => {
                try {
                    if (editData.value.role !== 'pj') {
                        await downgradeRole({
                            id: editData.value.id,
                            role: editData.value.role
                        });
                    } else if (editData.value.role === 'pj' && isOrgChanged.value) {
                        await changeOrganization({
                            id: editData.value.id,
                            org: editData.value.org
                        });
                    }
                    closeEditModal();
                    setTimeout(() => location.reload(), 1500);
                    resolve();
                } catch (err) {
                    reject(err);
                }
            }),
            {
                messages: {
                    success: "Berhasil memperbarui data Penanggung Jawab!",
                    error: (err) => `Gagal memperbarui data! <br> ${err}`
                },
                toastOptions: {
                    autoClose: 1500,
                    dangerouslyHTMLString: true
                }
            }
        );
    } catch (error) {
        console.error(error);
    }
};

const shouldShowEditButton = () => true;
const shouldShowDeleteButton = () => false;

onMounted(() => {
    fetchPicCandidate();
    fetchPic();
    if (authStore.userRole === 'kadep') {
        fetchOrg();
    }
})
</script>

<template>
    <PageTitle judul="Kelola Penanggung Jawab" class="mt-3 mb-7" />

    <template v-if="authStore.userRole === 'kadep'">
        <div class="container mx-auto p-8 lg:py-5 lg:px-16">
            <div class="flex justify-end mb-4">
                <AddDataButton btnLabel="Tambah PJ Baru" btn-title="Tambah penanggung jawab baru" @click="showAddModal = true" />
            </div>
            <div>
                <TableSkeleton v-if="isLoading" :columns="5" :rows="5" />
                <Error v-else-if="hasError" @click="fetchPic" />
                <EmptyState v-else-if="!hasError && dataPic.length === 0" title="Tidak ada data penanggung jawab!"
                    message="Belum ada data penanggung jawab yang tersedia atau anda belum terdaftar di organisasi yang ada."
                    @click="fetchPic" />
                <DataTable v-else
                    :data="dataPic"
                    :columns="[
                        { field: 'id_number', label: 'NIM/NIP', sortable: true, searchable: true },
                        { field: 'name', label: 'Nama', sortable: true, searchable: true },
                        { field: 'org', label: 'Organisasi', sortable: true, searchable: true },
                    ]"
                    :detail-column="true"
                    @click="handleDetailClick"
                    :edit-delete-column="true"
                    :show-edit-button="shouldShowEditButton"
                    :show-delete-button="shouldShowDeleteButton"
                    @edit="handleEditClick"
                />
            </div>
        </div>

        <div v-show="showAddModal" class="fixed inset-0 z-50 flex items-center justify-center w-full h-full">
            <div class="fixed inset-0 bg-gray-800 bg-opacity-30" @click="showAddModal = false"></div>

            <div class="relative w-full max-w-2xl max-h-full">
                <div class="relative bg-white rounded-lg shadow">
                    <div class="flex items-center justify-between p-4 md:p-5 border-b rounded-t">
                        <h3 class="text-xl font-medium text-gray-900">
                            Tambahkan Penanggung Jawab Baru
                        </h3>
                        <button type="button"
                            class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center"
                            @click="showAddModal = false">
                            <XMarkCloseIcon class="w-3 h-3" />
                            <span class="sr-only">Tutup</span>
                        </button>
                    </div>

                    <ol class="flex items-center w-full px-3 pt-2 space-x-2 text-sm font-medium text-center text-gray-500 sm:text-base sm:px-4 sm:space-x-4 justify-center">
                        <li class="flex items-center text-blue-600">
                            <span class="flex items-center justify-center w-5 h-5 me-2 text-xs border border-blue-600 rounded-full shrink-0">
                                1
                            </span>
                            Pilih Organisasi
                            <svg class="w-3 h-3 ms-2 sm:ms-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 12 10">
                                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m7 9 4-4-4-4M1 9l4-4-4-4" />
                            </svg>
                        </li>
                        <li class="flex items-center" :class="{ 'text-blue-600': picModalStep == 2 }">
                            <span :class="[
                                'flex items-center justify-center w-5 h-5 me-2 text-xs border rounded-full shrink-0', 
                                picModalStep == 2 ? 'border-blue-600' : 'border-gray-500'
                                ]">
                                2
                            </span>
                            Pilih PJ {{selectedOrg ? `${dataOrganization.find(org => org.id == selectedOrg)?.name}` : '' }}
                        </li>
                    </ol>

                    <div class="p-4 md:p-5 space-y-4">
                        <div v-show="picModalStep == 1">
                            <select required v-model="selectedOrg" v-if="dataOrganization"
                                class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5">
                                <option selected disabled value="">Pilih organisasi</option>
                                <option v-for="(item, index) in dataOrganization" :value="item?.id" :key="`org-${index}`">
                                    {{ item.name }}
                                </option>
                            </select>
                        </div>
                        <div v-show="picModalStep == 2">
                            <DataTable 
                                :data="dataCandidate" 
                                :columns="[
                                    { field: 'id_number', label: 'NIP', sortable: true, searchable: true },
                                    { field: 'name', label: 'Nama', sortable: true, searchable: true },
                                ]" 
                                :radio-column="[{ field: 'id', label: 'Pilih' }]" 
                                v-model="selectedPic"
                                value-field="id" 
                            />
                        </div>
                        <div class="flex justify-between items-center">
                            <button :disabled="picModalStep == 1" @click="picModalStep--"
                                class="text-white inline-flex items-center focus:ring-4 focus:outline-none font-medium rounded-lg text-sm px-5 py-2.5 text-center bg-blue-700 hover:bg-blue-800 focus:ring-blue-300 disabled:opacity-50 disabled:cursor-not-allowed">
                                Kembali
                            </button>
                            <button @click="nextAddModalStep" :disabled="!selectedOrg" :title="selectedOrg ? '' : 'Pilih organisasi terlebih dahulu'"
                                class="text-white inline-flex items-center focus:ring-4 focus:outline-none font-medium rounded-lg text-sm px-5 py-2.5 text-center bg-blue-700 hover:bg-blue-800 focus:ring-blue-300 disabled:opacity-50 disabled:cursor-not-allowed">
                                {{ picModalStep == 1 ? 'Lanjut' : 'Tambah' }}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div v-show="showEditModal" class="fixed inset-0 z-50 flex items-center justify-center w-full h-full">
            <div class="fixed inset-0 bg-gray-800 bg-opacity-30" @click="closeEditModal"></div>
            <div class="relative w-full max-w-lg max-h-full">
                <div class="relative bg-white rounded-lg shadow">
                    <div class="flex items-center justify-between p-4 md:p-5 border-b rounded-t">
                        <h3 class="text-xl font-medium text-gray-900">
                            Edit Penanggung Jawab
                        </h3>
                        <button type="button" @click="closeEditModal"
                            class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center">
                            <XMarkCloseIcon class="w-3 h-3" />
                            <span class="sr-only">Tutup</span>
                        </button>
                    </div>
                    <div class="p-4 md:p-5 space-y-4">
                        <div>
                            <label class="block mb-2 text-sm font-medium text-gray-900">Nama <span class="text-xs text-gray-400">(tidak dapat diubah)</span></label>
                            <input type="text" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5" :value="editData?.name" disabled>
                        </div>
                        <div>
                            <label class="block mb-2 text-sm font-medium text-gray-900">Role</label>
                            <select v-model="editData.role"
                                class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5">
                                <option value="pj">Penanggung Jawab</option>
                                <option value="penyusun">Penyusun</option>
                                <option value="sivitas-akademika">Civitas Akademika</option>
                            </select>
                        </div>
                        <div v-if="editData.role === 'pj'">
                            <label class="block mb-2 text-sm font-medium text-gray-900">Organisasi</label>
                            <select v-model="editData.org"
                                class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5">
                                <option disabled value="">Pilih organisasi</option>
                                <option v-for="org in allOrganization" :key="org.id" :value="org.id">
                                    {{ org.name }}
                                </option>
                            </select>
                        </div>
                        <div v-else class="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
                            <p class="text-yellow-700 font-semibold mb-2">Konfirmasi</p>
                            <p>Anda yakin ingin mengganti role user ini dari <b>Penanggung Jawab</b> menjadi <b>{{ roleAbbreviation[editData.role] }}</b>?</p>
                        </div>
                        <div class="flex justify-end gap-2 mt-4">
                            <button @click="closeEditModal"
                                class="py-2 px-4 bg-gray-200 rounded-lg hover:bg-gray-300 text-gray-700">Batal</button>
                            <button @click="submitEdit" :disabled="editData.role === 'pj' && (!editData.org || !isOrgChanged)"
                                class="py-2 px-4 bg-yellow-400 text-white rounded-lg hover:bg-yellow-500 disabled:opacity-70 disabled:cursor-not-allowed">
                                Perbarui
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div v-show="showDetailModal" class="fixed inset-0 z-50 flex items-center justify-center w-full h-full">
            <div class="fixed inset-0 bg-gray-800 bg-opacity-30" @click="closeDetailModal"></div>
            <div class="relative bg-white w-full max-w-2xl max-h-full rounded-lg shadow ">
                <div class="flex items-center justify-between p-4 md:p-5 border-b rounded-t">
                    <h3 class="text-xl font-medium text-gray-900">
                        Detail versi SOP
                    </h3>
                    <button type="button"
                        class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center"
                        @click="closeDetailModal">
                        <XMarkCloseIcon class="w-3 h-3" />
                        <span class="sr-only">Tutup modal</span>
                    </button>
                </div>
                <div class="p-4 md:p-5 space-y-4 max-h-[620px] overflow-y-auto">
                    <div class="grid gap-4 grid-cols-2" v-if="selectedDataDetail">
                        <div>
                            <label for="name" class="block mb-2 text-sm font-medium text-gray-900">Nama</label>
                            <input type="text" id="name"
                                class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                                v-model="selectedDataDetail.name" placeholder="belum ada data" readonly>
                        </div>
                        <div>
                            <label for="id-number" class="block mb-2 text-sm font-medium text-gray-900">NIM/NIP</label>
                            <input type="text" id="id-number"
                                class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                                v-model="selectedDataDetail.id_number" placeholder="belum ada data" readonly>
                        </div>
                        <div>
                            <label for="gender" class="block mb-2 text-sm font-medium text-gray-900">Jenis Kelamin</label>
                            <input type="text" id="gender"
                                class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                                v-model="selectedDataDetail.gender" placeholder="belum ada data" readonly>
                        </div>
                        <div>
                            <label for="role" class="block mb-2 text-sm font-medium text-gray-900">Role</label>
                            <input type="text" id="role"
                                class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                                v-model="selectedDataDetail.role" placeholder="belum ada data" readonly>
                        </div>
                        <div>
                            <label for="email" class="block mb-2 text-sm font-medium text-gray-900">Email</label>
                            <input type="text" id="email"
                                class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                                v-model="selectedDataDetail.email" placeholder="belum ada data" readonly>
                        </div>
                        <div>
                            <label for="org" class="block mb-2 text-sm font-medium text-gray-900">Organisasi</label>
                            <input type="text" id="org"
                                class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                                v-model="selectedDataDetail.org" placeholder="belum ada data" readonly>
                        </div>
                        <div class="col-span-2">
                            <label class="block mb-2 text-sm font-medium text-gray-900">Anggota tim</label>
                            <ul class="max-w-2xl space-y-1 list-disc list-inside">
                                <li v-if="selectedDataDetail.team_member.length > 0"
                                    v-for="(member, index) in selectedDataDetail.team_member" :key="index" class="text-sm">
                                    {{ member.id_number }} - {{ member.name }}
                                </li>
                                <p v-else class="italic text-gray-400 text-sm">belum ada data!</p>
                            </ul>
                        </div>
                        <div class="col-span-2">
                            <label class="block mb-2 text-sm font-medium text-gray-900">Sop yang dikelola</label>
                            <ul class="max-w-2xl space-y-1 list-disc list-inside">
                                <li v-if="selectedDataDetail.sop.length > 0" v-for="(s, index) in selectedDataDetail.sop" :key="index" class="text-sm">
                                    {{ s.number }} - {{ s.name }}
                                </li>
                                <p v-else class="italic text-gray-400 text-sm">belum ada data!</p>
                            </ul>
                        </div>
                    </div>
                    <p class="text-center" v-else>Belum ada data!</p>
                </div>
            </div>
        </div>
    </template>
    <template v-else-if="authStore.userRole === 'pj'">
        <div class="container mx-auto p-8 lg:py-5 lg:px-16 lg:col-span-2" v-if="dataPic">
            <h2 class="text-2xl font-bold text-gray-800 mb-6">PJ {{ dataPic.org }} saat ini:</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="space-y-2">
                    <label class="block text-sm font-medium text-gray-700">Nama</label>
                    <div class="flex items-center border border-gray-300 rounded-lg shadow-sm">
                        <input type="text" disabled v-model="dataPic.name"
                            class="w-full pl-3 py-2 border-none bg-transparent" />
                    </div>
                </div>
                <div class="space-y-2">
                    <label class="block text-sm font-medium text-gray-700">NIM/NIP</label>
                    <div class="flex items-center border border-gray-300 rounded-lg shadow-sm">
                        <input type="text" disabled v-model="dataPic.id_number"
                            class="w-full pl-3 py-2 border-none bg-transparent" />
                    </div>
                </div>
                <div class="space-y-2">
                    <label class="block text-sm font-medium text-gray-700">Email</label>
                    <input type="email" disabled v-model="dataPic.email"
                        class="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500" />
                </div>
                <div class="space-y-2">
                    <label class="block text-sm font-medium text-gray-700">Gender</label>
                    <div class="flex items-center border border-gray-300 rounded-lg shadow-sm">
                        <input type="text" disabled v-model="dataPic.gender"
                            class="w-full pl-3 py-2 border-none bg-transparent" />
                    </div>
                </div>
            </div>
            <div class="mt-10 flex justify-end">
                <button type="button" @click="showChangePicModal = true"
                    class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex">
                    Perbarui penanggung jawab?
                </button>
            </div>
        </div>

        <div v-show="showChangePicModal" class="fixed inset-0 z-50 flex items-center justify-center w-full h-full">
            <div class="fixed inset-0 bg-gray-800 bg-opacity-30" @click="showChangePicModal = false"></div>
            <div class="relative w-full max-w-2xl max-h-full">
                <div v-show="changePicStep == 1" class="relative bg-white rounded-lg shadow">
                    <div class="flex items-center justify-between p-4 md:p-5 border-b rounded-t">
                        <h3 class="text-xl font-medium text-gray-900">
                            Pilih user yang akan ditugaskan menjadi penanggung jawab
                        </h3>
                        <button type="button"
                            class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center"
                            @click="showChangePicModal = false">
                            <XMarkCloseIcon class="w-3 h-3" />
                            <span class="sr-only">Tutup</span>
                        </button>
                    </div>
                    <form @submit.prevent="changePicStep = 2">
                        <div class="p-4 md:p-5 space-y-4">
                            <DataTable 
                                :data="dataCandidate"
                                :columns="[
                                    { field: 'id_number', label: 'NIP', sortable: true, searchable: true },
                                    { field: 'name', label: 'Nama', sortable: true, searchable: true },
                                ]" 
                                :radio-column="[{ field: 'id', label: 'Pilih' }]" 
                                value-field="id"
                                v-model="selectedPic" 
                            />
                        </div>
                        <div class="flex justify-end p-4 md:p-5 space-x-3 rtl:space-x-reverse border-t border-gray-200 rounded-b">
                            <button type="submit" :disabled="!selectedPic"
                                class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center disabled:cursor-not-allowed disabled:bg-opacity-60">
                                Pilih
                            </button>
                        </div>
                    </form>
                </div>

                <div v-show="changePicStep == 2" class="relative bg-white rounded-lg shadow">
                    <button type="button" @click="showChangePicModal = false"
                        class="absolute top-3 right-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 inline-flex justify-center items-center">
                        <XMarkCloseIcon class="w-3 h-3" />
                        <span class="sr-only">Tutup modal</span>
                    </button>
                    <div class="p-4 md:p-5 text-center">
                        <ExclamationMarkIcon class="mx-auto mb-4 text-gray-400 w-12 h-12" />
                        <h3 class="mb-2 text-xl font-normal text-gray-800">
                            Anda yakin ingin mengganti penanggung jawab?
                        </h3>
                        <p class="text-gray-500 mb-1">
                            Role anda otomatis akan diubah menjadi penyusun di organisasi ini dan anda tidak bisa lagi
                            mengakses menu khusus penanggung jawab!
                        </p>
                        <p class="text-gray-600 mb-5">
                            <span class="text-red-600">*</span>
                            Anda akan diminta untuk login ulang!
                            <span class="text-red-600">*</span>
                        </p>
                        <button @click="transferRole"
                            class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm inline-flex items-center px-5 py-2.5 text-center">
                            Yakin
                        </button>
                        <button @click="showChangePicModal = false"
                            class="py-2.5 px-5 ms-3 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100">
                            Batal
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </template>

</template>
