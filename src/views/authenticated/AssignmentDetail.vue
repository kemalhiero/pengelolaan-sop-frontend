<script setup>
import { ref } from 'vue';
import CheckIcon from '@/assets/icons/CheckIcon.vue';
import NumberOneCircleIcon from '@/assets/icons/NumberOneCircleIcon.vue';
import NumberTwoCircleIcon from '@/assets/icons/NumberTwoCircleIcon.vue';
import NumberThreeCircleIcon from '@/assets/icons/NumberThreeCircleIcon.vue';
import CircleArrowRight from '@/assets/icons/CircleArrowRight.vue';
import CircleArrowLeft from '@/assets/icons/CircleArrowLeft.vue';


import FirstStep from './assignmentDetailStep.vue/FirstStep.vue';
import SecondStep from './assignmentDetailStep.vue/SecondStep.vue';
import ThirdStep from './assignmentDetailStep.vue/ThirdStep.vue';

// State untuk mengatur langkah
const currentStep = ref(1);  // Langkah sekarang
const maxSteps = ref(3);     // Jumlah total langkah

// Fungsi untuk ke langkah berikutnya
const nextStep = () => {
    if (currentStep.value < maxSteps.value) {
        currentStep.value++;
    }
    console.log(currentStep.value)
};

// Fungsi untuk ke langkah sebelumnya
const prevStep = () => {
    if (currentStep.value > 1) {
        currentStep.value--;
    }
};

</script>

<template>
    <h2 class="text-4xl text-center my-12 font-bold">Penyusunan Dokumen SOP</h2>

    <!-- stepper -->
    <ol class="flex items-center justify-center w-full text-sm font-medium text-center text-gray-500 sm:text-base max-w-2xl mx-auto">
        <li class="flex md:w-full items-center text-blue-600 sm:after:content-[''] after:w-full after:h-1 after:border-b after:border-gray-400 after:border-1 after:hidden sm:after:inline-block after:mx-6 xl:after:mx-10 hover:cursor-pointer"
            @click="currentStep = 1" title="Informasi mengenai sop yang ditentukan oleh penanggung jawab">
            <span class="flex items-center after:content-['/'] sm:after:hidden after:mx-2 after:text-gray-400">
                <CheckIcon v-if="currentStep > 1"/>
                <NumberOneCircleIcon class="mr-2" v-else-if="currentStep == 1" />
                Informasi
                <span class="hidden sm:inline-flex sm:ms-2">SOP</span>
            </span>
        </li>
        <li class="flex md:w-full items-center after:content-[''] after:w-full after:h-1 after:border-b after:border-gray-400 after:border-1 after:hidden sm:after:inline-block after:mx-6 xl:after:mx-10 hover:cursor-pointer"
            :class="{ 'text-blue-600': currentStep === 2 }"
            @click="currentStep = 2">
            <span class="flex items-center after:content-['/'] sm:after:hidden after:mx-2 after:text-gray-400">
                <span class="me-2" v-if="currentStep < 2">2</span>
                <CheckIcon class="fill-blue-600" v-else-if="currentStep > 2"/>
                <NumberTwoCircleIcon class="mr-2 fill-blue-700" v-else="currentStep == 2" />
                Tahapan <span class="hidden sm:inline-flex sm:ms-2">SOP</span>
            </span>
        </li>
        <li class="flex items-center hover:cursor-pointer"
            :class="{ 'text-blue-600': currentStep === 3 }"
            @click="currentStep = 3">
            <span class="me-2" v-if="currentStep < 3">3</span>
            <NumberThreeCircleIcon class="mr-2 fill-blue-600" v-else-if="currentStep == 3" />
            Pratinjau
        </li>
    </ol>

    <!-- tampilan data -->
    <div class="my-8 px-6 md:px-0">

        <!-- form tahap pertama -->
        <FirstStep v-if="currentStep == 1"  />

        <!-- form tahap kedua -->
        <SecondStep  v-else-if="currentStep == 2"/>

        <!-- form tahap ketiga -->
        <ThirdStep  v-else-if="currentStep == 3" />

    </div>

    <div class="flex justify-between mb-8 px-6 max-w-2xl mx-auto">
        <!-- Tombol "Sebelumnya" -->
        <button type="button" :disabled="currentStep == 1"
            class="w-5/12 text-white bg-gray-500 hover:bg-gray-600 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-base px-5 py-2.5 text-center inline-flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            @click="prevStep">
            <CircleArrowLeft class="fill-current w-5 mr-2 mt-1" />
            Sebelumnya
        </button>

        <!-- Tombol "Lanjut" -->
        <button type="button"
            class="w-5/12 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-base px-5 py-2.5 text-center inline-flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            @click="nextStep">
            <p v-if="currentStep == 3">Kirim</p>
            <p v-else>Lanjut</p>
            <CircleArrowRight class="fill-current w-5 ml-2 mt-1" />
        </button>
    </div>

</template>
