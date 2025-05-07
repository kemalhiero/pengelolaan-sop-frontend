<script setup>
import { inject, onMounted, ref } from 'vue';
import PieChart from '@/components/chart/PieChart.vue';
import ColumnChart from '@/components/chart/ColumnChart.vue';
import PageTitle from '@/components/authenticated/PageTitle.vue';
import LineChart from '@/components/chart/LineChart.vue';
import { getAnnualSopMakingTrend, getNominalFeedbackTopSop, getNominalSopEachOrgByStatus, getNominalUserEachRole, getMostRevisedSop } from '@/api/dashboardApi';
import { toAcronym } from '@/utils/text';

const layoutType = inject('layoutType');
layoutType.value = 'admin';

const nominalSop = ref([]);
const nominalUser = ref([]);
const sopMakingTrend = ref([]);
const nominalFeedback = ref([]);
const mostRevisedSop = ref([]);

const fetchData = async () => {
    try {
        // 1. Data untuk ColumnChart (Jumlah SOP Per Organisasi)
        const sopOrgRes = await getNominalSopEachOrgByStatus();
        if (sopOrgRes.data && sopOrgRes.data.length > 0) {
            const statusKeys = Object.keys(sopOrgRes.data[0].total_sop).filter(key => key !== 'total');
            const colors = ["#FDBA8C", "#1A56DB", "#16BDCA"];
            nominalSop.value = statusKeys.map((status, idx) => ({
                name: status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
                color: colors[idx % colors.length],
                data: sopOrgRes.data.map(item => ({
                    x: toAcronym(item.name),
                    y: item.total_sop[status] ?? 0
                }))
            }));
        } else {
            nominalSop.value = [];
        }

        // 2. Data untuk PieChart (Jumlah User per Role)
        const userRoleRes = await getNominalUserEachRole();
        if (userRoleRes.data) {
            const colors = ["#1C64F2", "#16BDCA", "#9061F9", "#FDBA8C", "#F59E42"];
            nominalUser.value = Object.keys(userRoleRes.data).map((key, idx) => ({
                name: key.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
                y: userRoleRes.data[key],
                color: colors[idx % colors.length]
            }));
        } else {
            nominalUser.value = [];
        }

        // 3. Data untuk LineChart (Tren Pembuatan SOP)
        const trendRes = await getAnnualSopMakingTrend();
        if (trendRes.data) {
            sopMakingTrend.value = [
                {
                    name: "Tren Pembuatan SOP",
                    color: "#1A56DB",
                    data: Object.entries(trendRes.data).map(([x, y]) => ({ x, y }))
                }
            ];
        } else {
            sopMakingTrend.value = [];
        }

        // 4. Data untuk ColumnChart (Jumlah Feedback Top 8 SOP)
        const feedbackRes = await getNominalFeedbackTopSop();
        if (feedbackRes.data) {
            nominalFeedback.value = [
                {
                    name: "Jumlah Umpan Balik Umum",
                    color: "#1A56DB",
                    data: feedbackRes.data.map(item => ({
                        x: `${item.name} - ${toAcronym(item.org)}`,
                        y: item.count
                    }))
                }
            ];
        } else {
            nominalFeedback.value = [];
        }

        // 5. Data untuk ColumnChart (SOP dengan revisi terbanyak)
        const mostRevisedRes = await getMostRevisedSop();
        if (mostRevisedRes.data) {
            mostRevisedSop.value = [
                {
                    name: "Jumlah Revisi",
                    color: "#1A56DB",
                    data: mostRevisedRes.data.map(item => ({
                        x: `${item.name} - ${toAcronym(item.org)}`,
                        y: item.count
                    }))
                }
            ];
        } else {
            mostRevisedSop.value = [];
        }

    } catch (error) {
        console.error('Fetch data error', error);
    }
};

onMounted(() => {
    fetchData();
})
</script>

<template>
    <PageTitle judul="Visualisasi Data" class="mt-3 mb-7" />

    <div class="border-2 border-dashed rounded-lg border-gray-300 mb-4">
        <ColumnChart name="Jumlah SOP Per Organisasi" :series="nominalSop" />
    </div>
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-4 my-4">
        <div class="border-2 border-dashed rounded-lg border-gray-300">
            <LineChart name="Tren Pembuatan SOP" :series="sopMakingTrend" />
        </div>
        <div class="border-2 border-dashed rounded-lg border-gray-300">
            <PieChart name="Jumlah User per Role" :series="nominalUser" />
        </div>
        <div class="border-2 border-dashed rounded-lg border-gray-300">
            <ColumnChart name="SOP dengan feedback terbanyak" :series="nominalFeedback" />
        </div>
        <div class="border-2 border-dashed rounded-lg border-gray-300">
            <ColumnChart name="SOP dengan revisi terbanyak" :series="mostRevisedSop" />
        </div>
    </div>
</template>
