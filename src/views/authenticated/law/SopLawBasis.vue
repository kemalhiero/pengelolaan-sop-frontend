<script setup>
import { inject, onMounted, ref } from "vue";
import useToastPromise from "@/utils/toastPromiseHandler";
import { getLawType } from "@/api/lawTypeApi";
import { getLawBasis, createLawBasis, updateLawBasis, deleteLawBasis } from "@/api/lawBasisApi";

import DataTable from "@/components/DataTable.vue";
import DeleteDataModal from "@/components/modal/DeleteDataModal.vue";
import EditDataModal from "@/components/modal/EditDataModal.vue";
import AddDataModal from "@/components/modal/AddDataModal.vue";
import PageTitle from "@/components/authenticated/PageTitle.vue";
import AddDataButton from "@/components/modal/AddDataButton.vue";
import TableSkeleton from "@/components/TableSkeleton.vue";
import EmptyState from "@/components/EmptyState.vue";
import Error from "@/components/Error.vue";

const layoutType = inject('layoutType');
layoutType.value = 'admin';

const tipePeraturan = ref([]);
const data = ref([]);
const defaultFormState = {
    id_law_type: '',
    number: null,
    year: null,
    about: ''
};
const form = ref({ ...defaultFormState });
const isLoading = ref(true);
const hasError = ref(false);

const resetForm = () => {
    form.value = { ...defaultFormState };
};

// Fetch data untuk tabel
const fetchTipePeraturan = async () => {
    try {
        const result = await getLawType();
        tipePeraturan.value = result.data; // Menyimpan data yang di-fetch
    } catch (error) {
        console.error('Fetch error:', error);
    }
};

const fetchData = async () => {
    try {
        isLoading.value = true;
        hasError.value = false;
        data.value = [];

        const response = await getLawBasis();
        if (!response.success) {
            hasError.value = true;
            console.error('API Error:', response.error);
            return;
        }

        if (response?.data) {
            data.value = response.data;
        }
    } catch (error) {
        console.error('Fetch error:', error);
        hasError.value = true;
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

// submit data
const submitData = async () => {
    try {
        await useToastPromise(
            new Promise((resolve, reject) => {
                createLawBasis(form.value)
                    .then(() => {
                        resetForm();
                        showAddModal.value = false;
                        fetchData();
                        resolve();
                    })
                    .catch((err) => {
                        console.error('Error saat mengirim data:', err);
                        reject(err);
                    });
            }),
            {
                messages: {
                    pending: "Menyimpan data...",
                    success: "Data berhasil disimpan!",
                    error: (err) => `Gagal menyimpan data! <br> ${err}`
                },
                toastOptions: { 
                    autoClose: 3000, 
                    dangerouslyHTMLString: true 
                }
            }
        );
    } catch (error) {
        console.error('Error saat mengirim data:', error);
    }
};

// Hapus data
const showModalDelete = ref(false);
const selectedDeleteId = ref(null);

const openDeleteModal = (id) => {
    console.log('id delete', id);
    selectedDeleteId.value = id; // Menyimpan ID yang dipilih
    showModalDelete.value = true; // Tampilkan modal
};

const closeDeleteModal = () => {
    showModalDelete.value = false; // Sembunyikan modal
    selectedDeleteId.value = null; // Reset ID setelah modal ditutup
};

const deleteData = async (id) => {  // Fungsi untuk menghapus data berdasarkan ID
    try {
        await useToastPromise(
            new Promise((resolve, reject) => {
                deleteLawBasis(id)
                    .then((res) => {
                        // Lakukan penghapusan item dari array data
                        data.value = data.value.filter(item => item.id !== id);
                        closeDeleteModal();
                        console.log(`Data dengan ID ${id} berhasil dihapus`);
                        resolve(res);
                    })
                    .catch((err) => {
                        reject(err);
                    });
            }),
            {
                messages: {
                    pending: "Menghapus data...",
                    success: "Data berhasil dihapus!",
                    error: (err) => `Gagal menghapus data! <br> ${err}`
                },
                toastOptions: { 
                    autoClose: 3000, 
                    dangerouslyHTMLString: true 
                }
            }
        );
    } catch (error) {
        console.error('Delete error:', error);
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
        await useToastPromise(
            updateLawBasis(id, form.value)
                .then(() => {
                    fetchData();
                    closeUpdateModal();
                }),
            {
                messages: {
                    pending: "Memperbarui data...",
                    success: "Data berhasil diperbarui!",
                    error: (err) => `Gagal memperbarui data! <br> ${err}`
                },
                toastOptions: { 
                    autoClose: 3000, 
                    dangerouslyHTMLString: true 
                }
            }
        );
    } catch (error) {
        console.error('Update error:', error);
    }
};

// Fungsi untuk menampilkan tombol hapus
const shouldShowDeleteButton = (item) => {
  return item.sop_total == 0;
};

onMounted(() => {
    fetchTipePeraturan();
    fetchData(); // Ambil data tabel
});
</script>

<template>
    <PageTitle judul="Daftar Peraturan yang Digunakan" class="mt-3 mb-7" />

    <div class="container mx-auto p-8 lg:px-16">

        <div class="flex justify-end mb-4">
            <AddDataButton btnLabel="Input Peraturan Baru" @click="openAddModal" />
        </div>

        <AddDataModal 
            modalTitle="Tambahkan peraturan baru" 
            :showModal="showAddModal" 
            :formFields="[
                {
                    id: 'id_law_type',
                    label: 'Jenis Peraturan',
                    type: 'select',
                    placeholder: 'Pilih jenis peraturan',
                    required: true,
                    options: tipePeraturan,
                    optionValue: 'id',
                    optionLabel: 'law_type'
                },
                { id: 'number', label: 'Nomor', type: 'number', isColSpanHalf: true, placeholder: 'Mis. 95', required: true, min: 1, max: 999 },
                { id: 'year', label: 'Tahun', type: 'number', isColSpanHalf: true, placeholder: 'Mis. 2022', required: true, min: 1945, max: new Date().getFullYear() },
                { id: 'about', label: 'Pembahasan', type: 'textarea', placeholder: 'Misal: Organisasi dan Tata Kerja Organ Pengelola Universitas Andalas', required: true }
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
                :columns="7"
                :rows="4"
            />
            <Error v-else-if="hasError" @click="fetchData" />
            <EmptyState 
                v-else-if="!hasError && data.length === 0"
                title="Tidak ada data penyusun!"
                message="Belum ada data penyusun yang tersedia saat ini"
                @click="fetchData"
            />
            <DataTable v-else
                :data="data" 
                :columns="[
                    { field: 'law_type', label: 'Jenis', sortable: true, searchable: true },
                    { field: 'number', label: 'Nomor', sortable: true, searchable: true },
                    { field: 'year', label: 'Tahun', sortable: true, searchable: true },
                    { field: 'about', label: 'Tentang', sortable: false, searchable: true },
                    { field: 'sop_total', label: 'Jumlah SOP', sortable: false, searchable: true }
                ]" 
                @edit="openUpdateModal"
                @delete="openDeleteModal" 
                :edit-delete-column="true"
                :show-delete-button="shouldShowDeleteButton"
            />
        </div>
    </div>

    <DeleteDataModal 
        :showModal="showModalDelete" 
        :deleteData="deleteData" 
        :selectedId="selectedDeleteId"
        @update:showModal="showModalDelete = $event" 
    />

    <EditDataModal 
        modalTitle="Perbarui peraturan" 
        :showModal="showModalUpdate" 
        :formFields="[
            {
                id: 'id_law_type',
                label: 'Jenis Peraturan',
                type: 'select',
                placeholder: 'Pilih jenis peraturan',
                required: true,
                options: tipePeraturan,
                optionValue: 'id',
                optionLabel: 'law_type'
            },
            { id: 'number', label: 'Nomor', type: 'number', isColSpanHalf: true, placeholder: 'Mis. 95', required: true, min: 1, max: 999 },
            { id: 'year', label: 'Tahun', type: 'number', isColSpanHalf: true, placeholder: 'Mis. 2022', required: true, min: 1945, max: new Date().getFullYear() },
            { id: 'about', label: 'Pembahasan', type: 'textarea', placeholder: 'Misal: Organisasi dan Tata Kerja Organ Pengelola Universitas Andalas', required: true }
        ]" 
        :formData="form" 
        :updateData="updateData" 
        :selectedId="selectedUpdateId"
        @update:showModal="showModalUpdate = $event" 
    />
</template>
