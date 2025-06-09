<template>
    <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center w-full h-full">
        <!-- Overlay gelap -->
        <div class="fixed inset-0 bg-gray-800 bg-opacity-30" @click="closeModal"></div>

        <!-- Modal content -->
        <div class="relative p-4 w-full max-w-md max-h-full z-10">
            <div class="relative bg-white rounded-lg shadow">
                <!-- Modal header -->
                <div class="flex items-center justify-between p-4 md:p-5 border-b rounded-t">
                    <h3 class="text-lg font-semibold text-gray-900">
                        {{ modalTitle }}
                    </h3>
                    <button type="button" @click="closeModal"
                        class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center">
                        <XMarkCloseIcon class="w-3 h-3" />
                        <span class="sr-only">Tutup modal</span>
                    </button>
                </div>

                <!-- Modal body -->
                <form class="p-4 md:p-5" @submit.prevent="handleUpdate">
                    <div class="grid gap-4 mb-4 grid-cols-2">
                        <div :class="field.isColSpanHalf ? 'col-span-2 sm:col-span-1' : 'col-span-2'"
                            v-for="field in formFields" :key="field.id">
                            <label :for="field.id" class="block mb-2 text-sm font-medium text-gray-900">{{ field.label }}<span v-show="field.required" class="text-red-600">*</span></label>
                            <input v-if="field.type === 'text'" :type="field.type" :id="field.id"
                                v-model="formData[field.id]" :disabled="field.disabled"
                                class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-yellow-300 focus:border-yellow-300 block w-full p-2.5"
                                :placeholder="field.placeholder" :required="field.required">
                            <input v-else-if="field.type === 'number'" :type="field.type" :id="field.id"
                                v-model="formData[field.id]" :disabled="field.disabled"
                                class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-yellow-300 focus:border-yellow-300 block w-full p-2.5"
                                :placeholder="field.placeholder" :required="field.required" :min="field.min"
                                :max="field.max">
                            <textarea v-else-if="field.type === 'textarea'" :id="field.id" rows="4"
                                v-model="formData[field.id]" :disabled="field.disabled"
                                class="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-yellow-300 focus:border-yellow-300"
                                :placeholder="field.placeholder"></textarea>
                            <select v-else-if="field.type === 'select'" :id="field.id" v-model="formData[field.id]" :disabled="field.disabled"
                                class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-yellow-300 focus:border-yellow-300 block w-full p-2.5"
                                :required="field.required">
                                <option value="" disabled>{{ field.placeholder }}</option>
                                <option v-for="option in field.options" :key="option[field.optionValue]"
                                    :value="option[field.optionValue]">
                                    {{ option[field.optionLabel] }}
                                </option>
                            </select>
                        </div>
                    </div>
                    <div class="flex justify-end">
                        <button type="submit"
                            class="text-white inline-flex items-center bg-yellow-400 hover:bg-yellow-500 focus:ring-4 focus:outline-none focus:ring-yellow-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center">
                            Perbarui
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</template>

<script setup>
import XMarkCloseIcon from '@/assets/icons/XMarkCloseIcon.vue';

const props = defineProps({
    showModal: {
        type: Boolean,
        required: true
    },
    modalTitle: {
        type: String,
        required: true
    },
    formFields: {
        type: Array,
        required: true
    },
    formData: {
        type: Object,
        required: true
    },
    selectedId: {
        type: [Number, String],
        required: true
    },
    updateData: {
        type: Function,
        required: true
    }
});

const emit = defineEmits(['update:showModal']);

const closeModal = () => {
    emit('update:showModal', false);
};

const handleUpdate = () => {
    props.updateData(props.selectedId);
};
</script>
