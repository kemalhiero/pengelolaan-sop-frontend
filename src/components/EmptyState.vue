<template>
    <div class="flex flex-col items-center justify-center p-8 text-center bg-white rounded-lg shadow">
        <div class="mb-4">
            <!-- Ikon folder kosong menggunakan SVG -->
            <svg class="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z">
                </path>
            </svg>
        </div>
        <h3 class="mb-2 text-xl font-medium text-gray-900">{{ title }}</h3>
        <p class="text-gray-500">{{ message }}</p>
        <button @click="$emit('click')"
            class="mt-4 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">
            Muat Ulang Data
        </button>
    </div>
</template>

<script setup>
defineProps({
    title: {
        type: String,
        default: 'Tidak ada data'
    },
    message: {
        type: String,
        default: 'Belum ada data yang tersedia saat ini'
    }
});
</script>