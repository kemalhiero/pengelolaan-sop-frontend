<script setup>
import { inject, onMounted } from "vue";
import { DataTable } from "simple-datatables";

import SortIcon from "@/assets/icons/SortIcon.vue";
import EyeIcon from "@/assets/icons/EyeIcon.vue";
import GreenBadgeIndicator from "@/components/indicator/GreenBadgeIndicator.vue";
import YellowBadgeIndicator from "@/components/indicator/YellowBadgeIndicator.vue";
import RedBadgeIndicator from "@/components/indicator/RedBadgeIndicator.vue";
import PageTitle from "@/components/authenticated/PageTitle.vue";

const layoutType = inject('layoutType');
layoutType.value = 'admin';

const data = [
    { nama: 'sepuh', umpan_balik: 'kelas king', tanggal: '2021/25/09', is_followed_up_yet: 'sudah'},
    { nama: 'donatur kampus', umpan_balik: 'kerja bagus', tanggal: '2024/25/09', is_followed_up_yet: 'belum' },
    { nama: 'kucing si', umpan_balik: 'kerja bagus', tanggal: '2024/02/09', is_followed_up_yet: 'belum' },
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

        <PageTitle judul="Umpan Balik terhadap SOP yang Dikelola" />

        <div class="container mx-auto p-8 lg:px-32">

            <!-- <h2 class="text-4xl text-center my-6 font-bold dark:text-white">SOP Terpopuler</h2> -->

            <table id="default-table" class="mx-auto">
                <thead>
                    <tr>
                        <th>
                            <span class="flex items-center">
                                User
                                <SortIcon />
                            </span>
                        </th>
                        <th data-type="date" data-format="YYYY/DD/MM">
                            <span class="flex items-center">
                                Komentar
                                <SortIcon />
                            </span>
                        </th>
                        <th>
                            <span class="flex items-center">
                                Waktu
                                <SortIcon />
                            </span>
                        </th>
                        <th>
                            <span class="flex items-center">
                                Status
                                <SortIcon />
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
                            <GreenBadgeIndicator teks="Sudah ditindaklanjuti" v-if="item.is_followed_up_yet === 'sudah'" />
                            <YellowBadgeIndicator teks="Sedang diproses" v-if="item.is_followed_up_yet === 'belum'" />
                            <RedBadgeIndicator teks="Batal / Spam" v-if="item.is_followed_up_yet === 'spam'" />
                        </td>
                        <td>
                            <!-- <router-link :to="{ name: 'DetailSop' }"> -->
                                <button
                                    class="text-white bg-[#2557D6] hover:bg-[#2557D6]/90 focus:ring-4 focus:ring-[#2557D6]/50 focus:outline-none font-medium rounded-lg text-sm py-2 px-3 text-center inline-flex items-center dark:focus:ring-[#2557D6]/50 me-2 mb-2"
                                    title="Lihat detail dokumen">
                                    <EyeIcon class="w-5 mr-3 fill-current" />
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