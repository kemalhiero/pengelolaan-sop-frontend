<script setup>
import { inject } from 'vue';

import Chart from '@/components/home/Chart.vue'
import SOPTable from '@/components/home/HomeTable.vue';
import SopSearch from '@/components/home/SopSearch.vue';
import Footer from '@/components/Footer.vue';
// import Faq from '@/components/home/Faq.vue';

const layoutType = inject('layoutType');
layoutType.value = 'guest';
</script>

<template>
    <!-- Jumbotron -->
    <section class="bg-center bg-no-repeat bg-[url('/conference.jpg')] bg-gray-700 bg-blend-multiply">
        <div class="px-4 mx-auto max-w-screen-xl text-center py-24 lg:py-56">
            <h1 class="mb-4 text-4xl font-extrabold tracking-tight leading-none text-white md:text-5xl lg:text-6xl">
                Sistem Informasi Pengelolaan SOP</h1>
            <p class="mb-8 text-lg font-normal text-gray-300 lg:text-xl sm:px-16 lg:px-48">Selamat Datang di Website
                Sistem Pengelolaan SOP Departemen Sistem Informasi Unand!</p>

            <div class="flex flex-col space-y-4 sm:flex-row sm:justify-center sm:space-y-0">
                <a href="#tabel-sop"
                    class="inline-flex justify-center items-center py-3 px-5 text-base font-medium text-center text-white rounded-lg bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300">
                    Cari SOP
                    <svg class="w-3.5 h-3.5 ms-2 rotate-90" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none"
                        viewBox="0 0 14 10">
                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M1 5h12m0 0L9 1m4 4L9 9" />
                    </svg>
                </a>
            </div>

        </div>
    </section>

    <div id="tabel-sop">
        <SopSearch />
    </div>

    <!-- Grafik Statistik SOP -->
    <section class="bg-white">
        <div class="py-8 mx-auto max-w-screen-xl lg:py-16">
            <div class="grid md:grid-cols-2 gap-8">

                <div class="bg-gray-50 border border-gray-200 rounded-lg p-4 md:p-10 max-w-2xl mx-auto">
                    <h2 class="text-gray-900 text-3xl font-extrabold mb-2 text-center">Jumlah SOP pada
                        tiap unit kerja</h2>
                    <Chart />
                </div>

                <div class="bg-gray-50 border border-gray-200 rounded-lg p-4 md:p-10 max-w-2xl mx-auto">
                    <h2 class="text-gray-900 text-3xl font-extrabold mb-2 text-center">
                        Sop yang paling banyak dicari
                    </h2>
                    <!-- <p class="text-lg font-normal text-gray-500 mb-4">Static websites are now used to bootstrap lots of websites and are becoming the basis for a variety of tools that even influence both web designers and developers.</p> -->
                    <SOPTable />

                    <RouterLink to="/sop">
                        <p class="text-blue-600 hover:underline font-medium text-lg inline-flex items-center mt-10">
                            Selengkapnya
                            <svg class="w-3.5 h-3.5 ms-2" aria-hidden="true"
                                xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
                                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
                                    stroke-width="2" d="M1 5h12m0 0L9 1m4 4L9 9" />
                            </svg>
                        </p>
                    </RouterLink>

                </div>
            </div>
        </div>
    </section>

    <!-- TODO tambahkan tautan ke web-web yang ada di dsi (web dsi, web fti, web unand, web lea, ldkom, labgis, lbi) -->
    <section></section>

    <!-- <Faq/> -->

    <Footer/>

</template>
