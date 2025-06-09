<script setup>
import { ref, computed, watch } from 'vue';
import { useRouter } from 'vue-router';

import EyeIcon from '@/assets/icons/EyeIcon.vue';
import SortIcon from '@/assets/icons/SortIcon.vue';
import TrashCanIcon from '@/assets/icons/TrashCanIcon.vue';
import PenToSquareIcon from '@/assets/icons/PenToSquareIcon.vue';

import GreenBadgeIndicator from './indicator/GreenBadgeIndicator.vue';
import RedBadgeIndicator from './indicator/RedBadgeIndicator.vue';
import YellowBadgeIndicator from './indicator/YellowBadgeIndicator.vue';

const router = useRouter();

const props = defineProps({
    data: {
        type: Array,
        required: true
    },
    columns: {
        type: Array,
        required: true
    },

    // kolom tambahan
    statusColumns: {
        type: Array
    },
    radioColumn: {
        type: Array,
    },
    editDeleteColumn: {
        type: Boolean,
        default: false
    },
    checkColumn: {
        type: Boolean,
        default: false
    },
    detailColumn: {
        type: Boolean,
        default: false
    },
    linkColumn: {
        type: Boolean,
        default: false
    },
    otherColumn: {
        type: Boolean,
        default: false
    },
    // -------------------
    badgeText: {
        type: Array
    },
    detailLink: {
        type: String,
    },
    modelValue: {
        type: [Array, String, Number],
        default: null
    },
    valueField: {
        type: String
    },
    showDeleteButton: {
        type: Function,
        default: null,
    },
    showEditButton: {
        type: Function,
        default: null,
    },
});

const searchInput = ref('');
const searchQuery = ref('');
const currentPage = ref(1);
const itemsPerPage = ref(5);
const sortDirection = ref({});
const sortField = ref(null);

// Opsi untuk jumlah item per halaman
const itemsPerPageOptions = [5, 10, 15, 20, 25, 50, 100];

const emit = defineEmits(['edit', 'delete', 'update:modelValue']);

const selectedItems = ref(props.modelValue);

// Watch for changes in modelValue prop
watch(() => props.modelValue, (newValue) => {
    selectedItems.value = newValue;
}, { deep: true });

const toggleItem = (item) => {
    const index = selectedItems.value.findIndex(selectedItem => selectedItem.id === item.id);
    if (index === -1) {
        selectedItems.value.push(item);
    } else {
        selectedItems.value.splice(index, 1);
    }
};

const isItemSelected = (item) => {
    return selectedItems.value.some(selected => selected.id === item.id);
};

// Computed property untuk info pagination
const paginationInfo = computed(() => {
    const total = filteredAndSortedData.value.length;
    const start = (currentPage.value - 1) * itemsPerPage.value + 1;
    const end = Math.min(start + itemsPerPage.value - 1, total);
    return {
        start,
        end,
        total
    };
});

// Computed property to get searchable fields from columns
const searchableFields = computed(() => {
    return props.columns
        .filter(column => column.searchable)
        .map(column => column.field);
});

// Debounced search
let searchTimeout = null;
watch(searchInput, (newValue) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        searchQuery.value = newValue;
    }, 300);
});

// Computed property untuk filtering, sorting, dan pagination
const filteredAndSortedData = computed(() => {
    let result = props.data;

    // Apply search filter if there's a search query and searchable fields
    if (searchQuery.value && searchableFields.value.length > 0) {
        result = result.filter(item => {
            return searchableFields.value.some(field => {
                const value = item[field];
                return value && String(value)
                    .toLowerCase()
                    .includes(searchQuery.value.toLowerCase());
            });
        });
    }

    // Sort data jika ada field yang dipilih
    if (sortField.value) {
        result = [...result].sort((a, b) => {
            if (a[sortField.value] < b[sortField.value])
                return sortDirection.value[sortField.value] === 'asc' ? -1 : 1;
            if (a[sortField.value] > b[sortField.value])
                return sortDirection.value[sortField.value] === 'asc' ? 1 : -1;
            return 0;
        });
    }

    return result;
});

const paginatedData = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage.value;
    const end = start + itemsPerPage.value;
    return filteredAndSortedData.value.slice(start, end);
});

const totalPages = computed(() =>
    Math.ceil(filteredAndSortedData.value.length / itemsPerPage.value)
);

// Handler untuk perubahan items per page
const handleItemsPerPageChange = (event) => {
    itemsPerPage.value = Number(event.target.value);
    currentPage.value = 1; // Reset ke halaman pertama
};

const sortData = (field) => {
    // Jika field yang sama diklik, toggle arah sort
    if (sortField.value === field) {
        sortDirection.value[field] = sortDirection.value[field] === 'asc' ? 'desc' : 'asc';
    } else {
        // Jika field berbeda, set sebagai field sort baru dengan arah ascending
        sortField.value = field;
        sortDirection.value[field] = 'asc';
    }
};

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

// Computed property untuk menentukan halaman yang ditampilkan
const displayedPages = computed(() => {
    const total = totalPages.value;
    const current = currentPage.value;
    const pages = [];

    if (total <= 7) {
        // Jika total halaman <= 7, tampilkan semua
        for (let i = 1; i <= total; i++) {
            pages.push(i);
        }
    } else {
        // Selalu tampilkan halaman pertama
        pages.push(1);

        if (current <= 3) {
            // Jika di awal, tampilkan 1-5
            for (let i = 2; i <= 5; i++) {
                pages.push(i);
            }
            pages.push('...');
            pages.push(total);
        } else if (current >= total - 2) {
            // Jika di akhir, tampilkan 4 angka terakhir
            pages.push('...');
            for (let i = total - 4; i <= total; i++) {
                pages.push(i);
            }
        } else {
            // Di tengah, tampilkan current-2 sampai current+2
            pages.push('...');
            for (let i = current - 1; i <= current + 1; i++) {
                pages.push(i);
            }
            pages.push('...');
            pages.push(total);
        }
    }

    return pages;
});

// Fungsi untuk pindah ke halaman tertentu
const goToPage = (page) => {
    if (typeof page === 'number' && page >= 1 && page <= totalPages.value) {
        currentPage.value = page;
    }
};

const aksiPaddingClass = computed(() => {
    // Jika tidak ada data, default ke px-4
    if (!props.editDeleteColumn || !paginatedData.value.length) return 'px-4';

    // Cek apakah ada baris yang menampilkan kedua tombol
    const adaDuaTombol = paginatedData.value.some(item => {
        const showEdit = props.showEditButton ? props.showEditButton(item) : true;
        const showDelete = props.showDeleteButton ? props.showDeleteButton(item) : true;
        return showEdit && showDelete;
    });

    return adaDuaTombol ? 'px-11' : 'px-4';
});
</script>

<template>
    <div class="flex justify-between items-center mb-4">
        <input v-model="searchInput" type="text" placeholder="Cari..." class="p-2 border rounded-lg border-gray-300" />

        <!-- Items per page selector di kanan atas -->
        <div class="flex items-center">
            <select v-model="itemsPerPage" @change="handleItemsPerPageChange"
                class="p-2 border rounded-lg border-gray-300">
                <option v-for="option in itemsPerPageOptions" :key="option" :value="option">
                    {{ option }}
                </option>
            </select>
            <label class="ml-2"> item per halaman</label>
        </div>
    </div>

    <div class="relative overflow-x-auto shadow-md sm:rounded-lg">
        <table class="w-full text-sm text-left text-gray-500">
            <thead class="text-xs text-gray-900 uppercase bg-gray-50">
                <tr>
                    <th scope="col" class="p-3">No.</th>
                    <th v-for="column in columns" :key="column.field" class="p-3" scope="col">
                        <div class="flex items-center">
                            {{ column.label }}
                            <SortIcon v-if="column.sortable" @click="sortData(column.field)" class="ml-2 cursor-pointer"/>
                        </div>
                    </th>
                    <th v-for="column in statusColumns" :key="column.field" class="p-3" scope="col">
                        {{ column.label }}
                    </th>
                    <th v-for="column in radioColumn" :key="column.field" class="p-3 inline-flex justify-center" scope="col">
                        {{ column.label }}
                    </th>
                    <th v-if="checkColumn || linkColumn" class="p-3 inline-flex justify-center" scope="col">
                        Pilih
                    </th>
                    <th v-if="editDeleteColumn || otherColumn" :class="['py-3 inline-flex', aksiPaddingClass]" >
                        Aksi
                    </th>
                    <th v-if="detailColumn" class="px-4 py-3 inline-flex">
                        Detail
                    </th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(item, index) in paginatedData" :key="index" class="bg-white border-b">
                    <th scope="row" class="p-3 font-medium text-gray-900 whitespace-nowrap"> <!-- nomor urut -->
                        {{ (currentPage - 1) * itemsPerPage + index + 1 }}
                    </th>
                    <td v-for="column in columns" :key="column.field" class="p-3 text-black">
                        <template v-if="item[column.field]">
                            {{ item[column.field] }}
                        </template>
                        <template v-else>
                            -
                        </template>
                    </td>

                    <!-- kolom kostum -->
                    <td v-for="column in statusColumns" :key="column.field" class="p-3 max-w-48 text-black">
                        <GreenBadgeIndicator v-if="[1].includes(item[column.field])"
                            :teks="badgeText[item[column.field]]" />
                        <YellowBadgeIndicator v-else-if="[2, 3, 4, 5, 6, 7, 8].includes(item[column.field])"
                            :teks="badgeText[item[column.field]]" />
                        <RedBadgeIndicator v-else :teks="badgeText[item[column.field]]" />
                    </td>
                    <td v-for="column in radioColumn" :key="column.field" class="p-3 inline-flex justify-center">
                        <input type="radio" :name="column.field" :value="item[props.valueField]"
                            :checked="modelValue === item[props.valueField]"
                            @change="$emit('update:modelValue', item[props.valueField])"
                            class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500">
                    </td>
                    <td v-if="props.checkColumn == true" class="p-3 inline-flex justify-center">
                        <input type="checkbox" :checked="isItemSelected(item)" @change="toggleItem(item)"
                            class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2">
                    </td>
                    <td class="p-3 inline-flex justify-center space-x-3" v-if="props.editDeleteColumn == true">
                        <button :title="`Edit item ${index + 1}`" @click="$emit('edit', item.id)"
                            v-if="showEditButton ? showEditButton(item) : true"
                            class="px-3 py-2 h-9 text-white bg-yellow-400 rounded-lg hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:ring-opacity-50 inline-flex">
                            <PenToSquareIcon class="fill-current w-4" />
                        </button>
                        <button :title="`Hapus item ${index + 1}`" @click="$emit('delete', item.id)"
                            v-if="showDeleteButton ? showDeleteButton(item) : true"
                            class="px-3 py-2 h-9 text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 inline-flex">
                            <TrashCanIcon class="fill-current w-4" />
                        </button>
                    </td>
                    <td class="p-3 inline-flex justify-center" v-if="props.detailColumn == true">
                        <button :title="`Detail item ${index + 1}`" @click="$emit('click', item.id)"
                            class="bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-3 py-2 focus:outline-none">
                            <EyeIcon class="fill-white w-5" />
                        </button>
                    </td>
                    <td class="p-3" v-if="props.linkColumn == true">
                        <button @click="router.push({ name: detailLink, params: { id: item.id } })"
                            class="text-white bg-[#2557D6] hover:bg-[#2557D6]/90 focus:ring-4 focus:ring-[#2557D6]/50 focus:outline-none font-medium rounded-lg text-sm py-2 px-3 text-center inline-flex items-center">
                            <EyeIcon class="w-5 mr-3 fill-current" />
                            Lihat
                        </button>
                    </td>
                    <td class="p-3" v-if="props.otherColumn == true">
                        <slot name="link"></slot>
                    </td>
                    <!-- ------------ -->
                </tr>
            </tbody>
        </table>
    </div>

    <!-- Footer dengan info pagination dan navigasi -->
    <div class="mt-4 flex justify-between items-center">
        <!-- Info jumlah item di kiri -->
        <div class="text-sm text-gray-700">
            Menampilkan {{ paginationInfo.start }} sampai {{ paginationInfo.end }}
            dari {{ paginationInfo.total }} item
        </div>

        <!-- Navigasi pagination di kanan -->
        <div class="flex items-center gap-1">
            <!-- Tombol Previous -->
            <button @click="prevPage" :disabled="currentPage === 1"
                class="px-3 py-1 border rounded-lg hover:bg-gray-100"
                :class="{ 'opacity-50 cursor-not-allowed': currentPage === 1 }">
                <span class="text-sm">&lt;</span>
            </button>

            <!-- Tombol halaman -->
            <template v-for="pageNumber in displayedPages" :key="pageNumber">
                <button @click="goToPage(pageNumber)" class="px-3 py-1 border rounded-lg text-sm" :class="{
                    'bg-blue-600 text-white': currentPage === pageNumber,
                    'hover:bg-gray-100': currentPage !== pageNumber
                }">
                    {{ pageNumber }}
                </button>
            </template>

            <!-- Tombol Next -->
            <button @click="nextPage" :disabled="currentPage === totalPages"
                class="px-3 py-1 border rounded-lg hover:bg-gray-100"
                :class="{ 'opacity-50 cursor-not-allowed': currentPage === totalPages }">
                <span class="text-sm">&gt;</span>
            </button>
        </div>
    </div>
</template>