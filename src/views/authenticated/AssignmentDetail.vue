<script setup>
import CheckIcon from '@/components/icons/CheckIcon.vue';
import NumberOneCircleIcon from '@/components/icons/NumberOneCircleIcon.vue';
import NumberTwoCircleIcon from '@/components/icons/NumberTwoCircleIcon.vue';
import NumberThreeCircleIcon from '@/components/icons/NumberThreeCircleIcon.vue';
</script>

<template>

    <h2 class="text-4xl text-center my-12 font-bold">SOP Pendaftaran Kerja Praktik</h2>

    <div class="container mx-auto max-w-2xl">

        <!-- stepper -->
        <ol
            class="flex items-center justify-center w-full text-sm font-medium text-center text-gray-500 sm:text-base">
            <li
                class="flex md:w-full items-center text-blue-600 sm:after:content-[''] after:w-full after:h-1 after:border-b after:border-gray-400 after:border-1 after:hidden sm:after:inline-block after:mx-6 xl:after:mx-10 ">
                <span
                    class="flex items-center after:content-['/'] sm:after:hidden after:mx-2 after:text-gray-400">
                    <!-- <CheckIcon/> -->
                     <NumberOneCircleIcon class="mr-2"/>
                    Personal
                    <span class="hidden sm:inline-flex sm:ms-2">Info</span>
                </span>
            </li>
            <li
                class="flex md:w-full items-center after:content-[''] after:w-full after:h-1 after:border-b after:border-gray-400 after:border-1 after:hidden sm:after:inline-block after:mx-6 xl:after:mx-10 ">
                <span
                    class="flex items-center after:content-['/'] sm:after:hidden after:mx-2 after:text-gray-400">
                    <span class="me-2">2</span>
                    Account <span class="hidden sm:inline-flex sm:ms-2">Info</span>
                </span>
            </li>
            <li class="flex items-center">
                <span class="me-2">3</span>
                Confirmation
            </li>
        </ol>

        <!-- form -->
        <form class="max-w-lg mx-auto mt-8">
            <div class="mb-5">
                <label for="sop-number" class="block mb-2 text-sm font-medium text-gray-900 ">
                    Nomor
                </label>
                <input type="text" id="sop-number"
                    class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 "
                    required />
            </div>
            <div class="mb-5">
                <label for="sop-date" class="block mb-2 text-sm font-medium text-gray-900 ">
                    Tanggal    
                </label>
                <input type="text" id="sop-date"
                    class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" required />
            </div>
            <div class="mb-5">
                <label for="sop-org" class="block mb-2 text-sm font-medium text-gray-900 ">
                    Organisasi    
                </label>
                <input type="text" id="sop-org"
                    class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" required />
            </div>
            <div class="mb-5">
                <label for="sop-executor" class="block mb-2 text-sm font-medium text-gray-900 ">
                    Pelaksana    
                </label>
                <input type="text" id="sop-executor"
                    class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" required />
            </div>
            <div class="mb-5">
                <label for="sop-description" class="block mb-2 text-sm font-medium text-gray-900 ">
                    Deskripsi    
                </label>
                <textarea id="sop-description"
                    class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" required />
            </div>
            <button type="submit"
                class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center">Lanjut</button>
        </form>


    </div>


</template>