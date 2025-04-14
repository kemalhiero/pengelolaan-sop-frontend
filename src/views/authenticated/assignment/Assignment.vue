<script setup>
import { inject, onMounted, ref } from "vue";
import { getAssignment } from "@/api/sopApi";

import DataTable from "@/components/DataTable.vue";
import Error from "@/components/Error.vue";
import TableSkeleton from "@/components/TableSkeleton.vue";
import EmptyState from "@/components/EmptyState.vue";

const layoutType = inject('layoutType');
layoutType.value = 'guest';

const data = ref([]);
const isLoading = ref(true);
const hasError = ref(false);

const fetchData = async () => {
    try {
        isLoading.value = true;
        hasError.value = false;
        data.value = [];

        const result = await getAssignment();
        if (!result.success) {
            hasError.value = true;
            console.error('API Error:', result.error);
            return;
        }

        if (result?.data) {
            data.value = result.data;
        }
    } catch (error) {
        console.error('Fetch error:', error);
        hasError.value = true;
    } finally {
        isLoading.value = false;
    }
};

onMounted(() => {
    fetchData();
})
</script>

<template>

    <div class="text-center mt-16 mb-8 mx-12 lg:mx-40">
        <h1
            class="mb-4 text-3xl font-extrabold leading-none tracking-tight text-gray-900 md:text-4xl lg:text-5xl">
            Penugasan Pembuatan / Revisi SOP</h1>
        <p class="text-lg font-normal lg:text-xl sm:px-16 xl:px-48">
            Berikut merupakan daftar tugas yang diberikan oleh penanggung jawab organisasi di lingkungan Departemen
            Sistem Informasi Universitas Andalas.
        </p>
    </div>

    <div class="container mx-auto p-8 lg:px-32">
        <div>
            <TableSkeleton 
                v-if="isLoading"
                :columns="5"
                :rows="5"
            />
            <Error v-else-if="hasError" @click="fetchData"/>
            <EmptyState 
                v-else-if="!hasError && data.length === 0"
                title="Tidak ada data tugas!"
                message="Belum ada data tugas yang tersedia saat ini"
                @click="fetchData"
            />
            <DataTable v-else
                :data="data"
                :columns="[
                    { field: 'name', label: 'Nama Sop', sortable: true, searchable: true },
                    { field: 'creation_date', label: 'Tanggal Penugasan', sortable: true, searchable: true },
                    { field: 'org_name', label: 'Organisasi', sortable: true, searchable: true },
                ]"
                :status-columns="[
                    { field: 'status', label: 'Status' }
                ]"
                :badge-text="['Batal', 'Selesai', 'Belum Selesai']"
                :link-column="true"
                detail-link="AssignmentDetail"
            />
        </div>
    </div>

</template>
