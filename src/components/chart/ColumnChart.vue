<script setup>
import { onMounted, watch } from 'vue';
import ApexCharts from 'apexcharts';
import { toKebabCase } from '@/utils/text';

const props = defineProps({
    name: {
        type: String,
        required: true
    },
    titleHover: {
        type: String,
    },
    series: {
        type: Array,
        required: true
    }
});

let chart = null;

const options = {
    series: [],
    chart: {
        type: "bar",
        height: "350px",
        fontFamily: "Inter, sans-serif",
        toolbar: {
            show: false,
        },
    },
    plotOptions: {
        bar: {
            horizontal: false,
            columnWidth: "40px",
            borderRadiusApplication: "end",
            borderRadius: 8,
        },
    },
    tooltip: {
        shared: true,
        intersect: false,
        style: {
            fontFamily: "Inter, sans-serif",
        },
    },
    states: {
        hover: {
            filter: {
                type: "darken",
                value: 1,
            },
        },
    },
    stroke: {
        show: true,
        width: 0,
        colors: ["transparent"],
    },
    grid: {
        show: false,
        strokeDashArray: 4,
        padding: {
            left: 2,
            right: 2,
            top: -14
        },
    },
    dataLabels: {
        enabled: true,
    },
    legend: {
        show: true,
    },
    xaxis: {
        floating: false,
        labels: {
            show: true,
            style: {
                fontFamily: "Inter, sans-serif",
                cssClass: 'text-xs font-normal fill-gray-500'
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
        show: false,
    },
    fill: {
        opacity: 1,
    },
};

function renderChart() {
    const el = document.getElementById(`app-column-chart-${toKebabCase(props.name)}`);
    if (el && typeof ApexCharts !== 'undefined') {
        if (chart) {
            chart.updateSeries(props.series);
        } else {
            chart = new ApexCharts(el, { ...options, series: props.series });
            chart.render();
        }
    }
}

onMounted(() => {
    renderChart();
});

watch(() => props.series, () => {
    renderChart();
}, { deep: true });
</script>

<template>
    <div class="mx-auto px-4 xl:w-full bg-white rounded-lg shadow p-4 md:p-6">
        <h2 class="text-gray-900 text-3xl font-extrabold mb-2 text-center" :title="props.titleHover">{{ props.name }}</h2>
        <div :id="`app-column-chart-${toKebabCase(props.name)}`"></div>
    </div>
</template>
