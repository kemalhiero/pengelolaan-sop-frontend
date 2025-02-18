<script setup>
import { inject } from 'vue';
import SopDocTemplate from './SopDocTemplate.vue';

const layoutType = inject('layoutType');
layoutType.value = null;

// Contoh data tahapan SOP
const sopSteps = [
  {
    id: 1,
    id_sop: 1,
    id_next_step_if_no: null,
    id_next_step_if_yes: 2,
    sequential_number: 1,
    activity: 'Mengisi formulir permohonan KP',
    type: 'start-end',
    implementer: 'Mahasiswa',
    fittings: 'Formulir permohonan KP, transkrip nilai, proposal KP',
    time: '5 menit',
    output: 'Penyerahan kelengkapan ke pihak departemen',
    description: 'i can see right through'
  },
  {
    id: 2,
    id_sop: 1,
    id_next_step_if_no: 1,
    id_next_step_if_yes: 3,
    sequential_number: 2,
    activity: 'Peninjauan permohonan KP',
    type: 'decision',
    implementer: 'Departemen',
    fittings: 'Formulir permohonan KP, transkrip nilai, proposal KP',
    time: '1 hari',
    output: 'Disposisi',
    description: 'jajajajja'
  },
  // ... tahapan lainnya
];

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
        :implementer="[
            'Mahasiswa', 'Departemen', 'Perusahaan'
        ]"
        :steps="sopSteps"
    />
</template>
