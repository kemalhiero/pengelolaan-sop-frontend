<template>

    <div class="container mx-auto p-8 lg:px-32">

        <!-- <h2 class="text-4xl text-center my-6 font-bold dark:text-white">SOP Terpopuler</h2> -->

        <table id="default-table" class="mx-auto">
            <thead>
                <tr>
                    <th>
                        <span class="flex items-center">
                            Nama
                            <IconSort />
                        </span>
                    </th>
                    <th data-type="date" data-format="YYYY/DD/MM">
                        <span class="flex items-center">
                            Tanggal
                            <IconSort />
                        </span>
                    </th>
                    <th>
                        <span class="flex items-center">
                            Organisasi
                            <IconSort />
                        </span>
                    </th>
                    <th>
                        <span class="flex items-center">
                            Status
                            <IconSort />
                        </span>
                    </th>
                    <th>
                        <span class="flex items-center">
                            Aksi
                        </span>
                    </th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(item, index) in data" :key="index">
                    <td class="font-medium text-gray-900 whitespace-nowrap dark:text-white">{{ item.nama }}</td>
                    <td>{{ item.tanggal }}</td>
                    <td>{{ item.organisasi }}</td>
                    <td>
                        <ApplicableIndicator v-if="item.applicable == true" />
                        <NotApplicableIndicator v-else />
                    </td>
                    <td>
                        <router-link :to="{ name: 'DetailSop' }">
                            <button
                                class="text-white bg-[#2557D6] hover:bg-[#2557D6]/90 focus:ring-4 focus:ring-[#2557D6]/50 focus:outline-none font-medium rounded-lg text-sm py-2 px-3 text-center inline-flex items-center dark:focus:ring-[#2557D6]/50 me-2 mb-2"
                                title="Lihat detail dokumen">
                                <IconEye class="w-5 mr-3 fill-current" />
                                Lihat
                            </button>
                        </router-link>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>

</template>

<script setup>

import { onMounted } from "vue";
import { DataTable } from "simple-datatables";

import IconDownload from "@/components/icons/IconDownload.vue";
import IconSort from "@/components/icons/IconSort.vue";
import IconEye from "@/components/icons/IconEye.vue";
import ApplicableIndicator from "@/components/indicator/ApplicableIndicator.vue";
import NotApplicableIndicator from "@/components/indicator/NotApplicableIndicator.vue";


const data = [
    { nama: 'SOP Bimbingan Akademik', tanggal: '2021/25/09', organisasi: 'Departemen', applicable: true },
    { nama: 'SOP Keuangan LEA', tanggal: '2024/25/09', organisasi: 'Labor', applicable: false },
    { nama: 'SOP Pengadaan Barang Habis Pakai', tanggal: '2024/02/09', organisasi: 'Labor', applicable: true },
    { nama: 'SOP Pelaksanaan Kerja Praktik', tanggal: '2024/01/09', organisasi: 'Departemen', applicable: true },
    { nama: 'SOP Pendaftaran Kerja Praktik', tanggal: '2024/03/09', organisasi: 'Departemen', applicable: true },
    { nama: 'SOP Perubahan Nilai Mata Kuliah', tanggal: '2024/03/09', organisasi: 'Departemen', applicable: false },
]

onMounted(() => {
    if (document.getElementById("default-table") && typeof DataTable !== 'undefined') {
        new DataTable(document.getElementById("default-table"), {
            searchable: true,
            sortable: true,
        });
    }
})

</script>