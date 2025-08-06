<script setup>
import { toast } from 'vue3-toastify';
import { inject, onMounted, ref } from 'vue';
import { getOrg, createOrg, updateOrg, deleteOrg } from '@/api/orgApi';
import useToastPromise from '@/utils/toastPromiseHandler';

import DeleteDataModal from '@/components/modal/DeleteDataModal.vue';
import WarningText from '@/components/validation/WarningText.vue';
import PenToSquareIcon from '@/assets/icons/PenToSquareIcon.vue';
import PageTitle from '@/components/authenticated/PageTitle.vue';
import AddDataButton from '@/components/modal/AddDataButton.vue';
import XMarkCloseIcon from '@/assets/icons/XMarkCloseIcon.vue';
import TrashCanIcon from '@/assets/icons/TrashCanIcon.vue';
import Error from '@/components/Error.vue';
import TableSkeleton from '@/components/TableSkeleton.vue';
import EmptyState from '@/components/EmptyState.vue';

const layoutType = inject('layoutType');
layoutType.value = 'admin';

const data = ref([]);
const defaultFormState = {
    name: '',
    about: '',
};
const form = ref({ ...defaultFormState });
const modalHeaderText = ref('');
const modalType = ref('');
const showModalDelete = ref(false);
const selectedDeleteId = ref(null);
const showModal = ref(false);
const showModalEditDepartment = ref(false);
const selectedUpdateId = ref(null);
const defaultWarningTextState = {
    name: false,
};
const showWarningText = ref({...defaultWarningTextState});
let dataYangDitemukan;
const isLoading = ref(true);
const hasError = ref(false);

// Fungsi untuk mereset form ke nilai default
const resetForm = () => {
    form.value = { ...defaultFormState };
};

const fetchDataOrg = async () => {
    try {
        isLoading.value = true;
        hasError.value = false;
        data.value = [];

        const result = await getOrg();
        if (!result.success) {
            hasError.value = true;
            console.error('API Error:', result.error);
            return;
        }
        if (result?.data) {
            data.value = result.data;
        }
    } catch (error) {
        console.error('Error fetching items:', error);
        hasError.value = true;
    } finally {
        isLoading.value = false;
    }
};

const openAddModal = () => {
    resetForm(); // Reset form sebelum membuka modal
    modalHeaderText.value = 'Tambahkan organisasi baru';
    modalType.value = 'add';
    showWarningText.value.name = false
    showModal.value = true;
};

const closeModal = () => {
    resetForm();
    showModal.value = false;
    modalHeaderText.value = '';
    selectedUpdateId.value = null;
    showWarningText.value = { ...defaultWarningTextState };
};

function isOrgNameDuplicate(name, exceptId = null) {
    const found = data.value.some(
        item =>
            item.name.trim().toLowerCase() === name.trim().toLowerCase() &&
            (exceptId === null || item.id !== exceptId)
    );
    if (found) {
        toast.warning('Nama organisasi sudah ada, tidak boleh sama!', {
            autoClose: 5000
        });
        return true;
    }
    return false;
}

const addData = async () => {
    if (isOrgNameDuplicate(form.value.name)) return; // Cek duplikasi nama organisasi

    try {
        await useToastPromise(
            () => new Promise(async (resolve, reject) => {
                try {
                    const newItem = {
                        name: form.value.name,
                        about: form.value.about,
                    };
                    await createOrg(newItem);
                    resetForm();
                    showModal.value = false;
                    fetchDataOrg(); // refresh item list
                    resolve();
                } catch (error) {
                    reject(error);
                }
            }),
            {
                messages: { success: "Organisasi berhasil ditambahkan!" },
                toastOptions: { autoClose: 3000 }
            }
        );
    } catch (error) {
        console.error('Error adding item:', error);
    }
};

// hapus data
const openDeleteModal = (id) => {
    selectedDeleteId.value = id; // Menyimpan ID yang dipilih
    showModalDelete.value = true; // Tampilkan modal
};

const closeDeleteModal = () => {
    showModalDelete.value = false; // Sembunyikan modal
    selectedDeleteId.value = null; // Reset ID setelah modal ditutup
};

const deleteData = async (id) => {  // Fungsi untuk menghapus data berdasarkan ID
    try {
        const response = await deleteOrg(id);
        console.log(response);

        // Lakukan penghapusan item dari array data
        data.value = data.value.filter(item => item.id !== id);
        closeDeleteModal(); // Tutup modal setelah penghapusan

        toast("Data berhasil dihapus!", {
            type: "success",
            autoClose: 3000,
        });

        console.log(`Data dengan ID ${id} berhasil dihapus`);
    } catch (error) {
        console.error('Delete error:', error);
    }
};

// Update fungsi openUpdateModal
const openUpdateModal = (id) => {
    resetForm();
    selectedUpdateId.value = id;
    modalHeaderText.value = 'Perbarui data organisasi';
    modalType.value = 'edit';
    showModal.value = true;

    dataYangDitemukan = data.value.find(item => item.id === id);
    if (dataYangDitemukan) {
        form.value = {
            pic: dataYangDitemukan.pic,
            name: dataYangDitemukan.name,
            about: dataYangDitemukan.about,
        };
    } else {
        console.log("Data tidak ditemukan");
    }
};

const updateData = async () => {
    if (isOrgNameDuplicate(form.value.name, selectedUpdateId.value)) return; // Cek duplikasi nama organisasi

    try {
        await useToastPromise(
            () => new Promise(async (resolve, reject) => {
                try {
                    const newItem = {
                        name: form.value.name,
                        about: form.value.about,
                    };
                    await updateOrg(selectedUpdateId.value, newItem);
                    showModal.value = false;
                    showModalEditDepartment.value = false;
                    fetchDataOrg();
                    resolve();
                } catch (error) {
                    reject(error);
                }
            }),
            {
                messages: { success: "Data organisasi berhasil diperbarui!" },
                toastOptions: { autoClose: 3000 }
            }
        );
    } catch (error) {
        console.error('Update error:', error);
    }
};

onMounted(() => {
    fetchDataOrg();
});
</script>

<template>
    <PageTitle judul="Daftar Organisasi yang Dikelola" class="mt-3 mb-7" />

    <div class="container mx-auto p-8 lg:px-16">
        <div class="flex justify-end mb-4">
            <AddDataButton btnLabel="Input Organisasi Baru" @click="openAddModal" />
        </div>

        <div>
            <TableSkeleton 
                v-if="isLoading"
                :columns="4"
                :rows="4"
            />
            <Error v-else-if="hasError" @click="fetchDataOrg" />
            <EmptyState 
                v-else-if="!hasError && data.length === 0"
                title="Tidak ada data organisasi!"
                message="Belum ada data organisasi yang tersedia saat ini"
                @click="fetchDataOrg"
            />
            <div v-else class="relative overflow-x-auto shadow-md sm:rounded-lg">
                <table class="w-full text-sm text-left text-gray-500">
                    <thead class="text-xs text-gray-900 uppercase bg-gray-50">
                        <tr>
                            <th scope="col" class="px-6 py-3">
                                Nama
                            </th>
                            <th scope="col" class="px-6 py-3">
                                Penanggung Jawab
                            </th>
                            <th scope="col" class="px-6 py-3">
                                Jumlah SOP
                            </th>
                            <th scope="col" class="px-6 py-3">
                                Keterangan
                            </th>
                            <th scope="col" class="px-6 py-3">
                                <span class="sr-only">Edit</span>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(item, index) in data" :key="index" class="bg-white border-b">
                            <th scope="row" class="px-6 py-4 font-medium text-gray-900">
                                {{ item.name }}
                            </th>
                            <td class="px-6 py-4">
                                <p>{{ item.pic && item.pic.name ? item.pic.name : '-' }}</p>
                            </td>
                            <td class="px-6 py-4">
                                {{ item.total_sop }}
                            </td>
                            <td class="px-6 py-4">
                                {{ item.about }}
                            </td>
                            <td class="px-6 py-4 flex justify-evenly">
                                <button :title="`Edit organisasi ${item.name}`" @click="openUpdateModal(item.id)"
                                    class="px-3 py-2 h-9 mx-2 text-white bg-yellow-400 rounded-lg hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:ring-opacity-50 inline-flex">
                                    <PenToSquareIcon class="fill-current w-4" />
                                </button>
                                <button :title="`Hapus data ${item.name}`" @click="openDeleteModal(item.id)" v-if="item.id != 0 && item.total_sop == 0"
                                    class="px-3 py-2 h-9 mx-2 text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 inline-flex">
                                    <TrashCanIcon class="fill-current w-4" />
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>

    <DeleteDataModal 
        :showModal="showModalDelete"
        :deleteData="deleteData" 
        :selectedId="selectedDeleteId"
        @update:showModal="showModalDelete = $event" 
    />

    <!-- TAMBAH/EDIT DATA ORGANISASI -->
    <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center w-full h-full">
        <div class="fixed inset-0 bg-gray-800 bg-opacity-30" @click="closeModal"></div>
        <div class="relative p-4 max-w-2xl max-h-full z-10">
            <div class="relative bg-white rounded-lg shadow">
                <div class="flex items-center justify-between p-4 md:p-5 border-b rounded-t">
                    <h3 class="text-lg font-semibold text-gray-900">
                        {{ modalHeaderText }}
                    </h3>
                    <button
                        class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center"
                        type="button" @click="closeModal">
                        <XMarkCloseIcon class="w-3 h-3" />
                        <span class="sr-only">Tutup modal</span>
                    </button>
                </div>
                <div class="p-4 md:p-5">
                    <div class="mb-4 min-w-96">
                        <div>
                            <label for="name" class="block mb-2 text-sm font-medium text-gray-900">
                                Nama<span class="text-red-600">*</span>
                            </label>
                            <input type="text" 
                                id="name" 
                                v-model="form.name"
                                class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                                placeholder="Mis. Laboratorium Aplikasi Perusahaan" required minlength="5"
                                maxlength="100">
                            <WarningText v-if="showWarningText.name" text="Harap isi data nama terlebih dahulu!" />
                        </div>
                        <div>
                            <label for="about" class="block mb-2 text-sm font-medium text-gray-900">Keterangan</label>
                            <textarea id="about" rows="4" v-model="form.about"
                                class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                                placeholder="ketikkan keterangan tambahan mengenai organisasi"></textarea>
                        </div>
                    </div>
                    <div class="flex justify-end">
                        <button
                            v-if="modalType == 'add' || modalType == 'edit'"
                            @click="modalType == 'add' ? addData() : updateData()"
                            type="button"
                            :class="[
                                'text-white inline-flex items-center focus:ring-4 focus:outline-none font-medium rounded-lg text-sm px-5 py-2.5 text-center',
                                modalType == 'add'
                                    ? 'bg-blue-700 hover:bg-blue-800 focus:ring-blue-300'
                                    : 'bg-yellow-400 hover:bg-yellow-500 focus:ring-yellow-300'
                            ]"
                        >
                            {{ modalType == 'add' ? 'Tambahkan' : 'Perbarui' }}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
