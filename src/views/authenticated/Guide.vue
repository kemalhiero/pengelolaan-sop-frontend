<script setup>
import { inject, onMounted } from 'vue'
import { initAccordions } from 'flowbite';

import { useAuthStore } from '@/stores/auth';
import AngleIcon from '@/assets/icons/AngleIcon.vue';
import PageTitle from '@/components/authenticated/PageTitle.vue';

const layoutType = inject('layoutType');
layoutType.value = 'admin';
const authStore = useAuthStore();
let dataGuide = [];

if (authStore.userRole === 'kadep') {
    dataGuide = [
        {
            q: 'Bagaimana cara Kadep menyetujui SOP yang diajukan?',
            a: 'Kadep dapat melihat daftar SOP yang menunggu persetujuan pada halaman dokumen. Klik SOP yang ingin ditinjau, baca detailnya, lalu berikan umpan balik beserta tipenya, apakah "Setujui", "Tolak" atau sekedar "Catatan" sesuai keputusan.'
        }, {
            q: 'Apakah Kadep bisa memberikan catatan revisi pada SOP?',
            a: 'Ya, Kadep dapat menambahkan catatan revisi saat memberikan umpan balik pada SOP, agar pengusul dapat memperbaiki dokumen sesuai masukan.'
        }, {
            q: 'Bagaimana Kadep memantau status SOP di departemen?',
            a: 'Kadep dapat melihat status seluruh SOP pada halaman dokumen, termasuk SOP yang sedang diproses, disetujui, atau ditolak.'
        }
    ];
} else if (authStore.userRole === 'pj') {
    dataGuide = [
        {
            q: 'Bagaimana cara PJ mengajukan SOP baru?',
            a: 'PJ dapat mengajukan SOP baru dengan mengeklik tombol "Tambah SOP" pada halaman dokumen, lalu mengisi formulir pengajuan . Pastikan semua informasi yang diperlukan sudah lengkap.'
        }, {
            q: 'Apakah PJ bisa mengedit info penugasan SOP yang sudah diajukan?',
            a: 'Masih bisa selagi SOP masih adalam tahap penyusunan.'
        }, {
            q: 'Bagaimana cara PJ melihat status SOP yang diajukan?',
            a: 'PJ dapat memantau status SOP yang diajukan pada halaman dokumen, termasuk apakah SOP sedang diproses atau sudah disetujui.'
        }
    ];
}

onMounted(() => {
    initAccordions();
});
</script>

<template>
    <PageTitle judul="Panduan Penggunaan Aplikasi" class="mt-3 mb-7" />

    <div id="accordion-guide" data-accordion="open" class="max-w-screen-lg mx-auto">
        <template v-for="(item, index) in dataGuide">
            <h2 :id="`accordion-guide-heading-${index}`">
                <button type="button"
                    :class="[
                        'flex items-center justify-between w-full p-5 font-medium border border-b-0 border-gray-200 focus:ring-4 focus:ring-gray-200 hover:bg-gray-100 gap-3',
                        index === 0 ? 'rounded-t-xl' : '',
                    ]"
                    :data-accordion-target="`#accordion-guide-body-${index}`" aria-expanded="true"
                    :aria-controls="`accordion-guide-body-${index}`">
                    <span>{{item.q}}</span>
                    <AngleIcon/>
                </button>
            </h2>
            <div :id="`accordion-guide-body-${index}`" class="hidden" :aria-labelledby="`accordion-guide-heading-${index}`">
                <div
                    class="p-5 border border-b-0 border-gray-200"
                    :class="index === dataGuide.length - 1 ? 'rounded-b-xl border-b' : ''"
                >
                    <p class="mb-2 text-gray-500"> {{item.a}} </p>
                </div>
            </div>
        </template>
    </div>
</template>
