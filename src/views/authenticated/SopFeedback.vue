<script setup>
import { onMounted } from "vue";
import { DataTable } from "simple-datatables";

import IconSort from "@/components/icons/IconSort.vue";
import IconEye from "@/components/icons/IconEye.vue";
import GreenBadgeIndicator from "@/components/indicator/GreenBadgeIndicator.vue";
import YellowBadgeIndicator from "@/components/indicator/YellowBadgeIndicator.vue";
import RedBadgeIndicator from "@/components/indicator/RedBadgeIndicator.vue";


const data = [
    { nama: 'sepuh', umpan_balik: 'kelas king', tanggal: '2021/25/09', is_followed_up_yet: 'sudah'},
    { nama: 'donatur kampus', umpan_balik: 'kerja bagus', tanggal: '2024/25/09', is_followed_up_yet: 'belum' },
    { nama: 'kucing si', umpan_balik: 'kerja bagus', tanggal: '2024/02/09', is_followed_up_yet: 'belum' },
    { nama: 'husnil kamil', umpan_balik: 'kelas king', tanggal: '2024/01/09', is_followed_up_yet: 'sudah' },
    { nama: 'efa yonedi', umpan_balik: 'kelas king', tanggal: '2024/03/09', is_followed_up_yet: 'spam' },
    { nama: 'prabowo', umpan_balik: 'kelas king', tanggal: '2024/03/09', is_followed_up_yet: 'spam' },
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
                Umpan Balik terhadap SOP yang Dikelola
            </h1>
        </div>

        <div class="container mx-auto p-8 lg:px-32">

            <!-- <h2 class="text-4xl text-center my-6 font-bold dark:text-white">SOP Terpopuler</h2> -->

            <table id="default-table" class="mx-auto">
                <thead>
                    <tr>
                        <th>
                            <span class="flex items-center">
                                User
                                <IconSort />
                            </span>
                        </th>
                        <th data-type="date" data-format="YYYY/DD/MM">
                            <span class="flex items-center">
                                Komentar
                                <IconSort />
                            </span>
                        </th>
                        <th>
                            <span class="flex items-center">
                                Waktu
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
                        <td>{{ item.umpan_balik }}</td>
                        <td>{{ item.tanggal }}</td>
                        <td>
                            <GreenBadgeIndicator teks="Sudah ditindaklanjuti" v-if="item.is_followed_up_yet == 'sudah'" />
                            <YellowBadgeIndicator teks="Sedang diproses" v-if="item.is_followed_up_yet == 'belum'" />
                            <RedBadgeIndicator teks="Batal / Spam" v-if="item.is_followed_up_yet == 'spam'" />
                        </td>
                        <td>
                            <!-- <router-link :to="{ name: 'DetailSop' }"> -->
                                <button
                                    class="text-white bg-[#2557D6] hover:bg-[#2557D6]/90 focus:ring-4 focus:ring-[#2557D6]/50 focus:outline-none font-medium rounded-lg text-sm py-2 px-3 text-center inline-flex items-center dark:focus:ring-[#2557D6]/50 me-2 mb-2"
                                    title="Lihat detail dokumen">
                                    <IconEye class="w-5 mr-3 fill-current" />
                                    belum tau apa
                                </button>
                            <!-- </router-link> -->
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

    </main>
</template>