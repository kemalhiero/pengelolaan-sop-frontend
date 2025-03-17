<script setup>
import { computed, inject } from 'vue';
import SopDocTemplate from '@/components/sop/SopDocTemplate.vue';
import SopBpmnTemplate from '@/components/sop/SopBpmnTemplate.vue';
import Divider from '@/components/Divider.vue';

const picInfo = inject('picData');
const { formData } = inject('sopFormData');
const sopStepRaw = inject('sopStep');
const sopStep = computed(() => [...sopStepRaw.value].sort((a, b) => a.seq_number - b.seq_number));
const hodData = inject('hodData');
</script>

<template>
    <div class="max-w-screen-xl mx-auto">
        <div class="max-w-4xl mx-auto text-center">
            <p>
                Berikut pratinjau dokumen dari data yang sudah anda masukkan sebelumnya. <br> 
                Periksa terlebih dahulu sebelum dikirim!
            </p>
        </div>

        <!-- TODO pic ganti jadi kadep -->
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

        <Divider/>

        <SopBpmnTemplate 
            :name="picInfo.name"
            :steps="sopStep" 
            :implementer="formData.implementer" 
        />
    </div>
</template>
