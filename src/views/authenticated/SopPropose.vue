<script setup>
import { ref } from 'vue';
import dateNow from '@/utils/dateNow';
import XMarkIcon from '@/components/icons/XMarkIcon.vue';

const items = ref(['Pelaksana 1', 'Pelaksana 2', 'Pelaksana 3']); // Daftar awal item
const selectedItems = ref([]); // Menyimpan item yang dipilih
const newItem = ref(''); // Menyimpan input item baru

const addItem = () => {
    if (newItem.value && !items.value.includes(newItem.value)) {
        items.value.push(newItem.value); // Menambahkan item baru
        newItem.value = ''; // Mengosongkan input setelah ditambah
    }
};

const editablePart = ref('000')

// ------------penugasan--------
// Definisikan state dengan ref
const searchQuery = ref('');
const users = ref([
    { id: 1, name: 'John Doe' },
    { id: 2, name: 'Jane Smith' },
    { id: 3, name: 'Michael Johnson' },
    { id: 4, name: 'Kemal Muhammad Hiero' },
    { id: 5, name: 'Keke' },
    { id: 6, name: 'Jessica' },
    // Tambahkan lebih banyak data user di sini atau dapatkan dari API
]);

const filteredUsers = ref([]);
const selectedUsers = ref([]);

// Fungsi pencarian user
const searchUser = () => {
    if (searchQuery.value.length > 0) {
        filteredUsers.value = users.value
            .filter(user =>
                user.name.toLowerCase().includes(searchQuery.value.toLowerCase())
            )
            .filter(user =>
                !selectedUsers.value.some(selected => selected.id === user.id)
            );
    } else {
        filteredUsers.value = [];
    }
};

// Fungsi untuk memilih user
const selectUser = (user) => {
    // Cek apakah user sudah ada dalam daftar terpilih
    if (!selectedUsers.value.find(selected => selected.id === user.id)) {
        selectedUsers.value.push(user);
    }
    searchQuery.value = '';
    filteredUsers.value = [];
};

// Fungsi untuk menghapus user dari daftar terpilih
const removeUser = (user) => {
    selectedUsers.value = selectedUsers.value.filter(selected => selected.id !== user.id);
};

</script>

<template>
    <main class="p-4 md:ml-64 h-auto pt-20">

        <div class="text-center mt-3 mb-7">
            <h1 class="text-3xl font-extrabold leading-none tracking-tight text-gray-900 lg:text-4xl dark:text-white">
                Usulkan POS baru
            </h1>
        </div>

        <section class="bg-white dark:bg-gray-900">
            <div class="py-8 px-4 mx-auto max-w-3xl">
                <form action="#">
                    <div class="grid gap-4 sm:grid-cols-2 sm:gap-6">
                        <div class="sm:col-span-2">
                            <label for="name" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                Nama POS
                            </label>
                            <input type="text" name="name" id="name"
                                class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                                placeholder="Contoh : Pengusulan Kerja Praktik (langsung judul, tanpa perlu 'SOP' atau 'POS' di awal)"
                                required>
                        </div>
                        <div class="sm:col-span-2">
                            <label for="name" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                Nomor POS
                            </label>
                            <div class="flex items-center">
                                <span
                                    class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-l-lg p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                                    T/
                                </span>
                                <input type="text" v-model="editablePart"
                                    class="bg-gray-50 border-t border-b border-gray-300 text-gray-900 text-sm p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    placeholder="Masukkan no urut sop">
                                <span
                                    class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-r-lg p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                                    /UN16.17.02/OT.01.00/{{ new Date().getFullYear() }}
                                </span>
                            </div>
                        </div>
                        <div>
                            <label for="org"
                                class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Organisasi</label>
                            <select id="org"
                                class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500">
                                <option selected>Pilih organisasi</option>
                                <option value="dsi">DSI</option>
                                <option value="lea">LEA</option>
                                <option value="ldkom">LDKOM</option>
                                <option value="labgis">LABGIS</option>
                                <option value="lbi">LBI</option>
                            </select>
                        </div>
                        <div class="w-full">
                            <label for="number" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                Tanggal Pembuatan
                            </label>
                            <input type="date" name="number" id="number"
                                class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                                placeholder="Masukkan tanggal" required>
                        </div>
                        <div class="sm:col-span-2">
                            <label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                Pelaksana
                            </label>

                            <div v-for="(item, index) in items" :key="index" class="flex items-center mb-2">
                                <input type="checkbox" :id="`pelaksana-${index}`" :value="item" v-model="selectedItems"
                                    class="bg-gray-50 border border-gray-300 text-primary-600 rounded focus:ring-primary-600 dark:bg-gray-700 dark:border-gray-600 dark:ring-offset-gray-800">
                                <label :for="`pelaksana-${index}`"
                                    class="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">
                                    {{ item }}
                                </label>
                            </div>

                            <div class="flex items-center">
                                <input v-model="newItem" type="text" placeholder="Tambah pelaksana baru"
                                    class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white">
                                <button @click="addItem"
                                    class="ml-2 text-sm text-white bg-primary-600 hover:bg-primary-700 p-2 rounded">
                                    Tambah
                                </button>
                            </div>

                            <p class="mt-2 text-sm text-gray-500 dark:text-gray-400">Pelaksana yang dipilih: {{
                                selectedItems.join(', ') }}</p>
                        </div>

                        <div class="sm:col-span-2">
                            <label for="description"
                                class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Deskripsi</label>
                            <textarea id="description" rows="8"
                                class="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                                placeholder="Ketikkan deskripsi SOP disini..."></textarea>
                        </div>
                        <div class="sm:col-span-2">
                            <label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white" for="search">
                                Penugasan
                            </label>
                            <input type="text" id="search" v-model="searchQuery" @input="searchUser"
                                placeholder="Ketikkan nama user, lalu klik nama yang dimaksud"
                                class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />

                            <!-- Dropdown hasil pencarian -->
                            <div v-if="filteredUsers.length > 0"
                                class="border border-gray-300 rounded mt-2 max-h-40 overflow-auto bg-white">
                                <ul>
                                    <li v-for="user in filteredUsers" :key="user.id" @click="selectUser(user)"
                                        class="cursor-pointer p-2 hover:bg-blue-100">
                                        {{ user.name }}
                                    </li>
                                </ul>
                            </div>

                            <!-- User yang dipilih -->
                            <div v-if="selectedUsers.length > 0" class="mt-4">
                                <p>User yang dipilih:</p>
                                <ul>
                                    <li v-for="(user, index) in selectedUsers" :key="index"
                                        class="flex items-center py-1 px-3">
                                        {{ user.name }}
                                        <button @click="removeUser(user)" class="ml-2" title="Hapus user ini">
                                            <XMarkIcon class="w-4 fill-red-600" />
                                        </button>
                                    </li>
                                </ul>
                            </div>

                        </div>
                    </div>
                    <button type="submit"
                        class="inline-flex items-center px-5 py-2.5 mt-4 sm:mt-6 text-sm font-medium text-center text-white bg-primary-700 rounded-lg focus:ring-4 focus:ring-primary-200 dark:focus:ring-primary-900 hover:bg-primary-800">
                        Mulai buat SOP baru
                    </button>
                </form>
            </div>
        </section>
    </main>
</template>