<script setup>
    const data = [
        { nama : 'Apple MacBook Pro 17', tanggal: '15/09/2024', lembaga: 'Laptop' },
        { nama : 'Microsoft Surface Pro', tanggal: '15/09/2024', lembaga: 'Laptop' },
        { nama : 'Lenovo ThinkPad', tanggal: '15/09/2024', lembaga: 'Laptop' },
        { nama : 'Intel NUC', tanggal: '15/09/2024', lembaga: 'Mini PC' },
        { nama : 'Magic Mouse 2', tanggal: '15/09/2024', lembaga: 'Accecories' },
        { nama : 'Keychron 2', tanggal: '15/09/2024', lembaga: 'Keyboard' },
    ]
</script>

<template>
    
    <div class="relative overflow-x-auto shadow-md sm:rounded-lg max-w-md sm:max-w-lg mx-auto">
        <table class="text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400 mx-auto">
            <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                <tr>
                    <th scope="col" class="px-6 py-3">
                        Nama
                    </th>
                    <th scope="col" class="px-6 py-3">
                        Tanggal
                    </th>
                    <th scope="col" class="px-6 py-3">
                        Lembaga
                    </th>
                    <th scope="col" class="px-6 py-3">
                        <span class="sr-only">Edit</span>
                    </th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(item, index) in data" :key="index" class="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                    <th scope="row" class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                        {{ item.nama }}
                    </th>
                    <td class="px-6 py-4">
                        {{ item.tanggal }}
                    </td>
                    <td class="px-6 py-4">
                        {{ item.lembaga }}
                    </td>
                    <td class="px-6 py-4 text-right">
                        <RouterLink :to="{ name:'DetailSop' }">
                            <p class="font-medium text-blue-600 dark:text-blue-500 hover:underline">Lihat</p>
                        </RouterLink>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>

</template>
