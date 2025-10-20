<script setup>
import { inject, onMounted, ref } from 'vue';
import { initAccordions } from 'flowbite';
import { getAllSop } from '@/api/sopApi';
import { getNominalSopPerOrg, getSopDistByStatus } from '@/api/dashboardApi';

import Footer from '@/components/Footer.vue';
import IconAngle from '@/assets/icons/AngleIcon.vue';
import ColumnChart from '@/components/chart/ColumnChart.vue';
import PieChart from '@/components/chart/PieChart.vue';
import EmptyGrid from '@/components/EmptyGrid.vue';
import Error from '@/components/Error.vue';
import DataTable from '@/components/DataTable.vue';
import EmptyState from '@/components/EmptyState.vue';
import TableSkeleton from '@/components/TableSkeleton.vue';

const layoutType = inject('layoutType');
layoutType.value = 'guest';

const nominalSopPerOrg = ref([]);
const sopDistbyStatus = ref([]);

const data = ref([]);
const isLoading = ref(true);
const hasError = ref(false);

const fetchChartData = async () => {
    try {
        const nominalSop = await getNominalSopPerOrg();
        if (!nominalSop.success) {
            console.error('API Error:', nominalSop.error);
        }
        nominalSopPerOrg.value = [
            {
                name: "Jumlah POS Berlaku",
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

const fetchAllSop = async () => {
    try {
        isLoading.value = true;
        hasError.value = false;
        data.value = [];

        const result = await getAllSop();
        if (!result.success) {
            hasError.value = true;
            console.error('API Error:', result.error);
            return;
        }

        if (result?.data) {
            data.value = result.data;
        }
    } catch (error) {
        console.error('Fetch data error', error);
        hasError.value = true;
    } finally {
        isLoading.value = false;
    }
};

const dataFaq = [
    {
        q: "Apa itu SIPP?",
        a: "SIPP merupakan singkatan dari Sistem Informasi Pengelolaan Prosedur, yang merupakan aplikasi berbasis web untuk mengelola berbagai dokumen POS (Prosedur Operasional Standar) di Departemen Sistem Informasi, Universitas Andalas."
    },
    {
        q: "Apa tujuan dari sistem ini?",
        a: "Sistem ini dibangun agar proses pengelolaan POS dapat berjalan dengan lebih baik lagi, dimulai dari proses pembuatan hingga publikasi. Dengan demikian diharapkan proses bisnis yang ada di Departemen Sistem Informasi dapat berjalan lebih baik lagi."
    },
    {
        q: "Bagaimana cara mengakses POS?",
        a: "Aplikasi SIPP DSI dapat diakses dengan mengunjungi link, lalu pengguna dapat mencari POS yang diperlukan dengan mengetikkan kata kunci berupa judul di kolom pencarian."
    },
    {
        q: "Apakah saya bisa memberikan saran terhadap POS yang ada pada sistem ini?",
        a: "Jika anda dosen atau mahasiswa DSI Universitas Andalas, anda dapat memberikan umpan balik (kritik atau saran) dengan masuk terlebih dahulu menggunakan username dan password, lalu cari sop yang dimaksud dan ketikkan umpan balik pada kolom yang telah disediakan."
    },
];

onMounted(() => {
    fetchChartData();
    fetchAllSop();
    initAccordions();
})
</script>

<template>
    <!-- Jumbotron -->
    <section class="bg-center bg-cover bg-no-repeat bg-[url('/fti.webp')]  bg-blend-overlay print:hidden">
        <div class="px-4 text-center py-24 lg:py-56 bg-gradient-to-br from-blue-900/80 via-blue-900/90 to-black/80">
            <h1 class="mb-4 text-4xl font-extrabold tracking-tight leading-none text-white md:text-5xl lg:text-6xl">
                Sistem Informasi Pengelolaan POS</h1>
            <p class="mb-8 text-lg font-normal text-white lg:text-xl sm:px-16 lg:px-48">Selamat Datang di
                Sistem Pengelolaan POS Departemen Sistem Informasi Unand!</p>

            <div class="flex flex-col space-y-4 sm:flex-row sm:justify-center sm:space-y-0">
                <a href="#tabel-pos"
                    class="inline-flex justify-center items-center py-3 px-5 text-base font-medium text-center text-white rounded-lg bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300">
                    Cari POS
                    <svg class="w-3.5 h-3.5 ms-2 rotate-90" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"
                        fill="none" viewBox="0 0 14 10">
                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M1 5h12m0 0L9 1m4 4L9 9" />
                    </svg>
                </a>
            </div>
        </div>
    </section>

    <div class="text-center mt-16 mb-8 mx-12 lg:mx-40">
        <h1 class="mb-4 text-3xl font-extrabold leading-none tracking-tight text-gray-900 md:text-4xl lg:text-5xl">
            Prosedur Operasional Standar (POS)</h1>
        <p class="text-lg font-normal lg:text-xl sm:px-16 xl:px-48">
            Berikut merupakan daftar dokumen POS yang berlaku di lingkungan<br>
            Departemen Sistem Informasi Universitas Andalas
        </p>
    </div>

    <div class="container mx-auto p-8 lg:px-32">
        <div>
            <TableSkeleton 
                v-if="isLoading"
                :columns="5"
                :rows="5"
            />
            <Error v-else-if="hasError" @click="fetchAllSop" />
            <EmptyState 
                v-else-if="!hasError && data.length === 0"
                title="Tidak ada data sop!"
                message="Belum ada data sop yang tersedia saat ini"
                @click="fetchAllSop"
            />
            <DataTable v-else
                :data="data" 
                :columns="[
                    { field: 'name', label: 'Nama', sortable: true, searchable: true },
                    { field: 'version', label: 'Versi', sortable: true, searchable: true },
                    { field: 'effective_date', label: 'Tanggal Efektif', sortable: true, searchable: true },
                    { field: 'org_name', label: 'Organisasi', sortable: true, searchable: true },
                ]"
                :link-column="true"
                detail-link="DetailSop" 
            />
        </div>
    </div>

    <!-- Grafik Statistik POS -->
    <section class="bg-white print-break-after-page">
        <div class="py-8 mx-auto max-w-screen-xl lg:py-16">
            <div class="grid md:grid-cols-2 gap-4">
                <ColumnChart name="Jumlah POS per Organisasi" :series="nominalSopPerOrg" v-if="nominalSopPerOrg[0]?.data.length" />
                <div v-else class="border-2 border-dashed rounded-lg border-gray-300">
                    <EmptyGrid message="Belum ada POS yang dipublikasikan!" />
                </div>

                <PieChart name="Distribusi POS berdasarkan status" :series="sopDistbyStatus" v-if="sopDistbyStatus.some(item => item.y !== 0)" />
                <div v-else class="border-2 border-dashed rounded-lg border-gray-300">
                    <EmptyGrid message="Belum ada data distribusi POS!" />
                </div>
            </div>
        </div>
    </section>

    <section>
        <div class="text-center mx-12 lg:mx-40">
            <h1 class="mb-4 text-3xl font-extrabold leading-none tracking-tight text-gray-900 md:text-4xl lg:text-5xl">
                Frequently Asked Question</h1>
            <p class="text-lg font-normal lg:text-xl sm:px-16 xl:px-48">
                Berikut merupakan daftar pertanyaan yang sering diajukan dalam proses pengelolaan POS di Departemen Sistem
                Informasi Universitas Andalas.
            </p>
        </div>
        <div id="accordion-faq" class="container mx-auto px-8 lg:px-36 mb-16" data-accordion="collapse">
            <template v-for="(item, index) in dataFaq">
                <h2 :id="`accordion-faq-heading-${index}`">
                    <button type="button"
                        class="flex items-center justify-between w-full py-5 font-medium border-b border-gray-300 gap-3 px-4"
                        :data-accordion-target="`#accordion-faq-body-${index}`" aria-expanded="true"
                        aria-controls="accordion-faq-body-1">
                        <span class="text-xl text-left text-black">{{ item.q }}</span>
                        <IconAngle />
                    </button>
                </h2>
                <div :id="`accordion-faq-body-${index}`" class="hidden px-4"
                    :aria-labelledby="`accordion-faq-heading-${index}`">
                    <div class="py-5 border-b border-gray-200">
                        <p class="mb-2">{{ item.a }}</p>
                    </div>
                </div>
            </template>
        </div>
    </section>

    <Footer />

</template>
