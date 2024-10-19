<script setup>
const data = [
    { nama: 'Departemen Sistem Informasi', pj: 'Husnil Kamil', lvl: 'Departemen', ket: 'demi apa? demikian~' },
    { nama: 'Labor Dasar Komputasi', pj: 'Jefril Rahmadoni', lvl: 'Labor', ket: '-' },
    { nama: 'Labor Enterprise Application', pj: 'Adi Arga', lvl: 'Labor', ket: '-' },
    { nama: 'Labor Geographic Information System', pj: 'Surya Afnarius', lvl: 'Labor', ket: '-' },
    { nama: 'Labor Business Intellegence', pj: 'Dwi Welly', lvl: 'Labor', ket: '-' },
]
</script>

<template>
    <main class="p-4 md:ml-64 h-auto pt-20">

        <div class="text-center mt-3 mb-7">
            <h1 class="text-3xl font-extrabold leading-none tracking-tight text-gray-900 lg:text-4xl dark:text-white">
                Daftar Organisasi yang Dikelola
            </h1>
        </div>

        <div class="container mx-auto p-8 lg:px-32">
            <div class="relative overflow-x-auto shadow-md sm:rounded-lg">
                <table class="w-full text-sm text-left text-gray-500">
                    <thead class="text-xs text-gray-900 uppercase bg-gray-50">
                        <tr>
                            <th scope="col" class="px-6 py-3">
                                Nama
                            </th>
                            <th scope="col" class="px-6 py-3">
                                Penanggung Jawab
                            </th>
                            <th scope="col" class="px-6 py-3">
                                Level
                            </th>
                            <th scope="col" class="px-6 py-3">
                                Keterangan
                            </th>
                            <th scope="col" class="px-6 py-3">
                                <span class="sr-only">Edit</span>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(item, index) in data" :key="index"
                            class="bg-white border-b">
                            <th scope="row"
                                class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                                {{ item.nama }}
                            </th>
                            <td class="px-6 py-4">
                                {{ item.pj }}
                            </td>
                            <td class="px-6 py-4">
                                {{ item.lvl }}
                            </td>
                            <td class="px-6 py-4">
                                {{ item.ket }}
                            </td>
                            <td class="px-6 py-4 text-right">
                                <a href="#"
                                    class="font-medium text-blue-600 dark:text-blue-500 hover:underline">Edit</a>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

    </main>
</template>