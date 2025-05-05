<script setup>
import { inject } from 'vue';
import PieChart from '@/components/chart/PieChart.vue';
import ColumnChart from '@/components/chart/ColumnChart.vue';

const layoutType = inject('layoutType');
layoutType.value = 'admin';

const columnSeries = [
    {
        name: "Tidak Berlaku",
        color: "#1A56DB",
        data: [
            { x: "DSI", y: 231 },
            { x: "LEA", y: 122 },
            { x: "LABGIS", y: 63 },
            { x: "LDKOM", y: 421 },
            { x: "LBI", y: 122 },
        ],
    },
    {
        name: "Berlaku",
        color: "#FDBA8C",
        data: [
            { x: "DSI", y: 232 },
            { x: "LEA", y: 113 },
            { x: "LABGIS", y: 341 },
            { x: "LDKOM", y: 224 },
            { x: "LBI", y: 522 },
        ],
    },
];

const pieSeries = [
    { name: "Berlaku", y: 232, color: "#1C64F2" },
    { name: "Tidak Berlaku", y: 231, color: "#16BDCA" },
    { name: "Kadaluarsa", y: 50, color: "#9061F9" }
];
</script>

<template>
    <div class="text-center mt-3 mb-7">
        <h1 class="text-3xl font-extrabold leading-none tracking-tight text-gray-900 lg:text-4xl dark:text-white">
            Dashboard (visualisasi data SOP)
        </h1>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-4 my-4">
        <div class="border-2 border-dashed rounded-lg border-gray-300 dark:border-gray-600">
            <ColumnChart
                name="tes dashboard"
                :series="columnSeries"
            />
        </div>
        <div class="border-2 border-dashed rounded-lg border-gray-300 dark:border-gray-600">
            <PieChart
                name="tes dashboard"
                :series="pieSeries"
            />
        </div>
    </div>
    <!-- <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <div class="border-2 border-dashed border-gray-300 rounded-lg dark:border-gray-600 h-32 md:h-64"></div>
        <div class="border-2 border-dashed rounded-lg border-gray-300 dark:border-gray-600 h-32 md:h-64"></div>
        <div class="border-2 border-dashed rounded-lg border-gray-300 dark:border-gray-600 h-32 md:h-64"></div>
        <div class="border-2 border-dashed rounded-lg border-gray-300 dark:border-gray-600 h-32 md:h-64"></div>
    </div>
    <div class="border-2 border-dashed rounded-lg border-gray-300 dark:border-gray-600 h-96 mb-4"></div>
    <div class="grid grid-cols-2 gap-4">
        <div class="border-2 border-dashed rounded-lg border-gray-300 dark:border-gray-600 h-48 md:h-72"></div>
        <div class="border-2 border-dashed rounded-lg border-gray-300 dark:border-gray-600 h-48 md:h-72"></div>
        <div class="border-2 border-dashed rounded-lg border-gray-300 dark:border-gray-600 h-48 md:h-72"></div>
        <div class="border-2 border-dashed rounded-lg border-gray-300 dark:border-gray-600 h-48 md:h-72"></div>
    </div> -->
</template>