<template>
    <div class="max-w-4xl mx-auto p-6 bg-white rounded shadow-md">
      <!-- Form -->
      <form @submit.prevent="submitForm">
        <!-- Dasar Hukum dengan multiple selection menggunakan Choices.js -->
        <div class="mb-4">
          <label class="block text-gray-700 font-bold mb-2">Dasar Hukum</label>
          <select
            ref="choicesSelect"
            class="choices w-full px-3 py-2 border border-gray-300 rounded"
            multiple
          >
            <option
              v-for="(hukum, index) in dasarHukumList"
              :key="index"
              :value="hukum.id"
            >
              {{ hukum.name }}
            </option>
          </select>
        </div>
  
        <!-- Tombol untuk membuka modal tambah dasar hukum -->
        <button
          type="button"
          @click="openModal"
          class="bg-blue-500 text-white px-3 py-2 rounded"
        >
          Tambah Dasar Hukum Baru
        </button>
  
        <!-- Modal untuk menambahkan dasar hukum baru -->
        <div
          v-if="isModalOpen"
          class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
        >
          <div class="bg-white p-6 rounded shadow-lg max-w-lg w-full">
            <h3 class="text-lg font-bold mb-4">Tambah Dasar Hukum Baru</h3>
            <input
              v-model="newDasarHukum"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded"
              placeholder="Masukkan dasar hukum baru..."
            />
            <div class="flex justify-end mt-4">
              <button
                @click="addNewDasarHukum"
                class="bg-green-500 text-white px-3 py-2 rounded mr-2"
              >
                Simpan
              </button>
              <button
                @click="closeModal"
                class="bg-gray-500 text-white px-3 py-2 rounded"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
  
        <!-- Simpan data -->
        <button
          type="submit"
          class="bg-green-500 text-white px-4 py-2 rounded mt-4"
        >
          Simpan
        </button>
      </form>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  import Choices from 'choices.js';
  import "choices.js/public/assets/styles/choices.css";
  
  // State untuk daftar dasar hukum dan form input
  const newDasarHukum = ref('');
  const isModalOpen = ref(false);
  const choicesSelect = ref(null);
  let choices = null;
  const dasarHukumList = ref([
    { id: 1, name: 'Peraturan Pemerintah Nomor 95 Tahun 2021' },
    { id: 2, name: 'Peraturan Rektor Nomor 8 Tahun 2022' },
  ]);
  
  // Fetch data dasar hukum dari API
  // const fetchDasarHukum = () => {
  //   // Simulasi API call
  //   dasarHukumList.value = [
  //     { id: 1, name: 'Peraturan Pemerintah Nomor 95 Tahun 2021' },
  //     { id: 2, name: 'Peraturan Rektor Nomor 8 Tahun 2022' },
  //   ];
  //   console.log(dasarHukumList.value)
  // };
  
  // Tambah dasar hukum baru ke dalam list dan Choices.js
  const addNewDasarHukum = () => {
    if (newDasarHukum.value) {
      // Tambahkan dasar hukum baru ke daftar
      dasarHukumList.value.push({
        id: dasarHukumList.value.length + 1,
        name: newDasarHukum.value,
      });
  
      // Tambahkan ke Choices
      choices.setChoices(
        dasarHukumList.value.map((hukum) => ({
          value: hukum.id,
          label: hukum.name,
        })),
        'value',
        'label',
        false
      );
  
      // Reset input dasar hukum baru
      newDasarHukum.value = '';
      closeModal();
    }
  };
  
  // Inisialisasi Choices.js
  const initChoices = () => {
    choices = new Choices(choicesSelect.value, {
      removeItemButton: true,
      maxItemCount: -1,
      searchResultLimit: 5,
      searchPlaceholderValue: 'Cari...',
    });
  };
  
  // Buka modal
  const openModal = () => {
    isModalOpen.value = true;
  };
  
  // Tutup modal
  const closeModal = () => {
    isModalOpen.value = false;
  };
  
  // Fungsi submit form
  const submitForm = () => {
    const selectedValues = choices.getValue(true); // Dapatkan nilai yang dipilih dari Choices.js
    console.log('Dasar Hukum yang dipilih:', selectedValues);
    console.log('Dasar Hukum yang ada di sistem:', dasarHukumList.value);
  };
  
  // Ketika komponen di-mount, inisialisasi Choices.js dan fetch data
  onMounted(() => {
    initChoices();
    // fetchDasarHukum();
  });
  </script>
  
  <style scoped>
  /* Custom styling if needed */
  </style>
  