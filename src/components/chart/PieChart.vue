<script setup>
import { onMounted, watch, computed } from 'vue';
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

let chart = null;

// Proses data agar sesuai kebutuhan ApexCharts
const chartSeries = computed(() => props.series.map(item => item.y));
const chartLabels = computed(() => props.series.map(item => item.name));
const chartColors = computed(() => {
    // Hanya gunakan color jika ada minimal satu item yang memiliki color
    const hasColor = props.series.some(item => !!item.color);
    return hasColor ? props.series.map(item => item.color || undefined) : undefined;
});

const getOptions = () => {
    const options = {
        series: chartSeries.value,
        labels: chartLabels.value,
        chart: {
            height: 380,
            width: "100%",
            type: "pie",
        },
        stroke: {
            colors: ["white"],
            lineCap: "",
        },
        plotOptions: {
            pie: {
                labels: {
                    show: true,
                },
                size: "100%",
                dataLabels: {
                    offset: -25
                }
            },
        },
        dataLabels: {
            enabled: true,
            style: {
                fontFamily: "Inter, sans-serif",
            },
        },
        legend: {
            position: "bottom",
            fontFamily: "Inter, sans-serif",
        },
        yaxis: {
            labels: {
                formatter: function (value) {
                    return value
                },
            },
        },
        xaxis: {
            labels: {
                formatter: function (value) {
                    return value
                },
            },
            axisTicks: {
                show: false,
            },
            axisBorder: {
                show: false,
            },
        },
    };
    // Tambahkan colors hanya jika chartColors.value ada isinya
    if (chartColors.value) {
        options.colors = chartColors.value;
    }
    return options;
};

function renderChart() {
    const el = document.getElementById(`app-pie-chart-${toKebabCase(props.name)}`);
    if (el && typeof ApexCharts !== 'undefined') {
        if (chart) {
            chart.updateOptions(getOptions());
        } else {
            chart = new ApexCharts(el, getOptions());
            chart.render();
        }
    }
}

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
        <div class="py-6" :id="`app-pie-chart-${toKebabCase(props.name)}`"></div>
    </div>
</template>
