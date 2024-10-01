<script setup>
import { onMounted } from 'vue'
import { initAccordions } from 'flowbite';

import IconAngle from '@/components/icons/IconAngle.vue';

onMounted(() => {
    initAccordions();
});
</script>

<template>

    <div class="text-center mt-16 mb-8 mx-12 lg:mx-40">
        <h1
            class="mb-4 text-3xl font-extrabold leading-none tracking-tight text-gray-900 md:text-4xl lg:text-5xl dark:text-white">
            Frequently Asked Question</h1>
        <p class="text-lg font-normal text-gray-500 lg:text-xl sm:px-16 xl:px-48 dark:text-gray-400">Berikut merupakan
            berbagai pertanyaan yang sering diajukan dalam proses pembuatan SOP di Departemen Sistem Informasi
            Universitas Andalas.</p>
    </div>

    <div id="accordion-faq" class="container mx-auto px-8 lg:px-36" data-accordion="collapse"
        data-active-classes="bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
        data-inactive-classes="text-gray-500 dark:text-gray-400">
        <h2 id="accordion-faq-heading-1">
            <button type="button"
                class="flex items-center justify-between w-full py-5 font-medium rtl:text-right text-gray-500 border-b border-gray-200 dark:border-gray-700 dark:text-gray-400 gap-3"
                data-accordion-target="#accordion-faq-body-1" aria-expanded="true" aria-controls="accordion-faq-body-1">
                <span class="text-xl">Apa itu SIPP?</span>
                <IconAngle />
            </button>
        </h2>
        <div id="accordion-faq-body-1" class="hidden" aria-labelledby="accordion-faq-heading-1">
            <div class="py-5 border-b border-gray-200 dark:border-gray-700">
                <p class="mb-2 text-gray-500 dark:text-gray-400">SIPP merupakan singkatan dari Sistem Informasi
                    Pengelolaan Prosedur, yang mana merupakan aplikasi berbasis web untuk mengelola berbagai dokumen POS
                    (Prosedur Operasional Standar) di Departemen Sistem Informasi, Universitas Andalas.</p>
                <p class="text-gray-500 dark:text-gray-400">Check out this guide to learn how to <a
                        href="/docs/getting-started/introduction/"
                        class="text-blue-600 dark:text-blue-500 hover:underline">get started</a> and start developing
                    websites even faster with components on top of Tailwind CSS.</p>
            </div>
        </div>
        <h2 id="accordion-faq-heading-2">
            <button type="button"
                class="flex items-center justify-between w-full py-5 font-medium rtl:text-right text-gray-500 border-b border-gray-200 dark:border-gray-700 dark:text-gray-400 gap-3"
                data-accordion-target="#accordion-faq-body-2" aria-expanded="false"
                aria-controls="accordion-faq-body-2">
                <span class="text-xl">Apa tujuan dari sistem ini?</span>
                <IconAngle />
            </button>
        </h2>
        <div id="accordion-faq-body-2" class="hidden" aria-labelledby="accordion-faq-heading-2">
            <div class="py-5 border-b border-gray-200 dark:border-gray-700">
                <p class="mb-2 text-gray-500 dark:text-gray-400">Flowbite is first conceptualized and designed using the
                    Figma software so everything you see in the library has a design equivalent in our Figma file.</p>
                <p class="text-gray-500 dark:text-gray-400">Check out the <a href="https://flowbite.com/figma/"
                        class="text-blue-600 dark:text-blue-500 hover:underline">Figma design system</a> based on the
                    utility classes from Tailwind CSS and components from Flowbite.</p>
            </div>
        </div>
        <h2 id="accordion-faq-heading-3">
            <button type="button"
                class="flex items-center justify-between w-full py-5 font-medium rtl:text-right text-gray-500 border-b border-gray-200 dark:border-gray-700 dark:text-gray-400 gap-3"
                data-accordion-target="#accordion-faq-body-3" aria-expanded="false"
                aria-controls="accordion-faq-body-3">
                <span class="text-xl">Bagaimana cara mengakses SOP?</span>
                <IconAngle />
            </button>
        </h2>
        <div id="accordion-faq-body-3" class="hidden" aria-labelledby="accordion-faq-heading-3">
            <div class="py-5 border-b border-gray-200 dark:border-gray-700">
                <p class="mb-2 text-gray-500 dark:text-gray-400">The main difference is that the core components from
                    Flowbite are open source under the MIT license, whereas Tailwind UI is a paid product. Another
                    difference is that Flowbite relies on smaller and standalone components, whereas Tailwind UI offers
                    sections of pages.</p>
                <p class="mb-2 text-gray-500 dark:text-gray-400">However, we actually recommend using both Flowbite,
                    Flowbite Pro, and even Tailwind UI as there is no technical reason stopping you from using the best
                    of two worlds.</p>
                <p class="mb-2 text-gray-500 dark:text-gray-400">Learn more about these technologies:</p>
                <ul class="ps-5 text-gray-500 list-disc dark:text-gray-400">
                    <li><a href="https://flowbite.com/pro/"
                            class="text-blue-600 dark:text-blue-500 hover:underline">Flowbite Pro</a></li>
                    <li><a href="https://tailwindui.com/" rel="nofollow"
                            class="text-blue-600 dark:text-blue-500 hover:underline">Tailwind UI</a></li>
                </ul>
            </div>
        </div>
    </div>

</template>