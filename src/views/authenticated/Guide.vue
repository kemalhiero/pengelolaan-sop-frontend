<script setup>
import { inject, onMounted } from 'vue'
import { initAccordions } from 'flowbite';

import AngleIcon from '@/assets/icons/AngleIcon.vue';
import PageTitle from '@/components/authenticated/PageTitle.vue';

const layoutType = inject('layoutType');
layoutType.value = 'admin';

const dataGuide = [
    {
        q: "Apa itu SIPP?",
        a: "SIPP merupakan singkatan dari Sistem Informasi Pengelolaan Prosedur, yang merupakan aplikasi berbasis web untuk mengelola berbagai dokumen POS (Prosedur Operasional Standar) di Departemen Sistem Informasi, Universitas Andalas."
    },
    {
        q: "Apa tujuan dari sistem ini?",
        a: "Sistem ini dibangun agar proses pengelolaan SOP dapat berjalan dengan lebih baik lagi, dimulai dari proses pembuatan hingga publikasi. Dengan demikian diharapkan proses bisnis yang ada di Departemen Sistem Informasi dapat berjalan lebih baik lagi."
    },
];

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
