<script setup>
import { onMounted, ref } from 'vue';
import { initModals } from 'flowbite';
import { getOrg, createOrg, updateOrg, deleteOrg } from '@/api/orgApi.js';

import PenToSquareIcon from '@/assets/icons/PenToSquareIcon.vue';
import TrashCanIcon from '@/assets/icons/TrashCanIcon.vue';
import DeleteDataModal from '@/components/modal/DeleteDataModal.vue';
import ShowToast from '@/components/toast/ShowToast.vue';
import AddDataModal from '@/components/modal/AddDataModal.vue';
import EditDataModal from '@/components/modal/EditDataModal.vue';
import PageTitle from '@/components/authenticated/PageTitle.vue';
import AddDataButton from '@/components/modal/AddDataButton.vue';

const data = ref([]);
const form = ref({
    id_pic: '',
    name: '',
    level: '',
    about: '',
    id_org_parent: null
});
const isSucces = ref(null);     //apakah proses sukses atau tidak
const operation = ref('');      //jenis operasinya apa?

const pic = [
    {id: 'hk', name: 'Husnil Kamil'},
    {id: 'ra', name: 'Ricky Akbar'},
    {id: 'jr', name: 'Jefril Rahmadoni'},
];

const level = [
    {id: 'laboratorium', name: 'Laboratorium'},
    {id: 'departemen', name: 'Departemen'},
]

const fetchData = async () => {
  try {
    const result = await getOrg();
    data.value = result.data;
  } catch (error) {
    console.error('Error fetching items:', error);
  }
};

// tampil modal untuk tambah data
const showAddModal = ref(false);

const addData = async () => {
    operation.value = 'post'
    try {
        const newItem = { 
            id_pic: form.value.id_pic||'oyoyooy',
            name: form.value.name,
            level: form.value.level,
            about: form.value.about,
            id_org_parent: form.value.id_org_parent,
        };
        
        await createOrg(newItem);

        isSucces.value = 'yes'
        form.value = {
            id_pic: '',
            name: '',
            level: '',
            about: '',
            id_org_parent: null
        };

        showAddModal.value = false;
        fetchData(); // refresh item list

    } catch (error) {
        console.error('Error adding item:', error);
        isSucces.value = 'no';
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
    operation.value = 'delete'
    try {
        const response = await deleteOrg(id);
        console.log(response);

        // Lakukan penghapusan item dari array data
        data.value = data.value.filter(item => item.id !== id);
        closeDeleteModal(); // Tutup modal setelah penghapusan
        isSucces.value = 'yes'

        console.log(`Data dengan ID ${id} berhasil dihapus`);
    } catch (error) {
        console.error('Delete error:', error);
        isSucces.value = 'no';
    }
};

// Fungsi untuk memperbarui data
const showModalUpdate = ref(false);
const selectedUpdateId = ref(null);
let dataYangDitemukan;

const openUpdateModal = (id) => {
    console.log('id update', id);
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
        id_pic: '',
        name: '',
        level: '',
        about: '',
        id_org_parent: ''
    };
};

const updateData = async (id) => {  // Fungsi untuk menghapus data berdasarkan ID
    operation.value = 'update'
    try {
        const newItem = {
            id_pic: form.value.id_pic||'oyoyooy',
            name: form.value.name,
            level: form.value.level,
            about: form.value.about,
            id_org_parent: form.value.id_org_parent,
        };

        const response = await updateOrg(id, newItem);
        console.log(response);

        isSucces.value = 'yes'
        console.log(`Data dengan ID ${id} berhasil diperbarui`);

        fetchData();
        closeUpdateModal(); // Tutup modal setelah penghapusan

    } catch (error) {
        console.error('Update error:', error);
        isSucces.value = 'no';
    }
};

onMounted(() => {
    initModals();
    fetchData()
})

</script>

<template>
    <main class="p-4 md:ml-64 h-auto pt-20">

        <ShowToast
            :isSucces="isSucces"
            :operation="operation"
        />

        <PageTitle judul="Daftar Organisasi yang Dikelola" />

        <div class="container mx-auto p-8 lg:px-16">

            <!-- modal tambah aturan -->
            <div class="flex justify-end mb-4">
                <AddDataButton btnLabel="Input Organisasi Baru" @click="showAddModal = true" />
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
                @update:showModal="showAddModal = $event"
            />

            <div class="relative overflow-x-auto shadow-md sm:rounded-lg">
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
                                {{ item.pic }}
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