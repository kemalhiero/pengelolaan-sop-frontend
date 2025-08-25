<script setup>
import { inject, onMounted, ref, computed } from 'vue';

import { getOrg } from '@/api/orgApi';
import { useAuthStore } from '@/stores/auth';
import roleAbbreviation from '@/data/roleAbbrv.json';
import useToastPromise from '@/utils/toastPromiseHandler';
import { addDrafter, changeOrganization, downgradeRole, getAllDrafter, getDrafterDetail, getUserByRole } from '@/api/userApi';

import Error from '@/components/Error.vue';
import DataTable from '@/components/DataTable.vue';
import EmptyState from '@/components/EmptyState.vue';
import TableSkeleton from '@/components/TableSkeleton.vue';
import XMarkCloseIcon from '@/assets/icons/XMarkCloseIcon.vue';
import AddDataButton from '@/components/modal/AddDataButton.vue';
import PageTitle from '@/components/authenticated/PageTitle.vue';

const layoutType = inject('layoutType');
layoutType.value = 'admin';

const dataDrafter = ref([]);
const dataCandidate = ref([]);
const showAddModal = ref(false);
const selectedDrafter = ref([]);
const isLoading = ref(true);
const hasError = ref(false);
const selectedDataDetail = ref(null);
const showDetailModal = ref(false);
const authStore = useAuthStore();
const allOrganization = ref([]);

const fetchDrafter = async () => {
    try {
        isLoading.value = true;
        hasError.value = false;
        dataDrafter.value = [];

        const result = await getAllDrafter();
        if (!result.success) {
            hasError.value = true;
            console.error('API Error:', result.error);
            return;
        }

        if (result?.data) {
            dataDrafter.value = result.data;
        }
    } catch (error) {
        console.error('Fetch error:', error);
        hasError.value = true;
    } finally {
        isLoading.value = false;
    }
};

const fetchDrafterCandidate = async () => {
    try {
        const result = await getUserByRole('sivitas-akademika');
        dataCandidate.value = result.data;
    } catch (error) {
        console.error('Fetch error:', error);
    }
};

const submitDrafter = async () => {
    try {
        await useToastPromise(
            new Promise(async (resolve, reject) => {
                try {
                    await Promise.all(
                        selectedDrafter.value.map(async (pic) => {
                            return await addDrafter({
                                id: pic.id
                            });
                        })
                    );
                    fetchDrafter();
                    fetchDrafterCandidate();
            
                    showAddModal.value = false;
                    resolve();
                } catch (err) {
                    reject(err);
                }
            }),
            {
                messages: {
                    success: "Berhasil menambahkan penyusun!",
                    error: (err) => `Gagal menambahkan penyusun! <br> ${err}`
                },
                toastOptions: {
                    autoClose: 1500,
                    dangerouslyHTMLString: true
                }
            }
        );
    } catch (error) {
        console.error('Fetch error:', error);
    }
};

const handleDetailClick = async (id) => {
    const response = await getDrafterDetail(id);
    selectedDataDetail.value =  response.data;

    // ubah nilai
    if (response.data.gender == 'pria') {
        selectedDataDetail.value.gender = 'Laki-laki'
    } else if (response.data.gender == 'wanita') {
        selectedDataDetail.value.gender = 'Perempuan'
    }

    if (response.data.role == 'penyusun') {
        selectedDataDetail.value.role = 'Penyusun'
    }
    showDetailModal.value = true;
};

const closeDetailModal = () => {
    showDetailModal.value = false;
    selectedDataDetail.value = null;
};

const fetchOrg = async () => {
    try {
        const result = await getOrg();
        allOrganization.value = result.data;
    } catch (error) {
        console.error('Fetch error:', error);
    }
};

const shouldShowEditButton = () => true;
const shouldShowDeleteButton = () => false;

const showEditModal = ref(false);
const editData = ref({
    id: null, // default id, sesuaikan dengan data jika ada field id
    name: null, // default name, sesuaikan dengan data jika ada field name
    role: 'penyusun', // default role, sesuaikan dengan data jika ada field role
    org: null // default org, sesuaikan dengan data jika ada field org_id
});

const foundToEdit = ref({});
const handleEditClick = (id) => {
    foundToEdit.value = dataDrafter.value.find(item => item.id === id);
    if (foundToEdit.value) {
        editData.value.id = foundToEdit.value.id;
        editData.value.name = foundToEdit.value.name;
        const orgId = allOrganization.value.find(org => org.name === foundToEdit.value.org)?.id;
        editData.value.org = (orgId === null || orgId === undefined) ? '' : orgId;
    }
    showEditModal.value = true;
};

const isOrgChanged = computed(() => {
    if (!foundToEdit.value) return false;
    const originalOrgId = allOrganization.value.find(org => org.name === foundToEdit.value.org)?.id;
    return editData.value.org != originalOrgId;
});

const closeEditModal = () => {
    showEditModal.value = false;
    Object.assign(editData.value, { id: null, name: null, org: null, role: 'penyusun' });
};

const submitEdit = async () => {
    try {
        await useToastPromise(
            new Promise(async (resolve, reject) => {
                try {
                    if (editData.value.role !== 'penyusun') {
                        await downgradeRole({
                            id: editData.value.id,
                            role: editData.value.role
                        });
                    } else if (editData.value.role === 'penyusun' && isOrgChanged.value) {
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
                    success: "Berhasil memperbarui data Penyusun!",
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

onMounted(() => {
    fetchDrafter();
    fetchDrafterCandidate();
    if (authStore.userRole === 'kadep') {
        fetchOrg();
    }
})
</script>

<template>
    <PageTitle judul="Kelola Penyusun POS" class="mt-3 mb-7" />

    <div class="container mx-auto p-8 lg:px-16">
        <div class="flex justify-end mb-4">
            <AddDataButton btnLabel="Tambah Penyusun Baru" btn-title="Tambah penyusun sop baru" @click="showAddModal = true" />
        </div>
        <div>
            <TableSkeleton v-if="isLoading" :columns="5" :rows="5" />
            <Error v-else-if="hasError" @click="fetchDrafter" />
            <EmptyState v-else-if="!hasError && dataDrafter.length === 0" title="Tidak ada data penyusun!"
                message="Belum ada data penyusun yang tersedia saat ini" @click="fetchDrafter" />
            <DataTable v-else 
                :data="dataDrafter" 
                :columns="[
                    { field: 'id_number', label: 'NIM/NIP', sortable: true, searchable: true },
                    { field: 'name', label: 'Nama', sortable: true, searchable: true },
                    { field: 'org', label: 'Organisasi', sortable: true, searchable: true },
                ]" 
                :status-columns="[
                    { field: 'status', label: 'Status' }
                ]" 
                :badge-text="['Belum ada tugas', 'Sudah memiliki tugas']" 
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
                        Centang user yang akan ditugaskan menjadi penyusun
                    </h3>
                    <button type="button" @click="showAddModal = false"
                        class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center">
                        <XMarkCloseIcon class="w-3 h-3" />
                        <span class="sr-only">Tutup</span>
                    </button>
                </div>
                <form @submit.prevent="submitDrafter">
                    <div class="p-4 md:p-5 space-y-4">
                        <DataTable 
                            :data="dataCandidate" 
                            :columns="[
                                { field: 'id_number', label: 'NIP', sortable: true, searchable: true },
                                { field: 'name', label: 'Nama', sortable: true, searchable: true },
                            ]" 
                            :check-column="true" 
                            v-model="selectedDrafter" 
                        />
                    </div>
                    <div class="flex items-center p-4 md:p-5 space-x-3 rtl:space-x-reverse border-t border-gray-200 rounded-b">
                        <button type="submit" :disabled="selectedDrafter.length == 0"
                            class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center disabled:cursor-not-allowed disabled:bg-opacity-60">
                            Pilih
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>

    <div v-show="showEditModal" class="fixed inset-0 z-50 flex items-center justify-center w-full h-full">
        <div class="fixed inset-0 bg-gray-800 bg-opacity-30" @click="closeEditModal"></div>
        <div class="relative w-full max-w-lg max-h-full">
            <div class="relative bg-white rounded-lg shadow">
                <div class="flex items-center justify-between p-4 md:p-5 border-b rounded-t">
                    <h3 class="text-xl font-medium text-gray-900">
                        Edit Penyusun
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
                            <option value="penyusun">Penyusun</option>
                            <option value="sivitas-akademika">Civitas Akademika</option>
                        </select>
                    </div>
                    <div v-if="editData.role === 'penyusun' && authStore.userRole === 'kadep'">
                        <label class="block mb-2 text-sm font-medium text-gray-900">Organisasi</label>
                        <select v-model="editData.org"
                            class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5">
                            <option disabled value="">Pilih organisasi</option>
                            <option v-for="org in allOrganization" :key="org.id" :value="org.id">
                                {{ org.name }}
                            </option>
                        </select>
                    </div>
                    <div v-else-if="editData.role !== 'penyusun'" class="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
                        <p class="text-yellow-700 font-semibold mb-2">Konfirmasi</p>
                        <p>Anda yakin ingin mengganti role user ini dari <b>Penanggung Jawab</b> menjadi <b>{{ roleAbbreviation[editData.role] }}</b>?</p>
                    </div>
                    <div class="flex justify-end gap-2 mt-4">
                        <button @click="closeEditModal"
                            class="py-2 px-4 bg-gray-200 rounded-lg hover:bg-gray-300 text-gray-700">Batal</button>
                        <button
                            @click="submitEdit"
                            :disabled="authStore.userRole === 'kadep'
                                ? (editData.role === 'penyusun' && !isOrgChanged)
                                : (editData.role === 'penyusun')"
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
        <div class="relative w-full max-w-2xl max-h-full">
            <div class="relative bg-white rounded-lg shadow">
                <div class="flex items-center justify-between p-4 md:p-5 border-b rounded-t">
                    <h3 class="text-xl font-medium text-gray-900">Detail versi POS</h3>
                    <button type="button" @click="closeDetailModal"
                        class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center">
                        <XMarkCloseIcon class="w-3 h-3" />
                        <span class="sr-only">Tutup modal</span>
                    </button>
                </div>
                <div class="p-4 md:p-5 space-y-4 max-h-[620px] overflow-y-auto">
                    <div class="grid gap-4 grid-cols-2" v-if="selectedDataDetail">
                        <div>
                            <label for="name" class="block mb-2 text-sm font-medium text-gray-900">Nama</label>
                            <input type="text" id="name" v-model="selectedDataDetail.name" placeholder="belum ada data" readonly
                                class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5">
                        </div>
                        <div>
                            <label for="id-number" class="block mb-2 text-sm font-medium text-gray-900">NIM/NIP</label>
                            <input type="text" id="id-number" v-model="selectedDataDetail.id_number" placeholder="belum ada data" readonly
                                class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5">
                        </div>
                        <div>
                            <label for="gender" class="block mb-2 text-sm font-medium text-gray-900">Jenis Kelamin</label>
                            <input type="text" id="gender" v-model="selectedDataDetail.gender" placeholder="belum ada data" readonly
                                class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5">
                        </div>
                        <div>
                            <label for="role" class="block mb-2 text-sm font-medium text-gray-900">Role</label>
                            <input type="text" id="role" v-model="selectedDataDetail.role" placeholder="belum ada data" readonly
                                class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5">
                        </div>
                        <div>
                            <label for="email" class="block mb-2 text-sm font-medium text-gray-900">Email</label>
                            <input type="text" id="email" v-model="selectedDataDetail.email" placeholder="belum ada data" readonly
                                class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5">
                        </div>
                        <div>
                            <label for="org" class="block mb-2 text-sm font-medium text-gray-900">Organisasi</label>
                            <input type="text" id="org" v-model="selectedDataDetail.org" placeholder="belum ada data" readonly
                                class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5">
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
    </div>
</template>
