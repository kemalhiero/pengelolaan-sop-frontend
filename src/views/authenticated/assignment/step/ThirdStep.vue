<script setup>
import { computed, inject, ref } from 'vue';
import roleAbbreviation from '@/data/roleAbbrv.json';
import SopInfoTemplate from '@/components/sop/SopInfoTemplate.vue';
import SopStepTemplate from '@/components/sop/SopStepTemplate.vue';
import SopBpmnTemplate from '@/components/sop/SopBpmnTemplate.vue';

const assignmentInfo = inject('assignmentInfo');
const { formData } = inject('sopFormData');
const sopStepRaw = inject('sopStep');
const sopStep = computed(() => [...sopStepRaw.value].sort((a, b) => a.seq_number - b.seq_number));
const activeTab = ref('document');
</script>

<template>
    <div class="max-w-screen-xl mx-auto mb-10">
        <div class="max-w-4xl mx-auto text-center print:hidden">
            <p>
                Berikut pratinjau dokumen dari data yang sudah anda masukkan sebelumnya. <br> 
                Periksa terlebih dahulu sebelum dikirim!
            </p>
        </div>

        <div class="flex justify-center my-6 print:hidden">
            <div class="inline-flex rounded-md shadow-sm" role="group">
            <button 
                @click="activeTab = 'document'" type="button" 
                class="px-4 py-2 text-sm font-medium bg-white border-2 rounded-l-lg hover:bg-gray-200 focus:z-10 focus:ring-2 focus:ring-blue-700"
                :class="activeTab === 'document' ? 'text-blue-700 border-blue-700' : 'text-gray-900 border-gray-200 hover:text-blue-700'"
            >
                Dokumen SOP
            </button>
            <button 
                @click="activeTab = 'bpmn'" type="button" 
                class="px-4 py-2 text-sm font-medium bg-white border-2 rounded-r-lg hover:bg-gray-200 focus:z-10 focus:ring-2 focus:ring-blue-700"
                :class="activeTab === 'bpmn' ? 'text-blue-700 border-blue-700' : 'text-gray-900 border-gray-200 hover:text-blue-700'"
            >
                Diagram BPMN
            </button>
            </div>
        </div>

        <div v-if="activeTab === 'document'">
            <SopInfoTemplate
                :name="assignmentInfo.name" :number="assignmentInfo.number"
                :created-date="assignmentInfo.creation_date" :revision-date="assignmentInfo.last_update_date"
                :section="formData.section" :warning="formData.warning"
                :pic-name="assignmentInfo.pic.name" :pic-number="assignmentInfo.pic.id_number"
                :pic-role="roleAbbreviation[assignmentInfo.pic_position || assignmentInfo.pic.role]"
                :law-basis="formData.legalBasis.map(item => item.legal)"
                :implement-qualification="formData.implementQualification"
                :related-sop="formData.relatedSop"
                :equipment="formData.equipment"
                :record-data="formData.record"
            />
            <div class="py-4"></div>
            <SopStepTemplate
                :implementer="formData.implementer"
                :steps="sopStep"
            />
        </div>

        <div v-else-if="activeTab === 'bpmn'">
            <SopBpmnTemplate 
                :name="assignmentInfo.name"
                :steps="sopStep" 
                :implementer="formData.implementer" 
            />
        </div>
    </div>
</template>
