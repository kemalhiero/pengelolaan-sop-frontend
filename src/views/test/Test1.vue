<template>

    <div class="step-cards">
        <div class="step-card">
            <h4>1. Mengisi Formulir Permohonan KP</h4>
            <p><strong>Pelaksana:</strong> Mahasiswa</p>
            <p><strong>Kelengkapan:</strong> Formulir KP, transkrip nilai, proposal KP</p>
            <p><strong>Waktu:</strong> 5 Menit</p>
            <p><strong>Output:</strong> Penyerahan kelengkapan ke departemen</p>
        </div>
        <div class="step-card">
            <h4>2. Peninjauan Permohonan KP</h4>
            <p><strong>Pelaksana:</strong> Departemen</p>
            <p><strong>Kelengkapan:</strong> Formulir, transkrip nilai, proposal KP</p>
            <p><strong>Waktu:</strong> 1 Hari</p>
            <p><strong>Output:</strong> Disposisi</p>
        </div>
        <!-- Tambahkan langkah berikutnya -->
    </div>

    <hr class="w-48 h-1 mx-auto my-4 bg-black border-0 rounded md:my-10">

    <div class="timeline">
        <div class="timeline-item">
            <div class="timeline-content">
                <h4>Mengisi Formulir Permohonan KP</h4>
                <p><strong>Pelaksana:</strong> Mahasiswa</p>
                <p><strong>Kelengkapan:</strong> Formulir KP, transkrip nilai, proposal KP</p>
                <p><strong>Waktu:</strong> 5 Menit</p>
                <p><strong>Output:</strong> Penyerahan kelengkapan ke departemen</p>
            </div>
            <div class="timeline-content">
                <h4>Mengisi Formulir Permohonan KP</h4>
                <p><strong>Pelaksana:</strong> Mahasiswa</p>
                <p><strong>Kelengkapan:</strong> Formulir KP, transkrip nilai, proposal KP</p>
                <p><strong>Waktu:</strong> 5 Menit</p>
                <p><strong>Output:</strong> Penyerahan kelengkapan ke departemen</p>
            </div>
        </div>
        <div class="timeline-item">
            <div class="timeline-content">
                <h4>Peninjauan Permohonan KP</h4>
                <p><strong>Pelaksana:</strong> Departemen</p>
                <p><strong>Waktu:</strong> 1 Hari</p>
                <p><strong>Output:</strong> Disposisi</p>
            </div>
        </div>
        <div class="timeline-item">
            <div class="timeline-content">
                <h4>Peninjauan Permohonan KP</h4>
                <p><strong>Pelaksana:</strong> Departemen</p>
                <p><strong>Waktu:</strong> 1 Hari</p>
                <p><strong>Output:</strong> Disposisi</p>
            </div>
        </div>
        <!-- Tambahkan langkah-langkah berikutnya -->
    </div>

</template>

<style>

    .step-cards {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 20px;
        margin: 20px 0;
    }
    .step-card {
        background-color: #f0f4f8;
        padding: 20px;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        transition: transform 0.3s ease;
    }
    .step-card:hover {
        transform: translateY(-5px);
    }
    .step-card h4 {
        margin-bottom: 10px;
        font-size: 18px;
    }

    /* ---------------- */
    .timeline {
        position: relative;
        padding: 20px 0;
    }
    .timeline-item {
        display: flex;
        justify-content: flex-start;
        margin-bottom: 20px;
        position: relative;
    }
    .timeline-item::before {
        content: '';
        width: 4px;
        height: 100%;
        background-color: #007bff;
        position: absolute;
        left: 20px;
        top: 0;
    }
    .timeline-content {
        background-color: #f9f9f9;
        padding: 15px 20px;
        border-radius: 8px;
        margin-left: 50px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

</style>
