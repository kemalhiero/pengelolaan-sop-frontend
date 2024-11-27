<script setup>
import { onMounted, ref } from "vue";
import { getSop } from "@/api/sopApi";

import CirclePlusIcon from "@/assets/icons/CirclePlusIcon.vue";
import PageTitle from "@/components/authenticated/PageTitle.vue";
import PulseLoading from "@/components/PulseLoading.vue";
import DataTable from "@/components/DataTable.vue";
import IconEye from "@/assets/icons/IconEye.vue";

const data = ref([]);

const fetchData = async () => {
    try {
        const result = await getSop();
        data.value = result.data;
    } catch (error) {
        console.error(error);
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

            <template v-if="data && data.length">
                <DataTable
                    :data="data"
                    :columns="[
                        { field: 'name', label: 'Nama', sortable: true },
                        { field: 'org_name', label: 'Organisasi', sortable: true },
                    ]"
                    :status-columns="[
                        { field: 'is_active', label: 'Status' }
                    ]"
                    :searchable="['name', 'org_name']"
                    table-type="other"
                >
                    <template #link>
                        <router-link :to="{ name: 'SopDocDetail' }">
                            <button
                                class="text-white bg-[#2557D6] hover:bg-[#2557D6]/90 focus:ring-4 focus:ring-[#2557D6]/50 focus:outline-none font-medium rounded-lg text-sm py-2 px-3 text-center inline-flex items-center dark:focus:ring-[#2557D6]/50 me-2 mb-2"
                                title="Lihat detail dokumen">
                                <IconEye class="w-5 mr-3 fill-current" />
                                Lihat
                            </button>
                        </router-link>
                    </template>
                </DataTable>
            </template>
            <PulseLoading v-else />
        </div>

    </main>
</template>