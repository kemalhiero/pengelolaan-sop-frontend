<script setup>
import { onMounted } from 'vue'
import { initAccordions } from 'flowbite';

import IconAngle from '@/components/icons/IconAngle.vue';

const dataFaq = [
    {
        q: "Apa itu SIPP?",
        a: "SIPP merupakan singkatan dari Sistem Informasi Pengelolaan Prosedur, yang merupakan aplikasi berbasis web untuk mengelola berbagai dokumen POS (Prosedur Operasional Standar) di Departemen Sistem Informasi, Universitas Andalas."
    },
    {
        q: "Apa tujuan dari sistem ini?",
        a: "Sistem ini dibangun agar proses pengelolaan SOP dapat berjalan dengan lebih baik lagi, dimulai dari proses pembuatan hingga publikasi. Dengan demikian diharapkan proses bisnis yang ada di Departemen Sistem Informasi dapat berjalan lebih baik lagi."
    },
    {
        q: "Bagaimana cara mengakses SOP?",
        a: "Aplikasi SIPP DSI dapat diakses dengan mengunjungi link, lalu pengguna dapat mencari SOP yang diperlukan dengan mengetikkan kata kunci berupa judul di kolom pencarian."
    },
    {
        q: "Apakah saya bisa memberikan saran terhadap SOP yang ada pada sistem ini?",
        a: "Jika anda dosen atau mahasiswa DSI Universitas Andalas, anda dapat memberikan umpan balik (kritik atau saran) dengan masuk terlebih dahulu menggunakan username dan password, lalu cari sop yang dimaksud dan ketikkan umpan balik pada kolom yang telah disediakan."
    },
]

onMounted(() => {
    initAccordions();
});
</script>

<template>

    <div class="text-center mt-16 mb-8 mx-12 lg:mx-40">
        <h1
            class="mb-4 text-3xl font-extrabold leading-none tracking-tight text-gray-900 md:text-4xl lg:text-5xl dark:text-white">
            Frequently Asked Question</h1>
        <p class="text-lg font-normal lg:text-xl sm:px-16 xl:px-48">
            Berikut merupakan daftar pertanyaan yang sering diajukan dalam proses pembuatan SOP di Departemen Sistem Informasi Universitas Andalas.
        </p>
    </div>

    <div id="accordion-faq" class="container mx-auto px-8 lg:px-36" data-accordion="collapse">
        <template v-for="(item, index) in dataFaq">
            <h2 :id="`accordion-faq-heading-${index}`">
                <button type="button"
                    class="flex items-center justify-between w-full py-5 font-medium border-b border-gray-200 gap-3"
                    :data-accordion-target="`#accordion-faq-body-${index}`" aria-expanded="true" aria-controls="accordion-faq-body-1">
                    <span class="text-xl text-left">{{ item.q }}</span>
                    <IconAngle />
                </button>
            </h2>
            <div :id="`accordion-faq-body-${index}`" class="hidden" :aria-labelledby="`accordion-faq-heading-${index}`">
                <div class="py-5 border-b border-gray-200">
                    <p class="mb-2">{{ item.a }}</p>
                </div>
            </div>
        </template>
    </div>

</template>