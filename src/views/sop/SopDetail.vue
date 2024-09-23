<template>
    
    <div class="container mx-auto px-4 max-w-screen-xl">

        <h2 class="text-4xl text-center my-12 font-bold dark:text-white">SOP Pendaftaran Kerja Praktik</h2>
    
        <div class="step-cards">
            <div class="step-card">
                <h4>Nomor SOP</h4>
                <p><strong>Pelaksana:</strong> Mahasiswa</p>
                <p><strong>Kelengkapan:</strong> Formulir KP, transkrip nilai, proposal KP</p>
                <p><strong>Waktu:</strong> 5 Menit</p>
                <p><strong>Output:</strong> Penyerahan kelengkapan ke departemen</p>
            </div>
            <div class="step-card">
                <h4>Tanggal Pembuatan</h4>
                <p><strong>Pelaksana:</strong> Departemen</p>
                <p><strong>Kelengkapan:</strong> Formulir, transkrip nilai, proposal KP</p>
                <p><strong>Waktu:</strong> 1 Hari</p>
                <p><strong>Output:</strong> Disposisi</p>
            </div>
            <div class="step-card">
                <h4>Tanggal Revisi</h4>
                <p><strong>Pelaksana:</strong> Departemen</p>
                <p><strong>Kelengkapan:</strong> Formulir, transkrip nilai, proposal KP</p>
                <p><strong>Waktu:</strong> 1 Hari</p>
                <p><strong>Output:</strong> Disposisi</p>
            </div>
            <div class="step-card">
                <h4>Tanggal Efektif</h4>
                <p><strong>Pelaksana:</strong> Departemen</p>
                <p><strong>Kelengkapan:</strong> Formulir, transkrip nilai, proposal KP</p>
                <p><strong>Waktu:</strong> 1 Hari</p>
                <p><strong>Output:</strong> Disposisi</p>
            </div>
            <div class="step-card">
                <h4>Seksi</h4>
                <p><strong>Pelaksana:</strong> Departemen</p>
                <p><strong>Kelengkapan:</strong> Formulir, transkrip nilai, proposal KP</p>
                <p><strong>Waktu:</strong> 1 Hari</p>
                <p><strong>Output:</strong> Disposisi</p>
            </div>
            <div class="step-card">
                <h4>Disahkan Oleh</h4>
                <p><strong>Pelaksana:</strong> Departemen</p>
                <p><strong>Kelengkapan:</strong> Formulir, transkrip nilai, proposal KP</p>
                <p><strong>Waktu:</strong> 1 Hari</p>
                <p><strong>Output:</strong> Disposisi</p>
            </div>
            <!-- Tambahkan langkah berikutnya -->
        </div>

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
