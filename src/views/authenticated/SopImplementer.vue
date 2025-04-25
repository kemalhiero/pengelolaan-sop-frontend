<script setup>
import { inject, onMounted, ref } from 'vue';
import { toast } from 'vue3-toastify';

import { addImplementer, deleteImplementer, getImplementer, updateImplementer } from '@/api/implementerApi';

import DeleteDataModal from '@/components/modal/DeleteDataModal.vue';
import EditDataModal from '@/components/modal/EditDataModal.vue';
import PageTitle from '@/components/authenticated/PageTitle.vue';
import AddDataModal from '@/components/modal/AddDataModal.vue';
import TableSkeleton from '@/components/TableSkeleton.vue';
import EmptyState from '@/components/EmptyState.vue';
import Error from '@/components/Error.vue';

import TrashCanIcon from '@/assets/icons/TrashCanIcon.vue';
import PenToSquareIcon from '@/assets/icons/PenToSquareIcon.vue';
import AddDataButton from '@/components/modal/AddDataButton.vue';

const layoutType = inject('layoutType');
layoutType.value = 'admin';

const data = ref([]);
const defaultFormState = {
    name: '',
    description: ''
};
const form = ref({...defaultFormState});
const resetForm = () => {
    form.value = { ...defaultFormState };
};
const isLoading = ref(true);
const hasError = ref(false);

// Fungsi untuk fetch data dari API
const fetchData = async () => {
    try {
        isLoading.value = true;
        hasError.value = false;
        data.value = [];

        const result = await getImplementer();
        if (!result.success) {
            hasError.value = true;
            console.error('API Error:', result.error);
            return;
        }

        if (result?.data) {
            data.value = result.data; // Menyimpan data yang di-fetch
        }
    } catch (error) {
        console.error('Fetch error:', error);
        hasError.value = true
    } finally {
        isLoading.value = false;
    }
};

// tampil modal tambah data
const showAddModal = ref(false);
const openAddModal = () => {
    resetForm(); // Reset form sebelum membuka modal
    showAddModal.value = true;
};

// Fungsi untuk mengirim data ke API dengan metode POST
const submitData = async () => {
    try {
        await addImplementer(form.value);
        resetForm();

        showAddModal.value = false;
        fetchData();

        toast("Data berhasil ditambahkan!", {
            type: "success",
            autoClose: 3000,
        });

    } catch (error) {
        console.error('Error saat mengirim data:', error);
        toast(`Data gagal ditambahkan! <br> ${error} `, {
            type: "error",
            autoClose: 5000,
            dangerouslyHTMLString: true
        });
    }
};

// Hapus data
const showModalDelete = ref(false);
const selectedDeleteId = ref(null);

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
        console.log(id)
        const response = await deleteImplementer(id);
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
        toast(`Data gagal dihapus! <br> ${error} `, {
            type: "error",
            autoClose: 5000,
            dangerouslyHTMLString: true
        });
    }
};

// Fungsi untuk memperbarui data
const showModalUpdate = ref(false);
const selectedUpdateId = ref(null);
let dataYangDitemukan;

const openUpdateModal = (id) => {
    selectedUpdateId.value = id; // Menyimpan ID yang dipilih
    showModalUpdate.value = true; // Tampilkan modal

    dataYangDitemukan = data.value.find(item => item.id === id);
    form.value = { ...dataYangDitemukan };

    if (dataYangDitemukan) {
        console.log(dataYangDitemukan);
    } else {
        console.log("Data tidak ditemukan");
    }
};

const closeUpdateModal = () => {
    showModalUpdate.value = false; // Sembunyikan modal
    selectedUpdateId.value = null; // Reset ID setelah modal ditutup
    resetForm();
};

const updateData = async (id) => {  // Fungsi untuk menghapus data berdasarkan ID
    try {
        const response = await updateImplementer(id, form.value);
        console.log(response);
        console.log(`Data dengan ID ${id} berhasil diperbarui`);

        fetchData();
        closeUpdateModal(); // Tutup modal setelah penghapusan
        toast("Data berhasil diperbarui!", {
            type: "success",
            autoClose: 3000,
        });

    } catch (error) {
        console.error('Update error:', error);
        toast(`Data gagal diperbarui! <br> ${error} `, {
            type: "error",
            autoClose: 5000,
            dangerouslyHTMLString: true
        });
    }
};

// ---------------------------------
onMounted(() => {
    fetchData();
});

</script>

<template>
    <PageTitle judul="Daftar Pelaksana SOP" class="mt-3 mb-7" />

    <div class="container mx-auto p-8 lg:px-16">

        <!-- modal tambah tipe aturan -->
        <div class="flex justify-end mb-4">
            <AddDataButton btnLabel="Input Pelaksana SOP Baru" @click="openAddModal" />
        </div>

        <!-- Komponen AddDataModal -->
        <AddDataModal
            modalTitle="Tambahkan pelaksana baru" 
            :showModal="showAddModal" 
            :formFields="[
                { id: 'name', label: 'Nama', type: 'text', placeholder: 'Mis. Fakultas', required: true, minlength: 5, maxlength: 100 },
                { id: 'description', label: 'Deskripsi', type: 'textarea', placeholder: 'ketikkan deskripsi disini...' }
            ]" 
            :formData="form" 
            :submitData="submitData" 
            @update:showModal="(val) => {
                showAddModal = val;
                if (!val) resetForm();
            }" 
        />

        <div>
            <TableSkeleton 
                v-if="isLoading"
                :columns="4"
                :rows="5"
            />
            <Error v-else-if="hasError" @click="fetchData" />
            <EmptyState 
                v-else-if="!hasError && data.length === 0"
                title="Tidak ada data pelaksana SOP!"
                message="Belum ada data pelaksana SOP yang tersedia saat ini"
                @click="fetchData"
            />
            <div v-else class="relative overflow-x-auto shadow-md sm:rounded-lg">
                <table class="w-full text-sm text-left text-gray-500">
                    <thead class="text-xs text-gray-900 uppercase bg-gray-50">
                        <tr>
                            <th scope="col" class="px-6 py-3">
                                No.
                            </th>
                            <th scope="col" class="px-6 py-3">
                                Nama
                            </th>
                            <th scope="col" class="px-6 py-3">
                                Deskripsi
                            </th>
                            <th scope="col" class="px-6 py-3" title="Jumlah SOP yang memiliki pelaksana berikut">
                                Jumlah SOP
                            </th>
                            <th scope="col" class="px-6 py-3">
                                <span class="sr-only">Edit</span>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(item, index) in data" :key="index" class="bg-white border-b">
                            <th scope="row" class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                                {{ index + 1 }}
                            </th>
                            <td class="px-6 py-4 text-black font-semibold">
                                {{ item.name }}
                            </td>
                            <td class="px-6 py-4 text-black">
                                {{ item.description }}
                            </td>
                            <td class="px-6 py-4 text-black">
                                {{ item.sop_total }}
                            </td>
                            <td class="px-6 py-4 flex justify-center">
                                <button :title="`Edit item ${index + 1}`" @click="openUpdateModal(item.id)"
                                    class="px-3 py-2 h-9 mx-2 text-white bg-yellow-400 rounded-lg hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:ring-opacity-50 inline-flex">
                                    <PenToSquareIcon class="fill-current w-4" />
                                </button>
                                <button v-if="item.sop_total == 0" :title="`Hapus item ${index + 1}`" @click="openDeleteModal(item.id)"
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

    <!-- Komponen DeleteDataModal -->
    <DeleteDataModal 
        :showModal="showModalDelete" 
        :deleteData="deleteData" 
        :selectedId="selectedDeleteId"
        @update:showModal="showModalDelete = $event" 
    />

    <!-- Komponen EditDataModal -->
    <EditDataModal 
        modalTitle="Perbarui jenis peraturan" 
        :showModal="showModalUpdate" 
        :formFields="[
            { id: 'name', label: 'Nama', type: 'text', colSpan: 'full', placeholder: 'Mis. Fakultas', required: true },
            { id: 'description', label: 'Deskripsi', type: 'textarea', colSpan: 'full', placeholder: 'ketikkan deskripsi disini...' }
        ]" 
        :formData="form" 
        :updateData="updateData" 
        :selectedId="selectedUpdateId"
        @update:showModal="showModalUpdate = $event" 
    />
</template>
