<template>
    <div class="relative overflow-x-auto shadow-md sm:rounded-lg">
        <table class="w-full text-sm text-left text-gray-500">
            <!-- Header Skeleton -->
            <thead class="text-xs text-gray-700 uppercase bg-gray-50">
                <tr>
                    <th v-for="i in columns" :key="i" class="px-6 py-3">
                        <div class="h-4 bg-gray-200 rounded animate-pulse"></div>
                    </th>
                </tr>
            </thead>
            <!-- Body Skeleton -->
            <tbody>
                <tr v-for="row in rows" :key="row" class="bg-white border-b">
                    <td v-for="col in columns" :key="col" class="px-6 py-4">
                        <div class="h-4 bg-gray-200 rounded animate-pulse"></div>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<script setup>
defineProps({
    columns: {
        type: Number,
        default: 5
    },
    rows: {
        type: Number,
        default: 5
    }
});
</script>
