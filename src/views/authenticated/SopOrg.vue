<script setup>
import { toast } from 'vue3-toastify';
import { inject, onMounted, ref } from 'vue';
import { getAllDrafter } from '@/api/drafterApi';
import { getOrg, createOrg, updateOrg, deleteOrg } from '@/api/orgApi.js';

import PenToSquareIcon from '@/assets/icons/PenToSquareIcon.vue';
import TrashCanIcon from '@/assets/icons/TrashCanIcon.vue';
import DeleteDataModal from '@/components/modal/DeleteDataModal.vue';
import AddDataModal from '@/components/modal/AddDataModal.vue';
import EditDataModal from '@/components/modal/EditDataModal.vue';
import PageTitle from '@/components/authenticated/PageTitle.vue';
import AddDataButton from '@/components/modal/AddDataButton.vue';
import PulseLoading from '@/components/PulseLoading.vue';
import Error from '@/components/Error.vue';

const layoutType = inject('layoutType');
layoutType.value = 'admin';

const data = ref([]);
const defaultFormState = {
    id_pic: '',
    name: '',
    level: '',
    about: '',
    id_org_parent: null
};

// Gunakan ref dengan nilai awal defaultFormState
const form = ref({ ...defaultFormState });

// Fungsi untuk mereset form ke nilai default
const resetForm = () => {
    form.value = { ...defaultFormState };
};

const pic = ref([]);

// Fungsi untuk fetch data dari API
const fetchDataPic = async () => {
    try {
        pic.value = [];
        const result = await getAllDrafter();
        console.log('drafter', result)
        pic.value = result.data;
    } catch (error) {
        data.value = null;
        console.error('Fetch error:', error);
    }
};

const level = [
    { id: 'laboratorium', name: 'Laboratorium' },
    { id: 'departemen', name: 'Departemen' },
]

const fetchDataOrg = async () => {
    try {
        data.value = [];
        const result = await getOrg();
        data.value = result.data;
    } catch (error) {
        data.value = null;
        console.error('Error fetching items:', error);
    }
};

// tampil modal untuk tambah data
const showAddModal = ref(false);
const openAddModal = () => {
    resetForm(); // Reset form sebelum membuka modal
    showAddModal.value = true;
};

const addData = async () => {
    try {

        const newItem = {
            id_pic: form.value.id_pic || 'oyoyooy',
            name: form.value.name,
            level: form.value.level,
            about: form.value.about,
            id_org_parent: form.value.id_org_parent,
        };

        await createOrg(newItem);
        resetForm();

        showAddModal.value = false;
        fetchDataOrg(); // refresh item list

        toast("Data berhasil ditambahkan!", {
            "type": "success",
            "autoClose": 3000,
        });

    } catch (error) {
        console.error('Error adding item:', error);
    }
};

// hapus data
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
        const response = await deleteOrg(id);
        console.log(response);

        // Lakukan penghapusan item dari array data
        data.value = data.value.filter(item => item.id !== id);
        closeDeleteModal(); // Tutup modal setelah penghapusan

        toast("Data berhasil dihapus!", {
            "type": "success",
            "autoClose": 3000,
        });

        console.log(`Data dengan ID ${id} berhasil dihapus`);
    } catch (error) {
        console.error('Delete error:', error);
    }
};

// Fungsi untuk memperbarui data
const showModalUpdate = ref(false);
const selectedUpdateId = ref(null);
let dataYangDitemukan;

// Update fungsi openUpdateModal
const openUpdateModal = (id) => {
    selectedUpdateId.value = id;
    showModalUpdate.value = true;
    
    dataYangDitemukan = data.value.find(item => item.id === id);
    if (dataYangDitemukan) {
        // console.log('Data yang ditemukan:', dataYangDitemukan);
        // console.log('PIC data:', dataYangDitemukan.pic);
        form.value = {
            id_pic: dataYangDitemukan.pic.id,
            name: dataYangDitemukan.name,
            level: dataYangDitemukan.level,
            about: dataYangDitemukan.about,
            id_org_parent: dataYangDitemukan.id_org_parent
        };
        // console.log('Data form:', form.value);
        // console.log('Form value setelah diset:', form.value);
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
        const newItem = {
            id_pic: form.value.id_pic || 'oyoyooy',
            name: form.value.name,
            level: form.value.level,
            about: form.value.about,
            id_org_parent: form.value.id_org_parent,
        };

        const response = await updateOrg(id, newItem);
        console.log(response);
        console.log(`Data dengan ID ${id} berhasil diperbarui`);

        fetchDataOrg();
        closeUpdateModal(); // Tutup modal setelah penghapusan

        toast("Data berhasil diperbarui!", {
            "type": "success",
            "autoClose": 3000,
        });

    } catch (error) {
        console.error('Update error:', error);
    }
};

onMounted(() => {
    fetchDataOrg();
    fetchDataPic();
})

</script>

<template>
    <main class="p-4 md:ml-64 h-auto pt-20">

        <PageTitle judul="Daftar Organisasi yang Dikelola" />

        <div class="container mx-auto p-8 lg:px-16">

            <!-- modal tambah aturan -->
            <div class="flex justify-end mb-4">
                <AddDataButton btnLabel="Input Organisasi Baru" @click="openAddModal" />
            </div>

            <!-- Komponen AddDataModal -->
            <AddDataModal 
                modalTitle="Tambahkan organisasi baru" 
                :showModal="showAddModal" 
                :formFields="[
                    { id: 'name', label: 'Nama', type: 'text', placeholder: 'Mis. Laboratorium Aplikasi Perusahaan', required: true, minlength: 5, maxlength: 100 },
                    {
                        id: 'id_pic',
                        label: 'Penanggung Jawab',
                        type: 'select',
                        placeholder: 'Pilih PJ',
                        required: false,         //sementara false, karena belum ada dari be
                        options: pic,
                        optionValue: 'id',
                        optionLabel: 'name'
                    },
                    {
                        id: 'level',
                        label: 'Level',
                        type: 'select',
                        placeholder: 'Pilih level',
                        required: true,
                        options: level,
                        optionValue: 'id',
                        optionLabel: 'name'
                    },
                    { id: 'about', label: 'Keterangan', type: 'textarea', placeholder: 'ketikkan keterangan tambahan mengenai organisasi' }
                ]" 
                :formData="form" 
                :submitData="addData" 
                @update:showModal="(val) => {
                    showAddModal = val;
                    if (!val) resetForm();
                }" 
            />

            <template v-if="data">
                <div v-if="data.length > 0" class="relative overflow-x-auto shadow-md sm:rounded-lg">
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
                                    Level
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
                                    {{ item.pic.name }}
                                </td>
                                <td class="px-6 py-4">
                                    {{ item.level }}
                                </td>
                                <td class="px-6 py-4">
                                    {{ item.about }}
                                </td>
                                <td class="px-6 py-4 flex">
                                    <!-- Edit -->
                                    <button :title="`Edit organisasi ${index + 1}`" @click="openUpdateModal(item.id)"
                                        class="px-3 py-2 h-9 mx-2 text-white bg-yellow-400 rounded-lg hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:ring-opacity-50 inline-flex">
                                        <PenToSquareIcon class="fill-current w-4" />
                                    </button>
                                    <!-- Hapus -->
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
            <Error @click="fetchDataOrg" v-else />

        </div>

        <!-- modal edit -->
        <EditDataModal
            modalTitle="Perbarui data organisasi" 
            :showModal="showModalUpdate" 
            :formFields="[
                { id: 'name', label: 'Nama', type: 'text', placeholder: 'Mis. Laboratorium Aplikasi Perusahaan', required: true, minlength: 5, maxlength: 100 },
                {
                    id: 'id_pic',
                    label: 'Penanggung Jawab',
                    type: 'select',
                    placeholder: 'Pilih PJ',
                    required: true,
                    options: pic,
                    optionValue: 'id',
                    optionLabel: 'name'
                },
                {
                    id: 'level',
                    label: 'Level',
                    type: 'select',
                    placeholder: 'Pilih level',
                    required: true,
                    options: level,
                    optionValue: 'id',
                    optionLabel: 'name'
                },
                { id: 'about', label: 'Keterangan', type: 'textarea', placeholder: 'ketikkan keterangan tambahan mengenai organisasi' }
            ]" 
            :formData="form" 
            :updateData="updateData" 
            :selectedId="selectedUpdateId"
            @update:showModal="showModalUpdate = $event" 
        />

        <!-- Komponen DeleteDataModal -->
        <DeleteDataModal 
            :showModal="showModalDelete"
            :deleteData="deleteData" 
            :selectedId="selectedDeleteId"
            @update:showModal="showModalDelete = $event" 
        />

    </main>
</template>