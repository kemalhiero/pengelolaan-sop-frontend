<script setup>
import { onMounted } from "vue";
import { DataTable } from "simple-datatables";

import IconSort from "@/components/icons/IconSort.vue";
import IconEye from "@/components/icons/IconEye.vue";
import GreenBadgeIndicator from "@/components/indicator/GreenBadgeIndicator.vue";
import RedBadgeIndicator from "@/components/indicator/RedBadgeIndicator.vue";
import CirclePlusIcon from "@/components/icons/CirclePlusIcon.vue";


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

<template>
    <main class="p-4 md:ml-64 h-auto pt-20">

        <div class="text-center mt-3 mb-7">
            <h1 class="text-3xl font-extrabold leading-none tracking-tight text-gray-900 lg:text-4xl dark:text-white">
                Daftar Dokumen SOP yang Dikelola
            </h1>
        </div>

        <div class="container mx-auto p-8 lg:px-32">

            <div class="flex justify-end mb-4">
                <router-link :to="{ name: 'SopPropose' }">
                    <button
                        class="text-white bg-[#2557D6] hover:bg-[#2557D6]/90 focus:ring-4 focus:ring-[#2557D6]/50 focus:outline-none font-medium rounded-lg text-sm py-2 px-3 text-center inline-flex items-center dark:focus:ring-[#2557D6]/50 me-2 mb-2 ml-auto"
                        title="Lihat detail dokumen">
                        <CirclePlusIcon class="w-5 mr-3 fill-current" />
                        Tambah SOP Baru
                    </button>
                </router-link>
            </div>

            <table id="default-table" class="mx-auto">
                <thead>
                    <tr>
                        <th>
                            <span class="flex items-center">
                                Nama
                                <IconSort />
                            </span>
                        </th>
                        <th data-type="date" data-format="YYYY/DD/MM" title="Tanggal Pembuatan">
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
                            <span class="flex items-center" title="Progres Pembuatan SOP">
                                Progres
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
                            <GreenBadgeIndicator teks="Berlaku" v-if="item.applicable == true" />
                            <RedBadgeIndicator teks="Tidak Berlaku" v-else />
                        </td>
                        <td>
                            <GreenBadgeIndicator teks="Sudah Siap" v-if="item.applicable == true" />
                            <RedBadgeIndicator teks="Batal" v-else />
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

    </main>
</template>