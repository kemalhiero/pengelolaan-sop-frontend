<script setup>
import { onMounted, ref } from "vue";
import { getSop } from "@/api/sopApi";

import IconEye from "@/assets/icons/IconEye.vue";
import DataTable from "@/components/DataTable.vue";
import PulseLoading from "@/components/PulseLoading.vue";
import Error from "@/components/Error.vue";

const data = ref([]);

const fetchData = async () => {
    try {
        data.value = [];
        const result = await getSop();
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
                    table-type="other"
                    :badge-text="['Batal', 'Selesai', 'Belum Selesai']"
                >
                    <template #link>
                        <router-link to="/assignment/detail">
                            <button
                                class="text-white bg-[#2557D6] hover:bg-[#2557D6]/90 focus:ring-4 focus:ring-[#2557D6]/50 focus:outline-none font-medium rounded-lg text-sm py-2 px-3 text-center inline-flex items-center dark:focus:ring-[#2557D6]/50 me-2 mb-2"
                                title="Lihat detail dokumen">
                                <IconEye class="w-5 mr-3 fill-current" />
                                Lihat
                            </button>
                        </router-link>
                        <!-- <p v-else>-</p> -->
                    </template>
                </DataTable>
                <PulseLoading v-else-if="data.length == 0" />
            </template>
            <Error @click="fetchData" v-else/>
    </div>

</template>
