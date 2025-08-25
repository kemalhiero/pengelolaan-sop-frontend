<script setup>
import { inject, onMounted, ref } from 'vue';
import { toAcronym } from '@/utils/text';
import { useAuthStore } from '@/stores/auth';
import { getAnnualSopMakingTrend, getNominalFeedbackTopSop, getNominalSopEachOrgByStatus, getNominalUserEachRole, getMostRevisedSop, getSopOrgDistByStatus } from '@/api/dashboardApi';

import PieChart from '@/components/chart/PieChart.vue';
import ColumnChart from '@/components/chart/ColumnChart.vue';
import PageTitle from '@/components/authenticated/PageTitle.vue';
import LineChart from '@/components/chart/LineChart.vue';
import EmptyGrid from '@/components/EmptyGrid.vue';

const layoutType = inject('layoutType');
layoutType.value = 'admin';

const authStore = useAuthStore();
const nominalSop = ref([]);
const nominalUser = ref([]);
const sopMakingTrend = ref([]);
const nominalFeedback = ref([]);
const mostRevisedSop = ref([]);
const sopOrgDistByStatus = ref([]);
const orgName = ref('');

const fetchData = async () => {
    try {
        // 1. Data untuk ColumnChart (Jumlah POS Per Organisasi)
        const sopOrgRes = await getNominalSopEachOrgByStatus();
        if (
            sopOrgRes.data &&
            sopOrgRes.data.length > 0 &&
            !sopOrgRes.data.every(item =>
                Object.values(item.total_sop).every(val => val === 0)
            )
        ) {
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
        }

        // 3. Data untuk LineChart (Tren Pembuatan POS)
        const trendRes = await getAnnualSopMakingTrend();
        if (trendRes.data) {
            sopMakingTrend.value = [
                {
                    name: "Tren Pembuatan POS",
                    color: "#1A56DB",
                    data: Object.entries(trendRes.data).map(([x, y]) => ({ x, y }))
                }
            ];
        }

        // 4. Data untuk ColumnChart (Jumlah Feedback Top 8 POS)
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
        }

        // 5. Data untuk ColumnChart (POS dengan revisi terbanyak)
        const mostRevisedRes = await getMostRevisedSop();
        if (mostRevisedRes.data) {
            mostRevisedSop.value = [
                {
                    name: "Jumlah Revisi",
                    color: "#1A56DB",
                    data: mostRevisedRes.data.map(item => ({
                        x: authStore.userRole === 'kadep'
                            ? `${item.name} - ${toAcronym(item.org)}`
                            : item.name,
                        y: item.count
                    }))
                }
            ];
            orgName.value = mostRevisedRes.data[0].org;
        }

        // 6. Data untuk PieChart (Distribusi POS Organisasi per Status)
        const sopDist = await getSopOrgDistByStatus();
        if (
            sopDist.data && (
                sopDist.data.berlaku > 0 ||
                sopDist.data.tidak_berlaku > 0 ||
                sopDist.data.proses > 0
            )
        ) {
            sopOrgDistByStatus.value = [
                { name: "Berlaku", y: sopDist.data.berlaku || 0, color: "#1C64F2" },
                { name: "Tidak Berlaku", y: sopDist.data.tidak_berlaku || 0, color: "#16BDCA" },
                { name: "Sedang Proses", y: sopDist.data.proses || 0, color: "#9061F9" }
            ];
        }

    } catch (error) {
        console.error('Fetch data error', error);
    }
};

onMounted(() => {
    fetchData();
});
</script>

<template>
    <PageTitle
        :judul="`Visualisasi Data di ${authStore.userRole === 'kadep' ? 'DSI' : toAcronym(orgName)}`"
        class="mt-3 mb-7"
    />

    <div class="border-2 rounded-lg border-gray-300 mb-4">
        <template v-if="authStore.userRole === 'kadep'">
            <ColumnChart name="Jumlah POS Per Organisasi" :series="nominalSop" title-hover="Jumlah POS di seluruh organisasi di DSI" v-if="nominalSop.length > 0" />
            <EmptyGrid v-else message="Belum ada POS yang dibuat!" />
        </template>
        <template v-else>
            <ColumnChart name="POS dengan revisi terbanyak" :series="mostRevisedSop"
                v-if="mostRevisedSop[0]?.data.length > 0" title-hover="Top 8 POS yang paling banyak direvisi di organisasi anda" />
            <EmptyGrid v-else message="Belum ada POS yang dibuat!" />
        </template>
    </div>
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-4 my-4">
        <div class="border-2 rounded-lg border-gray-300">
            <LineChart name="Tren Pembuatan POS" :series="sopMakingTrend" v-if="sopMakingTrend[0]?.data.length > 0" />
            <EmptyGrid v-else message="Belum ada POS yang dibuat!" />
        </div>
        <div class="border-2 rounded-lg border-gray-300">
            <PieChart name="Jumlah User per Role" :series="nominalUser" />
        </div>
        <div class="border-2 rounded-lg border-gray-300">
            <ColumnChart name="POS dengan feedback terbanyak" :series="nominalFeedback"
                v-if="nominalFeedback[0]?.data.length > 0" title-hover="Top 8 POS yang paling banyak mendapatkan umpan balik" />
            <EmptyGrid v-else message="Belum ada POS yang mendapat feedback user!" />
        </div>
        <div class="border-2 rounded-lg border-gray-300">
            <template v-if="authStore.userRole === 'kadep'">
                <ColumnChart name="POS dengan revisi terbanyak" :series="mostRevisedSop"
                    v-if="mostRevisedSop[0]?.data.length > 0" title-hover="Top 8 POS yang paling sering direvisi di DSI" />
                <EmptyGrid v-else message="Belum ada POS yang dibuat!" />
            </template>
            <template v-else>
                <PieChart v-if="sopOrgDistByStatus.length > 0" name="Jumlah POS per Status"
                    :series="sopOrgDistByStatus" title-hover="Distribusi POS pada organisasi anda berdasarkan statusnya" />
                <EmptyGrid v-else message="Belum ada POS yang dibuat!" />
            </template>
        </div>
    </div>
</template>
