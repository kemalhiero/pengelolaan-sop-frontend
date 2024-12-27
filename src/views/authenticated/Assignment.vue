<script setup>
import { inject, onMounted, ref } from "vue";
import { getAssignment } from "@/api/sopApi";

import DataTable from "@/components/DataTable.vue";
import PulseLoading from "@/components/PulseLoading.vue";
import Error from "@/components/Error.vue";

const layoutType = inject('layoutType');
layoutType.value = 'guest';

const data = ref([]);

const fetchData = async () => {
    try {
        data.value = [];
        const result = await getAssignment();
        data.value = result.data;
    } catch (error) {
        data.value = null;
        console.error(error);
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

        <template v-if="data">
                <DataTable v-if="data.length > 0"
                    :data="data"
                    :columns="[
                        { field: 'name', label: 'Nama Sop', sortable: true },
                        { field: 'creation_date', label: 'Tanggal Penugasan', sortable: true },
                        { field: 'org_name', label: 'Organisasi', sortable: true },
                    ]"
                    :status-columns="[
                        { field: 'is_active', label: 'Status' }
                    ]"
                    :searchable="['name', 'creation_date', 'org_name']"
                    table-type="link"
                    detail-link="/assignment"
                    :badge-text="['Batal', 'Selesai', 'Belum Selesai']"
                />
                <PulseLoading v-else-if="data.length == 0" />
            </template>
            <Error @click="fetchData" v-else/>
    </div>

</template>
