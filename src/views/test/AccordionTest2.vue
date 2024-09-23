<template>
    <div class="sop-accordion">
      <h3>Alur Prosedur Pendaftaran Kerja Praktik</h3>
      <div v-for="(item, index) in accordionItems" :key="index" class="accordion-item">
        <button class="accordion-button" @click="toggleAccordion(index)">
          {{ item.title }}
        </button>
        <div v-show="item.isOpen" class="accordion-content">
          <p>{{ item.content }}</p>
        </div>
      </div>
    </div>
  </template>

  
  <script setup>
    import { ref } from 'vue';

    const accordionItems = ref([
    {
        title: '1. Mengisi Formulir Permohonan KP (5 Menit)',
        content: 'Mahasiswa mengisi formulir permohonan KP lengkap dengan transkrip nilai dan proposal KP.',
        isOpen: false,
    },
    {
        title: '2. Peninjauan Permohonan KP (1 Hari)',
        content: 'Departemen meninjau formulir permohonan KP yang telah diajukan.',
        isOpen: false,
    },
    // Tambahkan langkah-langkah selanjutnya dengan struktur yang sama
    ]);

    const toggleAccordion = (index) => {
    accordionItems.value[index].isOpen = !accordionItems.value[index].isOpen;
    };

  </script>
  
  <style>
  .sop-accordion {
      padding: 20px;
      background-color: #f5f5f5;
      border-radius: 8px;
  }
  
  .accordion-item {
      margin-bottom: 10px;
  }
  
  .accordion-button {
      width: 100%;
      padding: 15px;
      text-align: left;
      border: none;
      background-color: #4CAF50;
      color: white;
      cursor: pointer;
      border-radius: 4px;
      transition: background-color 0.3s ease;
  }
  
  .accordion-button:hover {
      background-color: #45a049;
  }
  
  .accordion-content {
      padding: 15px;
      background-color: #fff;
      border: 1px solid #ddd;
      border-top: none;
      border-radius: 0 0 4px 4px;
  }
  
  .accordion-content p {
      margin: 0;
  }
  </style>
  