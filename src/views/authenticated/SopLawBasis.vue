<script setup>
import { onMounted, ref } from "vue";
import { initModals } from "flowbite";
import { getLawType } from "@/api/lawTypeApi";
import { getLawBasis, createLawBasis, updateLawBasis, deleteLawBasis } from "@/api/lawBasisApi";

import DataTable from "@/components/DataTable.vue";
import PulseLoading from "@/components/PulseLoading.vue";
import ShowToast from "@/components/toast/ShowToast.vue";
import DeleteDataModal from "@/components/modal/DeleteDataModal.vue";
import AddDataModal from "@/components/modal/AddDataModal.vue";
import EditDataModal from "@/components/modal/EditDataModal.vue";
import PageTitle from "@/components/authenticated/PageTitle.vue";
import AddDataButton from "@/components/modal/AddDataButton.vue";
import Error from "@/components/Error.vue";

const tipePeraturan = ref([]);
const data = ref([]);
const form = ref({
    id_law_type: '',
    number: null,
    year: null,
    about: ''
});
const isSucces = ref(null);
const operation = ref('');

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
        data.value = [];
        const response = await getLawBasis();
        data.value = response.data;
    } catch (error) {
        data.value = null;
        console.error('Fetch error:', error);
    }
};

// tampil modal tambah data
const showAddModal = ref(false);

// submit data
const submitData = async () => {
    operation.value = 'post'
    try {
        await createLawBasis(form.value);

        isSucces.value = 'yes';
        form.value = {
            id_law_type: '',
            number: '',
            year: '',
            about: ''
        };

        showAddModal.value = false;
        fetchData();

    } catch (error) {
        console.error('Error saat mengirim data:', error);
        isSucces.value = 'no';
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
    operation.value = 'delete'
    try {
        const response = await deleteLawBasis(id);
        console.log(response);

        // Lakukan penghapusan item dari array data
        data.value = data.value.filter(item => item.id !== id);
        closeDeleteModal(); // Tutup modal setelah penghapusan
        isSucces.value = 'yes'

        console.log(`Data dengan ID ${id} berhasil dihapus`);
    } catch (error) {
        isSucces.value = 'no'
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

    form.value = {
        id_law_type: '',
        number: '',
        year: '',
        about: ''
    };
};

const updateData = async (id) => {  // Fungsi untuk menghapus data berdasarkan ID
    operation.value = 'update'
    try {
        const response = await updateLawBasis(id, form.value);
        console.log(response);

        isSucces.value = 'yes'
        console.log(`Data dengan ID ${id} berhasil diperbarui`);

        fetchData();
        closeUpdateModal(); // Tutup modal setelah penghapusan

    } catch (error) {
        isSucces.value = 'no'
        console.error('Update error:', error);
    }
};

onMounted( () => {
    initModals(); // Inisialisasi modals jika diperlukan
    fetchTipePeraturan();
    fetchData(); // Ambil data tabel
});
</script>

<template>
    <main class="p-4 md:ml-64 h-auto pt-20">

        <ShowToast 
            :is-succes="isSucces"
            :operation="operation"
        />

        <PageTitle judul="Daftar Peraturan yang Digunakan" />

        <div class="container mx-auto p-8 lg:px-16">

            <!-- modal tambah aturan -->
            <div class="flex justify-end mb-4">
                <AddDataButton btnLabel="Input Peraturan Baru" @click="showAddModal = true" />
            </div>

            <!-- Komponen AddDataModal -->
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
                @update:showModal="showAddModal = $event"
            />

            <template v-if="data">
                <DataTable v-if="data.length > 0"
                    :data="data"
                    :columns="[
                        { field: 'law_type', label: 'Jenis', sortable: true },
                        { field: 'number', label: 'Nomor', sortable: true },
                        { field: 'year', label: 'Tahun', sortable: true },
                        { field: 'about', label: 'Tentang', sortable: false }
                    ]"
                    :searchable="['law_type', 'number', 'year', 'about']"
                    @edit="openUpdateModal"
                    @delete="openDeleteModal"
                    table-type="crud"
                />
                <PulseLoading v-else-if="data.length == 0" />
            </template>
            <Error @click="fetchData" v-else/>
        </div>

        <!-- Komponen DeleteDataModal -->
        <DeleteDataModal
            :showModal="showModalDelete"
            :deleteData="deleteData"
            :selectedId="selectedDeleteId"
            @update:showModal="showModalDelete = $event"
        />

        <!-- modal edit -->
        <EditDataModal
            modalTitle="Perbarui dasar hukum"
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

    </main>
</template>
