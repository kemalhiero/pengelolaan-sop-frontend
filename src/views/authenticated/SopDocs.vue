<script setup>
import { inject, onMounted, ref } from "vue";
import { getManagedSop } from "@/api/sopApi";

import CirclePlusIcon from "@/assets/icons/CirclePlusIcon.vue";
import PageTitle from "@/components/authenticated/PageTitle.vue";
import DataTable from "@/components/DataTable.vue";
import Error from "@/components/Error.vue";
import TableSkeleton from "@/components/TableSkeleton.vue";
import EmptyState from "@/components/EmptyState.vue";

const layoutType = inject('layoutType');
layoutType.value = 'admin';

const data = ref([]);
const isLoading = ref(true);
const hasError = ref(false);

const fetchData = async () => {
    try {
        isLoading.value = true;
        hasError.value = false;
        data.value = [];

        const result = await getManagedSop();
        if (!result.success) {
            hasError.value = true;
            console.error('API Error:', result.error);
            return;
        }

        if (result?.data) {
            data.value = result.data;
        }
    } catch (error) {
        console.error('Fetch error', error);
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
    <main class="p-4 md:ml-64 h-auto pt-20">

        <PageTitle judul="Daftar Dokumen SOP yang Dikelola" />

        <div class="container mx-auto p-8 lg:px-16">

            <div class="flex justify-end mb-4">
                <router-link :to="{ name: 'SopPropose' }">
                    <button
                        class="text-white bg-[#2557D6] hover:bg-[#2557D6]/90 focus:ring-4 focus:ring-[#2557D6]/50 focus:outline-none font-medium rounded-lg text-sm py-2 px-3 text-center inline-flex items-center dark:focus:ring-[#2557D6]/50 me-2 mb-2 ml-auto"
                        title="">
                        <CirclePlusIcon class="w-5 mr-3 fill-current" />
                        Tambah SOP Baru
                    </button>
                </router-link>
            </div>

            <div>
                <TableSkeleton 
                    v-if="isLoading" 
                    :columns="5" 
                    :rows="5" 
                />
                <Error 
                    v-else-if="hasError" 
                    @click="fetchData" 
                />
                <EmptyState 
                    v-else-if="!hasError && data.length === 0" 
                    title="Tidak ada data dokumen sop!"
                    message="Belum ada data dokumen sop yang tersedia saat ini" 
                    @click="fetchData" 
                />
                <DataTable v-else 
                    :data="data" 
                    :columns="[
                        { field: 'name', label: 'Nama', sortable: true, searchable: true },
                        { field: 'org_name', label: 'Organisasi', sortable: true, searchable: true },
                    ]" 
                    :status-columns="[
                        { field: 'is_active', label: 'Status' }
                    ]" 
                    :badge-text="['Tidak Berlaku', 'Berlaku', 'Belum Berlaku']" 
                    :link-column="true"
                    detail-link="/app/docs" 
                />
            </div>

        </div>

    </main>
</template>