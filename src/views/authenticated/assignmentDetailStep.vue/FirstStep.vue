<script setup>
import CircleInfoIcon from '@/assets/icons/CircleInfoIcon.vue';
</script>

<template>
    <div class="max-w-2xl mx-auto">
        <div class="my-4 inline-flex items-center">
            <CircleInfoIcon class="w-5 mr-2" />
            Informasi dari Penanggung Jawab, tidak bisa diubah!
        </div>
        <div class="mb-4">
            <label for="sop-number" class="block mb-2 text-sm font-medium ">
                Nama
            </label>
            <input type="text" id="sop-number"
                class="bg-gray-50 border border-gray-300 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 "
                value="Pendaftaran Kerja Praktik" readonly />
        </div>
        <div class="grid gap-4 sm:grid-cols-2 sm:gap-5 text-black mb-4">
            <div>
                <label for="sop-number" class="block mb-2 text-sm font-medium ">
                    Nomor
                </label>
                <input type="text" id="sop-number"
                    class="bg-gray-50 border border-gray-300 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 "
                    value="T/001/UN16.17.02/OT.01.00/2024" readonly />
            </div>
            <div>
                <label for="sop-date" class="block mb-2 text-sm font-medium ">
                    Tanggal
                </label>
                <input type="text" id="sop-date"
                    class="bg-gray-50 border border-gray-300 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                    value="11/10/2024" readonly />
            </div>
            <div>
                <label for="sop-org" class="block mb-2 text-sm font-medium ">
                    Organisasi
                </label>
                <input type="text" id="sop-org"
                    class="bg-gray-50 border border-gray-300 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                    value="Departemen Sistem Informasi" readonly />
            </div>
            <div>
                <label for="sop-pic" class="block mb-2 text-sm font-medium ">
                    Penanggung Jawab
                </label>
                <input type="text" id="sop-pic"
                    class="bg-gray-50 border border-gray-300 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                    value="Husnil Kamil" readonly />
            </div>
        </div>
        <div class="mb-5">
            <label for="sop-description" class="block mb-2 text-sm font-medium ">
                Deskripsi
            </label>
            <textarea id="sop-description"
                class="bg-gray-50 border border-gray-300 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 h-48">Lorem ipsum dolor sit amet consectetur adipisicing elit. Assumenda incidunt dolores veniam molestias doloribus voluptatem itaque fugiat commodi quibusdam voluptate eveniet quo eligendi, laudantium cupiditate obcaecati quaerat praesentium a labore reiciendis, aut cumque! Exercitationem ea quaerat iure quae dolorem, temporibus perferendis aperiam ducimus nemo dolor harum reiciendis atque? Vitae, ipsum.</textarea>
        </div>
        <div class="grid gap-4 sm:grid-cols-2 sm:gap-6 text-black">
            <div class="mb-5">
                <h2 class="mb-2 text-sm font-semibold text-gray-900 dark:text-white">Pelaksana:</h2>
                <ul class="max-w-md space-y-1 list-disc list-inside text-sm">
                    <li>Mahasiswa</li>
                    <li>Departemen</li>
                    <li>Perusahaan</li>
                </ul>
            </div>
            <div class="mb-5">
                <h2 class="mb-2 text-sm font-semibold text-gray-900 dark:text-white">User yang ditugaskan:</h2>
                <ul class="max-w-md space-y-1 list-disc list-inside text-sm">
                    <li>Kemal</li>
                    <li>Kamal</li>
                    <li>Kamil</li>
                </ul>
            </div>
        </div>

        <div class="inline-flex items-center justify-center w-full">
            <hr class="w-64 h-1 my-8 bg-gray-300 border-0 rounded">
            <div class="absolute px-4 -translate-x-1/2 bg-white left-1/2">
                <svg class="w-4 h-4 text-gray-700" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor" viewBox="0 0 18 14">
                    <path
                        d="M6 0H2a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h4v1a3 3 0 0 1-3 3H2a1 1 0 0 0 0 2h1a5.006 5.006 0 0 0 5-5V2a2 2 0 0 0-2-2Zm10 0h-4a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h4v1a3 3 0 0 1-3 3h-1a1 1 0 0 0 0 2h1a5.006 5.006 0 0 0 5-5V2a2 2 0 0 0-2-2Z" />
                </svg>
            </div>
        </div>

        <div class="my-4 inline-flex items-center">
            <CircleInfoIcon class="w-5 mr-2" />
            Form berikut wajib diisi sebagai sebagai identitas dari SOP!
        </div>

        <div class="mb-4">
            <label for="sop-section" class="block mb-2 text-sm font-medium ">
                Seksi
            </label>
            <input type="text" id="sop-section"
                class="bg-gray-50 border border-gray-300 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 "
                value="Semua Seksi di Lingkungan Departemen Sistem Informasi" />
        </div>
        <!-- <div class="mb-4">
            <label for="sop-law-basis" class="block mb-2 text-sm font-medium ">
                Dasar Hukum
            </label>
            <select class="js-example-basic-multiple" name="states[]" multiple>
                <option value="AL">Alabama</option>
                ...
                <option value="WY">Wyoming</option>
            </select>
        </div> -->

    </div>
</template>
