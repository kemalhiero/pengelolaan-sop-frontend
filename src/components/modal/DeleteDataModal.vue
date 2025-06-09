<template>
    <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center w-full h-full">
        <!-- Overlay gelap -->
        <div class="fixed inset-0 bg-gray-800 bg-opacity-30" @click="closeModal"></div>

        <!-- Modal Konten -->
        <div class="relative p-4 w-full max-w-md max-h-full z-10">
            <div class="relative bg-white rounded-lg shadow">
                <button type="button" @click="closeModal"
                    class="absolute top-3 right-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 inline-flex justify-center items-center">
                    <XMarkCloseIcon class="w-3 h-3" />
                    <span class="sr-only">Tutup modal</span>
                </button>
                <div class="p-4 md:p-5 text-center">
                    <ExclamationMarkIcon class="mx-auto mb-4 text-gray-400 w-12 h-12" />
                    <h3 class="mb-5 text-lg font-normal text-gray-500">
                        {{props.text}}
                    </h3>
                    <button @click="handleDelete"
                        class="text-white bg-red-600 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm inline-flex items-center px-5 py-2.5 text-center">
                        Ya
                    </button>
                    <button @click="closeModal"
                        class="py-2.5 px-5 ms-3 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-200 focus:z-10 focus:ring-4 focus:ring-gray-100">
                        Batal
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import XMarkCloseIcon from '@/assets/icons/XMarkCloseIcon.vue';
import ExclamationMarkIcon from '@/assets/icons/ExclamationMarkIcon.vue';

const props = defineProps({
    showModal: {
        type: Boolean,
        required: true
    },
    deleteData: {
        type: Function,
        required: true
    },
    selectedId: {
        type: [Number, String]
    },
    text: {
        type: String,
        default: 'Anda yakin ingin menghapus data ini?'
    }
});

const emit = defineEmits(['update:showModal']);

const closeModal = () => {
    emit('update:showModal', false);
};

const handleDelete = () => {
    if (props.selectedId) {
        props.deleteData(props.selectedId);
    } else {
        props.deleteData();
    }
};
</script>
