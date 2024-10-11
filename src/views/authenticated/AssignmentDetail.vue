<script setup>
import { ref } from 'vue';
import CheckIcon from '@/components/icons/CheckIcon.vue';
import NumberOneCircleIcon from '@/components/icons/NumberOneCircleIcon.vue';
import NumberTwoCircleIcon from '@/components/icons/NumberTwoCircleIcon.vue';
import NumberThreeCircleIcon from '@/components/icons/NumberThreeCircleIcon.vue';
import CircleArrowRight from '@/components/icons/CircleArrowRight.vue';
import CircleArrowLeft from '@/components/icons/CircleArrowLeft.vue';

// State untuk mengatur langkah
const currentStep = ref(1);  // Langkah sekarang
const maxSteps = ref(3);     // Jumlah total langkah

// Fungsi untuk ke langkah berikutnya
const nextStep = () => {
  if (currentStep.value < maxSteps.value) {
    currentStep.value++;
  }
};

// Fungsi untuk ke langkah sebelumnya
const prevStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--;
  }
};

</script>

<template>

    <h2 class="text-4xl text-center my-12 font-bold">SOP Pendaftaran Kerja Praktik</h2>

    <div class="container mx-auto max-w-2xl">

        <!-- stepper -->
        <ol class="flex items-center justify-center w-full text-sm font-medium text-center text-gray-500 sm:text-base">
            <li
                class="flex md:w-full items-center text-blue-600 sm:after:content-[''] after:w-full after:h-1 after:border-b after:border-gray-400 after:border-1 after:hidden sm:after:inline-block after:mx-6 xl:after:mx-10 hover:cursor-pointer"
                @click="currentStep = 1"
                >
                <span class="flex items-center after:content-['/'] sm:after:hidden after:mx-2 after:text-gray-400">
                    <!-- <CheckIcon/> -->
                    <NumberOneCircleIcon class="mr-2" />
                    Informasi
                    <span class="hidden sm:inline-flex sm:ms-2">SOP</span>
                </span>
            </li>
            <li
                class="flex md:w-full items-center after:content-[''] after:w-full after:h-1 after:border-b after:border-gray-400 after:border-1 after:hidden sm:after:inline-block after:mx-6 xl:after:mx-10 hover:cursor-pointer"
                @click="currentStep = 2">
                <span class="flex items-center after:content-['/'] sm:after:hidden after:mx-2 after:text-gray-400">
                    <span class="me-2">2</span>
                    Penyusunan <span class="hidden sm:inline-flex sm:ms-2">SOP</span>
                </span>
            </li>
            <li class="flex items-center hover:cursor-pointer" @click="currentStep = 3">
                <span class="me-2">3</span>
                Confirmation
            </li>
        </ol>

        <!-- tampilan data -->
        <div class="my-8 px-6 md:px-0">

            <!-- form tahap pertama -->
             <template v-if="currentStep == 1">
                 <div class="grid gap-4 sm:grid-cols-2 sm:gap-6 text-black">
                     <div class="mb-5">
                         <label for="sop-number" class="block mb-2 text-sm font-medium ">
                             Nomor Pos
                         </label>
                         <input type="text" id="sop-number"
                             class="bg-gray-50 border border-gray-300 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 "
                             value="T/001/UN16.17.02/OT.01.00/2024" readonly />
                     </div>
                     <div class="mb-5">
                         <label for="sop-date" class="block mb-2 text-sm font-medium ">
                             Tanggal
                         </label>
                         <input type="text" id="sop-date"
                             class="bg-gray-50 border border-gray-300 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                             value="11/10/2024" readonly />
                     </div>
                     <div class="mb-5">
                         <label for="sop-org" class="block mb-2 text-sm font-medium ">
                             Organisasi
                         </label>
                         <input type="text" id="sop-org"
                             class="bg-gray-50 border border-gray-300 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                             value="Departemen Sistem Informasi" readonly />
                     </div>
                     <div class="mb-5">
                         <label for="sop-pic" class="block mb-2 text-sm font-medium ">
                             Penanggung Jawab
                         </label>
                         <input type="text" id="sop-pic"
                             class="bg-gray-50 border border-gray-300 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                             value="Husnil Kamil" readonly />
                     </div>
                 </div>
                 <div class="mb-5">
                     <label for="sop-description" class="block mb-2 text-sm font-medium ">
                         Deskripsi
                     </label>
                     <textarea id="sop-description"
                         class="bg-gray-50 border border-gray-300 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 h-48"
                         >Lorem ipsum dolor sit amet consectetur adipisicing elit. Assumenda incidunt dolores veniam molestias doloribus voluptatem itaque fugiat commodi quibusdam voluptate eveniet quo eligendi, laudantium cupiditate obcaecati quaerat praesentium a labore reiciendis, aut cumque! Exercitationem ea quaerat iure quae dolorem, temporibus perferendis aperiam ducimus nemo dolor harum reiciendis atque? Vitae, ipsum.</textarea>
                 </div>
                 <div class="grid gap-4 sm:grid-cols-2 sm:gap-6 text-black">
                     <div class="mb-5">
                         <h2 class="mb-2 text-sm font-semibold text-gray-900 dark:text-white">Pelaksana:</h2>
                         <ul class="max-w-md space-y-1 list-disc list-inside text-sm">
                             <li>Mahasiswa</li>
                             <li>Departemen</li>
                             <li>Perusahaan</li>
                         </ul>
                     </div>
                     <div class="mb-5">
                         <h2 class="mb-2 text-sm font-semibold text-gray-900 dark:text-white">User yang ditugaskan:</h2>
                         <ul class="max-w-md space-y-1 list-disc list-inside text-sm">
                             <li>Kemal</li>
                             <li>Kamal</li>
                             <li>Kamil</li>
                         </ul>
                     </div>
                 </div>
     
             </template>

             <!-- form tahap kedua -->
              <template v-else-if="currentStep == 2">
                  <p>yoo ini tahap kedua 222222</p>
              </template>
             
              <!-- form tahap ketiga -->
              <template v-else-if="currentStep == 3">
                  <p>yoo ini tahap ketiga 333333</p>
              </template>

         </div>
         
        <div class="flex justify-between mb-8">
            <!-- Tombol "Sebelumnya" -->
            <button 
                type="button"
                class="w-5/12 text-white bg-gray-500 hover:bg-gray-600 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-base px-5 py-2.5 text-center inline-flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                @click="prevStep">
                <CircleArrowLeft class="fill-current w-5 mr-2 mt-1" />
                Sebelumnya
            </button>

            <!-- Tombol "Lanjut" -->
            <button 
                type="button"
                class="w-5/12 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-base px-5 py-2.5 text-center inline-flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                @click="nextStep"
                >
                Lanjut
                <CircleArrowRight class="fill-current w-5 ml-2 mt-1" />
            </button>
        </div>
        
    </div>

</template>