<script setup>
import { inject, ref } from 'vue';
import MermaidDiagram from '@/components/sop/MermaidDiagram.vue';

const layoutType = inject('layoutType');
layoutType.value = 'guest';

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

        <h2 class="text-4xl text-center my-12 font-bold">SOP Pendaftaran Kerja Praktik</h2>

        <div class="step-cards">
            <div class="step-card">
                <h4>Nomor SOP</h4>
                <h6 class="text-sm font-bold">
                    T/00213/UN16.17.02/OT.01.00/2023
                </h6>
                <!-- <h5 class="text-xl font-bold"></h5> -->
            </div>
            <div class="step-card">
                <h4>Tanggal Pembuatan</h4>
                <h5 class="text-xl font-bold">
                    18 Agustus 2022
                </h5>
            </div>
            <div class="step-card">
                <h4>Tanggal Revisi</h4>
                <h5 class="text-xl font-bold">
                    23 Agustus 2023
                </h5>
            </div>
            <div class="step-card">
                <h4>Tanggal Efektif</h4>
                <h5 class="text-xl font-bold">
                    23 Januari 2024
                </h5>
            </div>
            <div class="step-card">
                <h4>Disahkan Oleh</h4>
                <h5 class="text-lg font-bold">
                    Husnil Kamil, MT
                </h5>
                <p>NIP. 198201182008121002</p>
            </div>
            <div class="step-card">
                <h4>Seksi</h4>
                <h5 class="text-lg font-bold">
                    Semua Seksi di Lingkungan Departemen Sistem Informasi
                </h5>
            </div>
            <div class="step-card">
                <h4>Departemen</h4>
                <h5 class="text-lg font-bold">
                    Sistem Informasi
                </h5>
            </div>
            <div class="step-card">
                <h4>Fakultas</h4>
                <h5 class="text-lg font-bold">
                    Teknologi Informasi
                </h5>
            </div>
        </div>

        <!-- Sekarang kita buat 4 kotak besar dengan konten di kanan dan judul di kiri -->
        <div class="detail-cards">
            <div class="detail-card">
                <h4>Deskripsi</h4>
                <p class="">
                    Lorem ipsum dolor sit amet consectetur adipisicing elit. Libero rem eligendi dolore necessitatibus
                    molestiae deleniti. Quidem ducimus dolorum eius possimus, est suscipit natus cumque, ea consequuntur
                    aspernatur officia. Praesentium illo libero dicta minus ipsum cum, nisi aliquam illum officiis
                    deserunt sint eum nobis fugit temporibus in ad obcaecati! Quam sed nemo, praesentium voluptatibus,
                    distinctio itaque optio, ex deleniti consequuntur debitis corrupti corporis quibusdam beatae maiores
                    ducimus possimus. Labore excepturi eum natus nisi dolorem, explicabo, a nostrum nulla pariatur
                    repudiandae fugiat. Maiores praesentium excepturi minima iste? Quas, nisi in. Officia aliquid
                    quibusdam voluptas quasi nihil commodi labore vel ipsam earum quae?
                </p>
            </div>

            <div class="detail-card">
                <h4>Dasar Hukum</h4>
                <ul class="list-decimal list-inside">
                    <li>Peraturan Pemerintah Nomor 95 Tahun 2021 tentang PTN-BH</li>
                    <li>Peraturan Rektor Universitas Andalas Nomor 8 Tahun 2022</li>
                </ul>
            </div>

            <div class="detail-card">
                <h4>Kualifikasi Pelaksanaan</h4>
                <ul class="list-decimal list-inside">
                    <li>Memiliki Kemampuan pengolahan data sederhana</li>
                    <li>Mengetahui tugas dan fungsi POS AP</li>
                    <li>Menguasai operasional komputer</li>
                </ul>
            </div>

            <div class="detail-card">
                <h4>Peringatan</h4>
                <p>Jika POS AP ini tidak dilaksanakan, mengakibatkan terhambatnya proses kerja praktik mahasiswa.</p>
            </div>

            <div class="detail-card">
                <h4>Keterkaitan dengan POS AP Lain</h4>
                <ul class="list-decimal list-inside">
                    <li>POS AP Pelaksanaan KP</li>
                    <li>POS AP Pembatalan KP</li>
                </ul>
            </div>

            <div class="detail-card">
                <h4>Peralatan atau Perlengkapan</h4>
                <ul class="list-decimal list-inside">
                    <li>Komputer</li>
                    <li>Printer</li>
                    <li>Hardisk Eksternal / Flashdisk</li>
                    <li>Dokumen OTK</li>
                </ul>
            </div>

            <div class="detail-card">
                <h4>Pencatatan dan Pendataan</h4>
                <ul class="list-decimal list-inside">
                    <li>Dokumen Surat/Disposisi</li>
                    <li>Pengarsipan</li>
                </ul>
            </div>
        </div>

        <h2 class="text-2xl text-center mt-10 mb-6 font-bold">Alur Proses</h2>

        <MermaidDiagram :diagram="mermaidChart" class="my-5" />

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
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.step-card h4 {
    margin-bottom: 10px;
    font-size: 18px;
}

/* Untuk kotak besar yang berisi detail */
.detail-cards {
    display: grid;
    grid-template-columns: 1fr;
    /* Satu kolom penuh untuk tiap kotak */
    gap: 20px;
}

.detail-card {
    display: grid;
    grid-template-columns: 1fr 3fr;
    /* 1 bagian judul, 3 bagian konten */
    gap: 20px;
    background-color: #dfe4ea;
    padding: 20px;
    border-radius: 12px;
}

.detail-card h4 {
    font-size: 18px;
    margin: 0;
}

.detail-card p,
.detail-card ul {
    margin: 0;
}

/* Responsive untuk tampilan mobile */
@media (max-width: 768px) {
    .detail-card {
        grid-template-columns: 1fr;
        /* Judul di atas, konten di bawah */
    }
}
</style>
