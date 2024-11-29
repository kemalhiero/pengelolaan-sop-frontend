<script setup>
import { onMounted, ref } from 'vue';
import { getLawType, createLawType, updateLawType, deleteLawType } from '@/api/lawTypeApi';

import TrashCanIcon from '@/assets/icons/TrashCanIcon.vue';
import PenToSquareIcon from '@/assets/icons/PenToSquareIcon.vue';
import PulseLoading from '@/components/PulseLoading.vue';
import ShowToast from '@/components/toast/ShowToast.vue';
import AddDataModal from '@/components/modal/AddDataModal.vue';
import DeleteDataModal from '@/components/modal/DeleteDataModal.vue';
import EditDataModal from '@/components/modal/EditDataModal.vue';
import PageTitle from '@/components/authenticated/PageTitle.vue';
import AddDataButton from '@/components/modal/AddDataButton.vue';
import Error from '@/components/Error.vue';

const data = ref([]);
const form = ref({
    law_type: '',
    description: ''
});
const isSucces = ref(null);
const operation = ref('');

// Fungsi untuk fetch data dari API
const fetchData = async () => {
    try {
        data.value = [];
        const result = await getLawType();
        data.value = result.data; // Menyimpan data yang di-fetch
    } catch (error) {
        data.value = null;
        console.error('Fetch error:', error);
    }
};

// tampil modal tambah data
const showAddModal = ref(false);

// Fungsi untuk mengirim data ke API dengan metode POST
const submitData = async () => {
    operation.value = 'post'
    try {
        await createLawType(form.value);

        isSucces.value = 'yes';
        form.value = {
            law_type: '',
            description: ''
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
        console.log(id)
        const response = await deleteLawType(id);
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
    console.log(id);
    
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
        law_type: '',
        description: ''
    };
};

const updateData = async (id) => {  // Fungsi untuk menghapus data berdasarkan ID
    operation.value = 'update'
    try {

        const response = await updateLawType(id, form.value);
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

// ---------------------------------
onMounted(() => {
    fetchData();
});

</script>

<template>
    <main class="p-4 md:ml-64 h-auto pt-20">

        <ShowToast 
            :isSucces="isSucces"
            :operation="operation"
        />

        <PageTitle judul="Daftar Jenis Peraturan" />

        <div class="container mx-auto p-8 lg:px-16">

            <!-- modal tambah tipe aturan -->
            <div class="flex justify-end mb-4">
                <AddDataButton btnLabel="Input Jenis Peraturan Baru" @click="showAddModal = true" />
            </div>

            <!-- Komponen AddDataModal -->
            <AddDataModal
                modalTitle="Tambahkan jenis peraturan baru"
                :showModal="showAddModal"
                :formFields="[
                    { id: 'law_type', label: 'Jenis peraturan', type: 'text', placeholder: 'Mis. Peraturan Presiden', required: true, minlength: 5, maxlength: 100 },
                    { id: 'description', label: 'Deskripsi', type: 'textarea', placeholder: 'ketikkan deskripsi disini...' }
                ]"
                :formData="form"
                :submitData="submitData"
                @update:showModal="showAddModal = $event"
            />

            <template v-if="data">
                <div v-if="data.length > 0" class="relative overflow-x-auto shadow-md sm:rounded-lg">
                    <table class="w-full text-sm text-left text-gray-500">
                        <thead class="text-xs text-gray-900 uppercase bg-gray-50">
                            <tr>
                                <th scope="col" class="px-6 py-3">
                                    No.
                                </th>
                                <th scope="col" class="px-6 py-3">
                                    Jenis Peraturan
                                </th>
                                <th scope="col" class="px-6 py-3">
                                    Deskripsi
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
                                    {{ item.law_type }}
                                </td>
                                <td class="px-6 py-4 text-black">
                                    {{ item.description }}
                                </td>
                                <td class="px-6 py-4 flex">
                                    <button :title="`Edit item ${index + 1}`" @click="openUpdateModal(item.id)"
                                        class="px-3 py-2 h-9 mx-2 text-white bg-yellow-400 rounded-lg hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:ring-opacity-50 inline-flex">
                                        <PenToSquareIcon class="fill-current w-4" />
                                    </button>
                                    <button :title="`Hapus item ${index + 1}`" @click="openDeleteModal(item.id)"
                                        class="px-3 py-2 h-9 mx-2 text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 inline-flex">
                                        <TrashCanIcon class="fill-current w-4" />
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
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

        <!-- Komponen EditDataModal -->
        <EditDataModal
            modalTitle="Perbarui jenis peraturan"
            :showModal="showModalUpdate"
            :formFields="[
                { id: 'law_type', label: 'Jenis peraturan', type: 'text', colSpan: 'full', placeholder: 'Mis. Peraturan Presiden', required: true },
                { id: 'description', label: 'Deskripsi', type: 'textarea', colSpan: 'full', placeholder: 'ketikkan deskripsi disini...' }
            ]"
            :formData="form"
            :updateData="updateData"
            :selectedId="selectedUpdateId"
            @update:showModal="showModalUpdate = $event"
        />

    </main>
</template>
