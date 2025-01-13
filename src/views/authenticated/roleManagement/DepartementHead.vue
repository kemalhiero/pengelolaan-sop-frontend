<script setup>
import { inject, onMounted, ref, watch } from 'vue';
import { toast } from 'vue3-toastify';

import { addHod, getHod, getHodCandidate } from '@/api/userApi';

import Error from '@/components/Error.vue';
import DataTable from '@/components/DataTable.vue';
import PulseLoading from '@/components/PulseLoading.vue';
import XMarkCloseIcon from '@/assets/icons/XMarkCloseIcon.vue';
import PageTitle from '@/components/authenticated/PageTitle.vue';
import AddDataButton from '@/components/modal/AddDataButton.vue';

const layoutType = inject('layoutType');
layoutType.value = 'admin';

const dataHod = ref([]);
const dataCandidate = ref([]);
const selectedHod = ref(null);
const showAddModal = ref(false);

const fetchCandidate = async () => {
    try {
        const result = await getHodCandidate();
        dataCandidate.value = result.data;
    } catch (error) {
        console.error('Fetch error:', error);
    }
};

const fetchHod = async () => {
    try {
        dataHod.value = [];
        const result = await getHod();
        dataHod.value = result.data;
    } catch (error) {
        console.error('Fetch error:', error);
    }
};

const submitHod = async () => {
    try {
        if (!selectedHod.value) {
            toast('Silakan pilih kepala departemen terlebih dahulu', {
                type: "warning",
                autoClose: 3000
            });
            return;
        };
        
        console.log('Mengirim data kepala departemen:', selectedHod.value);
        // Tambahkan kode untuk mengirim ke API di sini
        await addHod({
            id: selectedHod.value
        });
        fetchHod();
        fetchCandidate();

        toast('Data kepala departemen berhasil diperbarui', {
            type: "success",
            autoClose: 3000
        });
        showAddModal.value = false; // Tutup modal setelah berhasil
    } catch (error) {
        console.error('Error saat mengirim data:', error);
        toast(`Data gagal ditambahkan! <br> ${error} `, {
            type: "error",
            autoClose: 5000,
            dangerouslyHTMLString: true
        });
    }
};

watch(showAddModal, (newValue) => {
    if (!newValue) {
        selectedHod.value = ''; // Reset nilai saat modal ditutup
    }
});

onMounted(() => {
    fetchHod();
    fetchCandidate();
});
</script>

<template>
    <main class="p-4 md:ml-64 h-auto pt-20">

        <PageTitle judul="Kelola Kepala Departemen" />

        <div class="container mx-auto p-8 lg:px-16">
            
            <div class="flex justify-end mb-4">
                <AddDataButton btnLabel="Perbarui Kadep" btn-title="Perbarui kepala departemen" @click="showAddModal = true" />
            </div>

            <template v-if="dataHod">
                <DataTable v-if="dataHod.length > 0" 
                    :data="dataHod" 
                    :columns="[
                        { field: 'id_number', label: 'NIM/NIP', sortable: true },
                        { field: 'name', label: 'Nama', sortable: true },
                    ]"
                    :status-columns="[
                        { field: 'status', label: 'Status' }
                    ]"
                    :searchable="['id_number','name']" 
                    :detail-column="true" 
                    :badge-text="['Tidak menjabat', 'Sedang menjabat']" 
                />
                <PulseLoading v-else-if="dataHod.length == 0" />
            </template>
            <Error @click="fetchHod" v-else />
            
        </div>
        
    </main>

    <div v-show="showAddModal" class="fixed inset-0 z-50 flex items-center justify-center w-full h-full">
        <div class="fixed inset-0 bg-gray-800 bg-opacity-30" @click="showAddModal = false"></div>
        <div class="relative w-full max-w-2xl max-h-full">
            <!-- Modal content -->
            <div class="relative bg-white rounded-lg shadow">
                <!-- Modal header -->
                <div class="flex items-center justify-between p-4 md:p-5 border-b rounded-t">
                    <h3 class="text-xl font-medium text-gray-900">
                        Pilih user yang akan ditugaskan menjadi kadep
                    </h3>
                    <button type="button"
                        class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center"
                        @click="showAddModal = false">
                        <XMarkCloseIcon class="w-3 h-3" />
                        <span class="sr-only">Tutup</span>
                    </button>
                </div>
                <!-- Modal body -->
                <form @submit.prevent="submitHod">
                <div class="p-4 md:p-5 space-y-4">
                    <DataTable 
                        :data="dataCandidate" 
                        :columns="[
                            { field: 'id_number', label: 'NIP', sortable: true },
                            { field: 'name', label: 'Nama', sortable: true },
                        ]"
                        :searchable="['id_number', 'name']"
                        :radio-column="[
                            {field: 'id', label: 'Pilih'}
                        ]"
                        value-field="id"
                        v-model="selectedHod" 
                    />
                </div>
                <!-- Modal footer -->
                <div class="flex items-center p-4 md:p-5 space-x-3 rtl:space-x-reverse border-t border-gray-200 rounded-b">
                        <button type="submit" :disabled="!selectedHod"
                            class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center disabled:cursor-not-allowed disabled:bg-opacity-60">
                            Pilih
                        </button>
                </div>
                </form>
            </div>
        </div>
    </div>

</template>
