<script setup>
import { onMounted } from 'vue';
import ApexCharts from 'apexcharts';
import { toKebabCase } from '@/utils/text';

const props = defineProps({
    name: {
        type: String,
        required: true
    },
});

const options = {
        series: [52.8, 26.8, 20],
        colors: ["#1C64F2", "#16BDCA", "#9061F9"],
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
        labels: ["Berlaku", "Sedang Disusun", "Kadaluarsa"],
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
                    return value + "%"
                },
            },
        },
        xaxis: {
            labels: {
                formatter: function (value) {
                    return value + "%"
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

onMounted(() => {
    if (document.getElementById(`app-pie-chart-${toKebabCase(props.name)}`) && typeof ApexCharts !== 'undefined') {
        const chart = new ApexCharts(document.getElementById(`app-pie-chart-${toKebabCase(props.name)}`), options);
        chart.render();
    }
});
</script>

<template>
    <div class="mx-auto px-4 my-8 max-w-lg w-full bg-white rounded-lg shadow p-4 md:p-6">
        <h2 class="text-gray-900 text-3xl font-extrabold mb-2 text-center">{{ props.name }}</h2>
        <div class="py-6" :id="`app-pie-chart-${toKebabCase(props.name)}`"></div>
    </div>
</template>
