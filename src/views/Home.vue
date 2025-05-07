<script setup>
import { inject, onMounted, ref } from 'vue';
import { getNominalSopPerOrg, getSopDistByStatus } from '@/api/dashboardApi';

import SopSearch from '@/components/home/SopSearch.vue';
import Footer from '@/components/Footer.vue';
import Faq from '@/components/home/Faq.vue';
import ColumnChart from '@/components/chart/ColumnChart.vue';
import PieChart from '@/components/chart/PieChart.vue';

const layoutType = inject('layoutType');
layoutType.value = 'guest';

const nominalSopPerOrg = ref([]);
const sopDistbyStatus = ref([]);

const fetchData = async () => {
    try {
        const nominalSop = await getNominalSopPerOrg();
        if (!nominalSop.success) {
            console.error('API Error:', nominalSop.error);
        }
        nominalSopPerOrg.value = [
            {
                name: "Jumlah SOP Berlaku",
                color: "#1A56DB",
                data: nominalSop.data.map(item => ({
                    x: item.name,
                    y: item.total_sop
                }))
            }
        ];

        const sopDist = await getSopDistByStatus();
        if (!sopDist.success) {
            console.error('API Error:', sopDist.error);
        }
        sopDistbyStatus.value = [
            { name: "Berlaku", y: sopDist.data.berlaku || 0, color: "#1C64F2" },
            { name: "Tidak Berlaku", y: sopDist.data.tidak_berlaku || 0, color: "#16BDCA" },
            { name: "Sedang Proses", y: sopDist.data.proses || 0, color: "#9061F9" }
        ];

    } catch (error) {
        console.error('Fetch data error', error);
    }
};

onMounted(() => {
    fetchData();
})
</script>

<template>
    <!-- Jumbotron -->
    <section class="bg-center bg-cover bg-no-repeat bg-[url('/fti.webp')]  bg-blend-overlay print:hidden">
        <div class="px-4 text-center py-24 lg:py-56 bg-gradient-to-br from-blue-900/80 via-blue-900/90 to-black/80">
            <h1 class="mb-4 text-4xl font-extrabold tracking-tight leading-none text-white md:text-5xl lg:text-6xl">
                Sistem Informasi Pengelolaan SOP</h1>
            <p class="mb-8 text-lg font-normal text-white lg:text-xl sm:px-16 lg:px-48">Selamat Datang di Situs
                Sistem Pengelolaan SOP Departemen Sistem Informasi Unand!</p>

            <div class="flex flex-col space-y-4 sm:flex-row sm:justify-center sm:space-y-0">
                <a href="#tabel-sop"
                    class="inline-flex justify-center items-center py-3 px-5 text-base font-medium text-center text-white rounded-lg bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300">
                    Cari SOP
                    <svg class="w-3.5 h-3.5 ms-2 rotate-90" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"
                        fill="none" viewBox="0 0 14 10">
                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M1 5h12m0 0L9 1m4 4L9 9" />
                    </svg>
                </a>
            </div>
        </div>
    </section>

    <div id="tabel-sop" class="print-break-after-page">
        <SopSearch />
    </div>

    <!-- Grafik Statistik SOP -->
    <section class="bg-white print-break-after-page">
        <div class="py-8 mx-auto max-w-screen-xl lg:py-16">
            <div class="grid md:grid-cols-2 gap-1">
                <ColumnChart name="Jumlah SOP per Organisasi" :series="nominalSopPerOrg" />
                <PieChart name="Distribusi SOP berdasarkan status" :series="sopDistbyStatus" />
            </div>
        </div>
    </section>

    <!-- TODO tambahkan tautan ke web-web yang ada di dsi (web dsi, web fti, web unand, web lea, ldkom, labgis, lbi) -->
    <section></section>

    <Faq />

    <Footer />

</template>
