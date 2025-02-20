<script setup>
import { inject } from 'vue';
import SopDocTemplate from './SopDocTemplate.vue';

const layoutType = inject('layoutType');
layoutType.value = null;

// Contoh data tahapan SOP
const sopSteps = [
  {
    id_step: 1,
    id_next_step_if_no: null,
    id_next_step_if_yes: null,
    seq_number: 1,
    name: 'Mengisi formulir permohonan KP',
    type: 'terminator',
    id_implementer: 1,
    fittings: 'Formulir permohonan KP, transkrip nilai, proposal KP',
    time: 5,
    time_unit: "h",
    output: 'Penyerahan kelengkapan ke pihak departemen',
    description: 'hehehe'
  },
  {
    id_step: 2,
    id_next_step_if_no: 1,
    id_next_step_if_yes: 3,
    seq_number: 2,
    name: 'Peninjauan permohonan KP',
    type: 'decision',
    id_implementer: 2,
    fittings: 'Formulir permohonan KP, transkrip nilai, proposal KP',
    time: 1,
    time_unit: "h",
    output: 'Disposisi',
    description: 'jajajajja'
  },
  {
    id_step: 3,
    id_next_step_if_no: null,
    id_next_step_if_yes: null,
    seq_number: 3,
    name: 'Pelaksanaan KP',
    type: 'process',
    id_implementer: 3,
    fittings: 'Absensi',
    time: 40,
    time_unit: "h",
    output: 'Absensi',
    description: 'kape'
  },
  // ... tahapan lainnya
];

const implementer = [
        {
        "id": 1,
        "name": "Mahasiswa",
        "description": "orang yang belajar di perguruan tinggi",
        "sop_total": 3
    },
    {
        "id": 2,
        "name": "Departemen",
        "description": "hoho",
        "sop_total": 1
    },
    {
        "id": 3,
        "name": "Perusahaan",
        "description": "mantap",
        "sop_total": 1
    },
    {
        "id": 7,
        "name": "m",
        "description": "sa",
        "sop_total": 0
    }
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
        :implementer="implementer"
        :steps="sopSteps"
    />
</template>
