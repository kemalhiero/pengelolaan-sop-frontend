<script setup>
import { inject } from 'vue';
import SopDocTemplate from '@/views/sop/SopDocTemplate.vue';

const picInfo = inject('picData');
const { formData } = inject('sopFormData');
</script>

<template>
    <div class="max-w-screen-xl mx-auto">
        <div class="max-w-4xl mx-auto text-center">
            <p>
                Berikut pratinjau dokumen dari data yang sudah anda masukkan sebelumnya. <br> 
                Periksa terlebih dahulu sebelum dikirim!
            </p>
        </div>
        <SopDocTemplate 
            :name="picInfo.name"
            :number="picInfo.number"
            :created-date="picInfo.creation_date"
            revision-date=""
            effective-date=""
            :pic-name="picInfo.pic.name"
            :pic-number="picInfo.pic.number"
            :organization="picInfo.organization"
            :section="formData.section"
            
            :law-basis="formData.legalBasis.map(item => item.legal)"
            :implement-qualification="formData.implementQualification"
            :related-sop="formData.relatedSop"
            :equipment="formData.equipment"
            :warning="formData.warning"
            :record-data="formData.record"
        />
    </div>
</template>
