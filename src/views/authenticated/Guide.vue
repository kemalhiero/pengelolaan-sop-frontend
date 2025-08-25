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

const commonGuide = [
    {
        q: 'Apakah ada ketentuan khusus dalam menyusun tahapan POS?',
        a: 'Setiap tahapan hanya memiliki satu komponen pada kolom pelaksana, mengikuti aktor yang menjalankan tahapan tersebut. Untuk kolom kegiatan, gunakan kalimat aktif, misalnya "Membuat Surat", "Merevisi POS", atau "Menyusun Barang". Khusus untuk tahap bertipe kuputusan/decision, kolom kegiatan harus diisi dengan pertanyaan yang memerlukan jawaban ya atau tidak, seperti "Apakah POS sudah lengkap?" atau "Apakah dokumen sudah ditandatangani?".'
    }, {
        q: 'Bagaimana cara menyusun tahapan POS?',
        a: 'Anda dapat menyusun tahapan POS dengan mengklik tombol "Tambah Tahapan" pada halaman dokumen, lalu mengisi formulir yang disediakan. Pastikan semua kolom wajib (ditandai karakter bintang (*) berwarna merah) sudah terisi.'
    }
];

if (authStore.userRole === 'kadep') {
    dataGuide = [
        {
            q: 'Bagaimana cara Kadep menyetujui POS yang diajukan?',
            a: 'Kadep dapat melihat daftar POS yang menunggu persetujuan pada halaman dokumen. Klik POS yang ingin ditinjau, baca detailnya, lalu berikan umpan balik beserta tipenya, apakah "Setujui", "Revisi" atau sekedar memberikan "Catatan" tanpa mengubah status POS.'
        }, {
            q: 'Apakah Kadep bisa memberikan catatan revisi pada POS?',
            a: 'Ya, Kadep dapat menambahkan catatan revisi saat memberikan umpan balik pada POS, agar pengusul dapat memperbaiki dokumen sesuai masukan.'
        }, {
            q: 'Bagaimana Kadep memantau status POS di departemen?',
            a: 'Kadep dapat melihat status seluruh POS pada halaman dokumen, termasuk POS yang sedang diproses, disetujui, atau sudah kadaluarsa.'
        },
        ...commonGuide
    ];
} else if (authStore.userRole === 'pj') {
    dataGuide = [
        {
            q: 'Bagaimana cara PJ mengajukan POS baru?',
            a: 'PJ dapat mengajukan POS baru dengan mengeklik tombol "Tambah POS" pada halaman dokumen, lalu mengisi formulir pengajuan. Pastikan semua informasi yang diperlukan sudah lengkap.'
        }, {
            q: 'Apakah PJ bisa mengedit info penugasan POS yang sudah diajukan?',
            a: 'Masih bisa selagi POS masih dalam tahap penyusunan.'
        }, {
            q: 'Bagaimana cara PJ melihat status POS yang diajukan?',
            a: 'PJ dapat memantau status POS yang diajukan pada halaman dokumen, termasuk apakah POS sedang diproses atau sudah disetujui. Perlu diketahui bahwa POS yang ditampilkan hanya POS yang ada di organisasi masing-masing.'
        }, {
            q: 'Bagaimana cara PJ menyetujui dan mengesahkan POS untuk organisasinya (selain DSI)?',
            a: 'PJ dapat melihat daftar POS yang menunggu persetujuan pada halaman dokumen. Klik POS yang ingin ditinjau, baca detailnya, lalu berikan umpan balik "Setujui". Jika disetujui, PJ akan diarahkan ke halaman pengesahan untuk menandatangani dan mengesahkan POS tersebut.'
        },
        ...commonGuide
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
                    <span class="font-semibold">{{item.q}}</span>
                    <AngleIcon/>
                </button>
            </h2>
            <div :id="`accordion-guide-body-${index}`" class="hidden" :aria-labelledby="`accordion-guide-heading-${index}`">
                <div
                    class="p-5 border border-b-0 border-gray-200"
                    :class="index === dataGuide.length - 1 ? 'rounded-b-xl border-b' : ''"
                >
                    <p class="font-normal"> {{item.a}} </p>
                </div>
            </div>
        </template>
    </div>
</template>
