<template>
    <div class="max-w-4xl mx-auto p-6 bg-white rounded shadow-md">
      <form @submit.prevent="submitForm">
        <!-- Dasar Hukum dengan multiple selection -->
        <div class="mb-4">
          <label class="block text-gray-700 font-bold mb-2">Dasar Hukum</label>
          <!-- Dropdown untuk memilih dasar hukum yang sudah ada (multiple) -->
          <select
            v-model="selectedDasarHukum"
            class="w-full px-3 py-2 border border-gray-300 rounded"
            multiple
          >
            <option v-for="(hukum, index) in dasarHukumList" :key="index" :value="hukum.id">
              {{ hukum.name }}
            </option>
          </select>
          <small class="text-gray-500">* Tekan Ctrl/Cmd untuk memilih lebih dari satu</small>
        </div>
  
        <!-- Menambah dasar hukum baru -->
        <div class="mb-4">
          <label class="block text-gray-700 font-bold mb-2">
            Tambah Dasar Hukum Baru
          </label>
          <input
            v-model="newDasarHukum"
            type="text"
            class="w-full px-3 py-2 border border-gray-300 rounded"
            placeholder="Masukkan dasar hukum baru..."
          />
          <button
            type="button"
            @click="addNewDasarHukum"
            class="bg-blue-500 text-white px-3 py-2 mt-2 rounded"
          >
            Tambah Dasar Hukum
          </button>
        </div>
  
        <!-- Simpan data -->
        <button
          type="submit"
          class="bg-green-500 text-white px-4 py-2 rounded"
        >
          Simpan
        </button>
      </form>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        dasarHukumList: [], // Data dasar hukum yang sudah ada
        selectedDasarHukum: [], // Array untuk dasar hukum yang dipilih (multiple)
        newDasarHukum: "", // Dasar hukum baru yang ingin ditambahkan
      };
    },
    created() {
      // Panggil API untuk mengambil daftar dasar hukum yang sudah ada
      this.fetchDasarHukum();
    },
    methods: {
      // Fungsi untuk mengambil dasar hukum yang ada di sistem dari API
      fetchDasarHukum() {
        // Simulasi API call, ganti dengan API asli
        this.dasarHukumList = [
          { id: 1, name: "Peraturan Pemerintah Nomor 95 Tahun 2021" },
          { id: 2, name: "Peraturan Rektor Nomor 8 Tahun 2022" },
        ];
      },
      // Fungsi untuk menambahkan dasar hukum baru
      addNewDasarHukum() {
        if (this.newDasarHukum) {
          // Tambahkan dasar hukum baru ke daftar, atau kirim ke server untuk disimpan
          this.dasarHukumList.push({
            id: this.dasarHukumList.length + 1, // ID harus berasal dari database sebenarnya
            name: this.newDasarHukum,
          });
  
          // Reset input dasar hukum baru
          this.newDasarHukum = "";
        }
      },
      // Fungsi submit untuk menyimpan data form
      submitForm() {
        console.log("Dasar Hukum yang dipilih:", this.selectedDasarHukum);
        console.log("Dasar Hukum yang ada di sistem:", this.dasarHukumList);
      },
    },
  };
  </script>
  
  <style scoped>
  /* Custom styling if needed */
  </style>
  