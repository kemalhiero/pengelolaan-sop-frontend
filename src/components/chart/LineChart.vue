<script setup>
import { computed, onMounted, watch } from 'vue';
import ApexCharts from 'apexcharts';
import { toKebabCase } from '@/utils/text';

const props = defineProps({
    name: {
        type: String,
        required: true
    },
    series: {
        type: Array,
        required: true
    }
});

const xCategories = computed(() => {
    if (
        props.series.length > 0 &&
        props.series[0].data &&
        props.series[0].data.length > 0
    ) {
        // Jika item.x ada, gunakan, jika tidak, gunakan angka berurutan
        return props.series[0].data.map((item, idx) =>
            item.x !== undefined && item.x !== null ? item.x : (idx + 1).toString()
        );
    } else {
        return [];
    }
});
const chartSeries = computed(() =>
    props.series.map(serie => ({
        ...serie,
        data: serie.data.map(item => item.y)
    }))
);

let chart = null;

const options = {
    series: [],
    chart: {
        height: 380,
        maxWidth: "100%",
        type: "line",
        fontFamily: "Inter, sans-serif",
        dropShadow: {
            enabled: false,
        },
        toolbar: {
            show: false,
        },
    },
    tooltip: {
        enabled: true,
        x: {
            show: true,
        },
    },
    dataLabels: {
        enabled: false,
    },
    stroke: {
        width: 6,
    },
    grid: {
        show: true,
        strokeDashArray: 4,
        padding: {
            left: 2,
            right: 2,
            top: -26
        },
    },
    legend: {
        show: true
    },
    stroke: {
        curve: 'smooth'
    },
    xaxis: {
        categories: [],
        labels: {
            show: true,
            style: {
                fontFamily: "Inter, sans-serif",
                cssClass: 'text-xs font-normal fill-gray-500 dark:fill-gray-400'
            }
        },
        axisBorder: {
            show: false,
        },
        axisTicks: {
            show: false,
        },
    },
    yaxis: {
        show: true,
    },
};

function renderChart() {
    const el = document.getElementById(`app-line-chart-${toKebabCase(props.name)}`);
    if (el && typeof ApexCharts !== 'undefined') {
        if (chart) {
            chart.updateSeries(props.series);
        } else {
            chart = new ApexCharts(el, {
                ...options,
                series: chartSeries.value,
                xaxis: { ...options.xaxis, categories: xCategories.value }
            });
            chart.render();
        }
    }
};

onMounted(() => {
    renderChart();
});

watch(
    () => props.series,
    () => {
        renderChart();
    },
    { deep: true }
);
</script>

<template>
    <div class="mx-auto px-4 xl:w-full bg-white rounded-lg shadow p-4 md:p-6">
        <h2 class="text-gray-900 text-3xl font-extrabold mb-2 text-center">{{ props.name }}</h2>
        <div :id="`app-line-chart-${toKebabCase(props.name)}`"></div>
    </div>
</template>
