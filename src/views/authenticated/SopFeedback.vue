<script setup>
import { inject, onMounted, ref } from "vue";

import { deleteDraftFeedback, getAllDraftFeedback } from "@/api/feedbackApi";
import useToastPromise from "@/utils/toastPromiseHandler";
import DataTable from "@/components/DataTable.vue";
import PageTitle from "@/components/authenticated/PageTitle.vue";
import DeleteDataModal from "@/components/modal/DeleteDataModal.vue";

const layoutType = inject('layoutType');
layoutType.value = 'admin';

const showModalDelete = ref(false);
const selectedDeleteId = ref(null);

const openDeleteModal = (id) => {
    selectedDeleteId.value = id; // Menyimpan ID yang dipilih
    showModalDelete.value = true; // Tampilkan modal
};

const dataFeedback = ref([]);
const fetchFeedback = async () => {
    try {
        const response = await getAllDraftFeedback();
        if (response.success) {
            dataFeedback.value = response.data;
        }
    } catch (error) {
        console.error('Fetch feedback error:', error);
    }
};

const shouldShowEditButton = (item) => {
  return false; // Disable edit button for all items
};

const deleteFeedback = async (feedbackId) => {
    try {
        useToastPromise(
            new Promise((resolve, reject) => {
                deleteDraftFeedback(feedbackId)
                    .then(response => {
                        if (!response.success) {
                            throw response;
                        }
                        fetchFeedback();
                        showModalDelete.value = false;
                        resolve();
                    })
                    .catch(error => reject(error));
            }),
            {
                messages: {
                    success: 'Umpan balik berhasil dihapus!',
                },
                toastOptions: {
                    autoClose: 3000,
                },
            }
        );
    } catch (error) {
        console.error('Error deleting feedback:', error);
    }
};

onMounted(() => {
    fetchFeedback();
});
</script>

<template>
    <PageTitle judul="Umpan Balik terhadap POS yang Dikelola" class="mt-3 mb-7" />

    <div class="container mx-auto p-8 lg:px-16">
        <DataTable
            :data="dataFeedback" 
            :columns="[
                { field: 'sop_name', label: 'Nama', sortable: true, searchable: true },
                { field: 'user_name', label: 'Pengguna', sortable: true, searchable: true },
                { field: 'feedback', label: 'Umpan Balik', sortable: true, searchable: true },
                { field: 'createdAt', label: 'Waktu', sortable: true, searchable: true },
            ]" 
            @delete="openDeleteModal" 
            :edit-delete-column="true"
            :show-edit-button="shouldShowEditButton"
        />
    </div>

    <DeleteDataModal 
        :showModal="showModalDelete"
        :deleteData="deleteFeedback"
        :selectedId="selectedDeleteId"
        @update:showModal="showModalDelete = $event"
        text="Apakah anda yakin ingin menghapus umpan balik ini?"
    />
</template>
