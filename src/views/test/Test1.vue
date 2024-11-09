<script setup>
import { ref, computed } from 'vue';

// State untuk pencarian dan pagination
const searchQuery = ref('');
const currentPage = ref(1);
const itemsPerPage = ref(10);

// Computed property untuk filtering dan pagination
const filteredData = computed(() => {
    return data.value.filter(item => 
        item.law_type.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        item.about.toLowerCase().includes(searchQuery.value.toLowerCase())
    );
});

const paginatedData = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage.value;
    const end = start + itemsPerPage.value;
    return filteredData.value.slice(start, end);
});

// Fungsi untuk pagination
const totalPages = computed(() => 
    Math.ceil(filteredData.value.length / itemsPerPage.value)
);

const nextPage = () => {
    if (currentPage.value < totalPages.value) {
        currentPage.value++;
    }
};

const prevPage = () => {
    if (currentPage.value > 1) {
        currentPage.value--;
    }
};
</script>

<template>
    <div class="container mx-auto p-8 lg:px-24">
        <!-- Search input -->
        <input 
            v-model="searchQuery"
            type="text"
            placeholder="Cari..."
            class="mb-4 p-2 border rounded"
        />

        <table class="w-full">
            <!-- ... header table ... -->
            <tbody>
                <tr v-for="(item, index) in paginatedData" 
                    :key="item.id_legal">
                    <!-- ... kolom-kolom ... -->
                    <td>
                        <button @click="openUpdateModal(item.id_legal)">
                            Edit
                        </button>
                        <button @click="openDeleteModal(item.id_legal)">
                            Hapus
                        </button>
                    </td>
                </tr>
            </tbody>
        </table>

        <!-- Pagination controls -->
        <div class="mt-4 flex justify-center gap-2">
            <button 
                @click="prevPage"
                :disabled="currentPage === 1"
                class="px-4 py-2 border rounded">
                Previous
            </button>
            <span>{{ currentPage }} / {{ totalPages }}</span>
            <button 
                @click="nextPage"
                :disabled="currentPage === totalPages"
                class="px-4 py-2 border rounded">
                Next
            </button>
        </div>
    </div>
</template>