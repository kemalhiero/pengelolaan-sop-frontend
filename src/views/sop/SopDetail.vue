<script setup>
    import { ref } from 'vue';
    import MermaidDiagram from '@/components/sop/MermaidDiagram.vue';

    // Define the Mermaid diagram string
    const mermaidChart = ref(`
        flowchart TB
            %% Subgraph untuk Mahasiswa
            subgraph Mahasiswa
                A[Mengisi Formulir KP]
                B[Menyerahkan Kelengkapan ke Departemen]
                G1[Mahasiswa Menerima Surat Balasan]
                H1[Mahasiswa Menyerahkan Surat Balasan ke Perusahaan]
            end

            %% Subgraph untuk Departemen
            subgraph Departemen
                C[Peninjauan Permohonan KP]
                D1[Disposisi Permohonan KP] --> D2{Diterima?}
                I[Membuat Surat Tugas KP]
                J[Permohonan Ditolak]
            end

            %% Subgraph untuk Perusahaan
            subgraph Perusahaan
                E1[Mengirim Surat Balasan] --> F1[Surat Balasan Diterima Departemen]
            end

            %% Menyusun aktivitas dalam satu baris (misalnya, peninjauan & disposisi)
            C --> D1 & E1
            %% E1 berada di baris yang sama dengan D1

            %% Alur ke Mahasiswa
            F1 --> G1
            G1 --> H1

            %% Percabangan
            D2 -->|Ya| I
            D2 -->|Tidak| J
    `);

</script>

<template>
    
    <div class="container mx-auto px-4 max-w-screen-xl">

        <h2 class="text-4xl text-center my-12 font-bold dark:text-white">SOP Pendaftaran Kerja Praktik</h2>
    
        <div class="step-cards">
            <div class="step-card">
                <h4>Nomor SOP</h4>
                <h6 class="text-sm font-bold dark:text-white">
                    T/00213/UN16.17.02/OT.01.00/2023
                </h6>
                <!-- <h5 class="text-xl font-bold dark:text-white"></h5> -->
            </div>
            <div class="step-card">
                <h4>Tanggal Pembuatan</h4>
                <h5 class="text-xl font-bold dark:text-white">
                    18 Agustus 2022
                </h5>
            </div>
            <div class="step-card">
                <h4>Tanggal Revisi</h4>
                <h5 class="text-xl font-bold dark:text-white">
                    23 Agustus 2023
                </h5>
            </div>
            <div class="step-card">
                <h4>Tanggal Efektif</h4>
                <h5 class="text-xl font-bold dark:text-white">
                    23 Januari 2024
                </h5>
            </div>
            <div class="step-card">
                <h4>Disahkan Oleh</h4>
                <h5 class="text-lg font-bold dark:text-white">
                    Husnil Kamil, MT
                </h5>
                <p>NIP. 198201182008121002</p>
            </div>
            <div class="step-card">
                <h4>Seksi</h4>
                <h5 class="text-lg font-bold dark:text-white">
                    Semua Seksi di Lingkungan Departemen Sistem Informasi
                </h5>
            </div>
            <div class="step-card">
                <h4>Departemen</h4>
                <h5 class="text-lg font-bold dark:text-white">
                    Sistem Informasi
                </h5>
            </div>
            <div class="step-card">
                <h4>Fakultas</h4>
                <h5 class="text-lg font-bold dark:text-white">
                    Teknologi Informasi
                </h5>
            </div>
        </div>

        <MermaidDiagram :diagram="mermaidChart" />

    </div>

</template>

<style>
    .step-cards {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));  
        /* lebar kotaknya bisa diatur di kode di atas */
        gap: 20px;
        margin: 20px 0;
    }
    .step-card {
        background-color: #dfe4ea;
        padding: 20px;
        border-radius: 12px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        transition: transform 0.1s ease;
    }
    .step-card:hover {
        transform: translateY(-5px);
    }
    .step-card h4 {
        margin-bottom: 10px;
        font-size: 18px;
    }
</style>
