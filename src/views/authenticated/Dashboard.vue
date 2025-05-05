<script setup>
import { inject } from 'vue';
import PieChart from '@/components/chart/PieChart.vue';
import ColumnChart from '@/components/chart/ColumnChart.vue';

const layoutType = inject('layoutType');
layoutType.value = 'admin';
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
            />
        </div>
        <div class="border-2 border-dashed rounded-lg border-gray-300 dark:border-gray-600">
            <PieChart
                name="tes dashboard"
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