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
    colors: ["#1A56DB", "#FDBA8C"],
    series: [
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
    ],
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
            columnWidth: "70%",
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
        enabled: false,
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
}

onMounted(() => {
    if (document.getElementById(`app-column-chart-${toKebabCase(props.name)}`) && typeof ApexCharts !== 'undefined') {
        const chart = new ApexCharts(document.getElementById(`app-column-chart-${toKebabCase(props.name)}`), options);
        chart.render();
    }
})

</script>

<template>
    <div class="container mx-auto px-4 my-8 max-w-lg w-full bg-white rounded-lg shadow p-4 md:p-6">
        <h2 class="text-gray-900 text-3xl font-extrabold mb-2 text-center">{{ props.name }}</h2>
        <div :id="`app-column-chart-${toKebabCase(props.name)}`"></div>
    </div>
</template>
