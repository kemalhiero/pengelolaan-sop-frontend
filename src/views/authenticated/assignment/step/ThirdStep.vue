<script setup>
import { computed, inject, ref } from 'vue';
import SopDocTemplate from '@/components/sop/SopDocTemplate.vue';
import SopBpmnTemplate from '@/components/sop/SopBpmnTemplate.vue';
import Divider from '@/components/Divider.vue';

const picInfo = inject('picData');
const { formData } = inject('sopFormData');
const sopStepRaw = inject('sopStep');
const sopStep = computed(() => [...sopStepRaw.value].sort((a, b) => a.seq_number - b.seq_number));
const hodData = inject('hodData');
const activeTab = ref('document');
</script>

<template>
    <div class="max-w-screen-xl mx-auto">
        <div class="max-w-4xl mx-auto text-center">
            <p>
                Berikut pratinjau dokumen dari data yang sudah anda masukkan sebelumnya. <br> 
                Periksa terlebih dahulu sebelum dikirim!
            </p>
        </div>

        <div class="flex justify-center my-6">
            <div class="inline-flex rounded-md shadow-sm" role="group">
            <button 
                @click="activeTab = 'document'" 
                type="button" 
                class="px-4 py-2 text-sm font-medium bg-white border-2 rounded-l-lg hover:bg-gray-200 focus:z-10 focus:ring-2 focus:ring-blue-700"
                :class="activeTab === 'document' ? 'text-blue-700 border-blue-700' : 'text-gray-900 border-gray-200 hover:text-blue-700'"
            >
                Dokumen SOP
            </button>
            <button 
                @click="activeTab = 'bpmn'" 
                type="button" 
                class="px-4 py-2 text-sm font-medium bg-white border-2 rounded-r-lg hover:bg-gray-200 focus:z-10 focus:ring-2 focus:ring-blue-700"
                :class="activeTab === 'bpmn' ? 'text-blue-700 border-blue-700' : 'text-gray-900 border-gray-200 hover:text-blue-700'"
            >
                Diagram BPMN
            </button>
            </div>
        </div>

        <!-- TODO pic ganti jadi kadep -->
        <div v-if="activeTab === 'document'">
            <SopDocTemplate
                :name="picInfo.name"
                :number="picInfo.number"
                :created-date="picInfo.creation_date"
                revision-date=""
                effective-date=""
                
                :pic-name="hodData.name"
                :pic-number="hodData.id_number"
                :section="formData.section"
                
                :law-basis="formData.legalBasis.map(item => item.legal)"
                :implement-qualification="formData.implementQualification"
                :related-sop="formData.relatedSop"
                :equipment="formData.equipment"
                :warning="formData.warning"
                :record-data="formData.record"
                :implementer="formData.implementer"
                :steps="sopStep"
            />
        </div>

        <div v-else-if="activeTab === 'bpmn'">
            <SopBpmnTemplate 
                :name="picInfo.name"
                :steps="sopStep" 
                :implementer="formData.implementer" 
            />
        </div>

        <Divider/>

    </div>
</template>
