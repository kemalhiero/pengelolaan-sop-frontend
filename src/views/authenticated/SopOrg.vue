<script setup>
import { onMounted, ref } from 'vue';
import { initModals } from 'flowbite';
import CirclePlusIcon from '@/assets/icons/CirclePlusIcon.vue';
import PenToSquareIcon from '@/assets/icons/PenToSquareIcon.vue';
import TrashCanIcon from '@/assets/icons/TrashCanIcon.vue';
import { getOrg, createOrg, updateOrg, deleteOrg } from '@/api/orgApi.js';
import XMarkCloseIcon from '@/assets/icons/XMarkCloseIcon.vue';

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

const fetchData = async () => {
  try {
    const result = await getOrg();
    data.value = result.data;
  } catch (error) {
    console.error('Error fetching items:', error);
  }
};

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

        form.value.id_pic = '';
        form.value.name = '';
        form.value.level = '';
        form.value.about = '';
        form.value.id_org_parent = null;

        fetchData(); // refresh item list
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
    const dataModal = data.value;
    console.log(id)

    for (let i = 0; i < dataModal.length; i++) {
        if (dataModal[i].id === id) {
            dataYangDitemukan = dataModal[i];
            break; // Keluar dari loop setelah data ditemukan
        }
    }

    form.value.pic = dataYangDitemukan.pic
    form.value.name = dataYangDitemukan.name
    form.value.level = dataYangDitemukan.level
    form.value.about = dataYangDitemukan.about
    form.value.id_org_parent = dataYangDitemukan.id_org_parent

    if (dataYangDitemukan) {
        console.log(dataYangDitemukan);
    } else {
        console.log("Data tidak ditemukan");
    }
};

const closeUpdateModal = () => {
    showModalUpdate.value = false; // Sembunyikan modal
    selectedUpdateId.value = null; // Reset ID setelah modal ditutup

    form.value.id_pic = ''
    form.value.name = ''
    form.value.level = ''
    form.value.about = ''
    form.value.id_org_parent = ''
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
        isSucces.value = 'no'
        console.error('Update error:', error);
    }
};

onMounted(() => {
    initModals();
    fetchData()
})

</script>

<template>
    <main class="p-4 md:ml-64 h-auto pt-20">

        <div class="text-center mt-3 mb-7">
            <h1 class="text-3xl font-extrabold leading-none tracking-tight text-gray-900 lg:text-4xl dark:text-white">
                Daftar Organisasi yang Dikelola
            </h1>
        </div>

        <div class="container mx-auto p-8 lg:px-16">

            <!-- modal tambah aturan -->
            <div class="flex justify-end mb-4">
                <button data-modal-target="modal-org-input" data-modal-toggle="modal-org-input"
                    class="text-white bg-[#2557D6] hover:bg-[#2557D6]/90 focus:ring-4 focus:ring-[#2557D6]/50 focus:outline-none font-medium rounded-lg text-sm py-2 px-3 text-center inline-flex items-center me-2 mb-2 ml-auto"
                    title="" type="button">
                    <CirclePlusIcon class="w-5 mr-3 fill-current" />
                    Input Organisasi Baru
                </button>

                <div id="modal-org-input" tabindex="-1" aria-hidden="true"
                    class="hidden overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full">
                    <div class="relative p-4 w-full max-w-md max-h-full">
                        <!-- Modal content -->
                        <div class="relative bg-white rounded-lg shadow">
                            <!-- Modal header -->
                            <div class="flex items-center justify-between p-4 md:p-5 border-b rounded-t">
                                <h3 class="text-lg font-semibold text-gray-900">
                                    Tambahkan organisasi baru
                                </h3>
                                <button type="button"
                                    class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center"
                                    data-modal-toggle="modal-org-input">
                                    <svg class="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"
                                        fill="none" viewBox="0 0 14 14">
                                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
                                            stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
                                    </svg>
                                    <span class="sr-only">Tutup modal</span>
                                </button>
                            </div>
                            <!-- Modal body -->
                            <form class="p-4 md:p-5" @submit.prevent="addData">
                                <div class="grid gap-4 mb-4 grid-cols-2">
                                    <div class="col-span-2">
                                        <label for="name"
                                            class="block mb-2 text-sm font-medium text-gray-900">Nama</label>
                                        <input type="text" id="name" v-model="form.name"
                                            class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                                            placeholder="Mis. Laboratorium Aplikasi Perusahaan" required>
                                    </div>
                                    <div class="col-span-2">
                                        <label for="pic" class="block mb-2 text-sm font-medium text-gray-900">
                                            Penanggung Jawab
                                        </label>
                                        <select id="pic" v-model="form.id_pic"
                                            class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5">
                                            <option value="">Pilih PJ</option>
                                            <option value="">Husnil Kamil</option>
                                            <option value="">Ricky Akbar</option>
                                            <option value="">Jefril Rahmadoni</option>
                                        </select>
                                    </div>
                                    <div class="col-span-2">
                                        <label for="level" class="block mb-2 text-sm font-medium text-gray-900">
                                            Level
                                        </label>
                                        <select id="level" v-model="form.level"
                                            class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5">
                                            <option selected>Pilih level</option>
                                            <option value="laboratorium">Laboratorium</option>
                                            <option value="departemen">Departemen</option>
                                        </select>
                                    </div>
                                    <div class="col-span-2">
                                        <label for="explanation"
                                            class="block mb-2 text-sm font-medium text-gray-900">Keterangan</label>
                                        <textarea id="explanation" rows="4" v-model="form.about"
                                            class="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="ketikkan keterangan tambahan mengenai organisasi"></textarea>
                                    </div>
                                </div>
                                <button type="submit" data-modal-toggle="modal-org-input"
                                    class="text-white inline-flex items-center bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center">
                                    <svg class="me-1 -ms-1 w-5 h-5" fill="currentColor" viewBox="0 0 20 20"
                                        xmlns="http://www.w3.org/2000/svg">
                                        <path fill-rule="evenodd"
                                            d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                                            clip-rule="evenodd"></path>
                                    </svg>
                                    Tambahkan
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

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
        <div v-if="showModalUpdate" class="fixed inset-0 z-50 flex items-center justify-center w-full h-full">

            <!-- Overlay gelap -->
            <div class="fixed inset-0 bg-gray-800 bg-opacity-30" @click="closeUpdateModal"></div>

            <!-- Modal content -->
            <div class="relative p-4 w-full max-w-md max-h-full z-10">
                <div class="relative bg-white rounded-lg shadow">

                    <!-- Modal header -->
                    <div class="flex items-center justify-between p-4 md:p-5 border-b rounded-t">
                        <h3 class="text-lg font-semibold text-gray-900">
                            Perbarui data organisasi
                        </h3>
                        <button type="button" @click="closeUpdateModal"
                            class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center">
                            <XMarkCloseIcon/>
                            <span class="sr-only">Tutup modal</span>
                        </button>
                    </div>

                    <!-- Modal body -->
                    <form class="p-4 md:p-5" @submit.prevent="updateData(selectedUpdateId)">
                        <div class="grid gap-4 mb-4 grid-cols-2">
                            <div class="col-span-2">
                                <label for="name" class="block mb-2 text-sm font-medium text-gray-900">Nama</label>
                                <input type="text" v-model="form.name" id="name"
                                    class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-yellow-300 focus:border-yellow-300 block w-full p-2.5"
                                    placeholder="Mis. Laboratory of Enterprise Application" required>
                            </div>
                            <div class="col-span-2">
                                <label for="pic" class="block mb-2 text-sm font-medium text-gray-900">Penanggung Jawab</label>
                                <input type="text" v-model="form.pic" id="pic"
                                    class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-yellow-300 focus:border-yellow-300 block w-full p-2.5"
                                    placeholder="" required>
                            </div>
                            <div class="col-span-2">
                                <label for="level" class="block mb-2 text-sm font-medium text-gray-900">Level</label>
                                <input type="text" v-model="form.level" id="level"
                                    class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-yellow-300 focus:border-yellow-300 block w-full p-2.5"
                                    placeholder="Mis. Laboratory of Enterprise Application" required>
                            </div>
                            <div class="col-span-2">
                                <label for="about" class="block mb-2 text-sm font-medium text-gray-900">Keterangan</label>
                                <textarea id="about" rows="4" v-model="form.about"
                                    class="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-yellow-300 focus:border-yellow-300"
                                    placeholder="ketikkan deskripsi disini..."></textarea>
                            </div>
                        </div>
                        <button type="submit"
                            class="text-white inline-flex items-center bg-yellow-400 hover:bg-yellow-500 focus:ring-4 focus:outline-none focus:ring-yellow-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center">
                            Perbarui
                        </button>
                    </form>

                </div>
            </div>
        </div>

        <!-- modal hapus -->
        <div v-if="showModalDelete" class="fixed inset-0 z-50 flex items-center justify-center w-full h-full">
            <!-- Overlay gelap -->
            <div class="fixed inset-0 bg-gray-800 bg-opacity-30" @click="closeDeleteModal"></div>

            <!-- Modal Konten -->
            <div class="relative p-4 w-full max-w-md max-h-full z-10">
                <div class="relative bg-white rounded-lg shadow">
                    <button type="button" @click="closeDeleteModal"
                        class="absolute top-3 right-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 inline-flex justify-center items-center">
                        <XMarkCloseIcon/>
                        <span class="sr-only">Tutup modal</span>
                    </button>
                    <div class="p-4 md:p-5 text-center">
                        <svg class="mx-auto mb-4 text-gray-400 w-12 h-12 dark:text-gray-200" aria-hidden="true"
                            xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M10 11V6m0 8h.01M19 10a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                        </svg>
                        <h3 class="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
                            Anda yakin ingin menghapus data ini?</h3>
                        <button @click="deleteData(selectedDeleteId)"
                            class="text-white bg-red-600 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm inline-flex items-center px-5 py-2.5 text-center">
                            Ya
                        </button>
                        <button @click="closeDeleteModal"
                            class="py-2.5 px-5 ms-3 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100">
                            Batal
                        </button>
                    </div>
                </div>
            </div>
        </div>

    </main>
</template>