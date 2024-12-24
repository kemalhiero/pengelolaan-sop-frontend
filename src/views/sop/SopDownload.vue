<script setup>
import { inject } from 'vue';
import SopDocTemplate from './SopDocTemplate.vue';

const layoutType = inject('layoutType');
layoutType.value = null;
</script>

<template>
    <SopDocTemplate 
        name="Prosedur Pendaftaran Kerja Praktik"
        number="T/__/UN16.17.02/OT.01.00/2023"
        created-date="18 Agustus 2023"
        revision-date=""
        effective-date="23 Januari 2023"
        pic-name="Husnil Kamil, MT"
        pic-number="198201182008121002"
        section="Semua Seksi di Lingkungan Departemen Sistem Informasi"
        
        :law-basis="[
            'Peraturan Pemerintah Nomor 95 Tahun 2021 tentang Perguruan Tinggi Negeri Badan Hukum Universitas Andalas',
            'Peraturan Rektor Universitas Andalas Nomor 8 Tahun 2022 tentang Organisasi dan Tata Kerja Organ Pengelola Universitas Andalas'
        ]"
        :implement-qualification="[
            'Memiliki Kemampuan pengolahan data sederhana',
            'Mengetahui tugas dan fungsi POS AP',
            'Menguasai operasional komputer'
        ]"
        :related-sop="[
            'POS Pelaksanaan KP', 'POS Pembatalan KP'
        ]"
        :equipment="[
            'Komputer', 'Printer', 'HDD Kesternal', 'Dokumen OTK'
        ]"
        warning="Jika POS AP ini tidak dilaksanakan, mengakibatkan terhambatnya proses kerja praktik mahasiswa."
        :record-data="[
            'Dokumen', 'Pengarsipan', 'Surat/Disposisi'
        ]"
    />
</template>
