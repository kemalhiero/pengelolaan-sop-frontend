<template>

    <div class="sop-timeline">
        <h3>Alur Prosedur Pendaftaran Kerja Praktik</h3>
        <div class="timeline">
            <div class="timeline-item">
                <div class="timeline-icon">1</div>
                <div class="timeline-content">
                    <h4>Mengisi Formulir Permohonan KP</h4>
                    <p>Mahasiswa mengisi formulir permohonan KP lengkap dengan transkrip nilai dan proposal KP.</p>
                    <span class="time">5 Menit</span>
                </div>
            </div>
            <div class="timeline-item">
                <div class="timeline-icon">2</div>
                <div class="timeline-content">
                    <h4>Peninjauan Permohonan KP</h4>
                    <p>Departemen meninjau formulir permohonan KP yang telah diajukan.</p>
                    <span class="time">1 Hari</span>
                </div>
            </div>
            <!-- Tambahkan langkah-langkah selanjutnya dengan struktur yang sama -->
        </div>
    </div>

    <hr class="w-48 h-1 mx-auto my-4 bg-gray-100 border-0 rounded md:my-10 dark:bg-gray-700">
    
    <AccordionTest2/>
    
    <hr class="w-48 h-1 mx-auto my-4 bg-gray-100 border-0 rounded md:my-10 dark:bg-gray-700">
    
    <div class="sop-stepper">
        <h3>Alur Prosedur Pendaftaran Kerja Praktik</h3>
        <div class="step">
            <div class="step-number">1</div>
            <div class="step-content">
                <h4>Mengisi Formulir Permohonan KP</h4>
                <p>Mahasiswa mengisi formulir permohonan KP lengkap dengan transkrip nilai dan proposal KP.</p>
                <span class="time">5 Menit</span>
            </div>
        </div>
        <div class="step">
            <div class="step-number">2</div>
            <div class="step-content">
                <h4>Peninjauan Permohonan KP</h4>
                <p>Departemen meninjau formulir permohonan KP yang telah diajukan.</p>
                <span class="time">1 Hari</span>
            </div>
        </div>
        <!-- Tambahkan langkah-langkah selanjutnya dengan struktur yang sama -->
    </div>
    
    <hr class="w-48 h-1 mx-auto my-4 bg-gray-100 border-0 rounded md:my-10 dark:bg-gray-700">

    <div class="sop-card-layout">
        <h3>Alur Prosedur Pendaftaran Kerja Praktik</h3>
        <div class="card-container">
            <div class="procedure-card">
                <div class="card-icon">1</div>
                <div class="card-body">
                    <h4>Mengisi Formulir Permohonan KP</h4>
                    <p>Mahasiswa mengisi formulir permohonan KP lengkap dengan transkrip nilai dan proposal KP.</p>
                    <span class="time">5 Menit</span>
                </div>
            </div>
            <div class="procedure-card">
                <div class="card-icon">2</div>
                <div class="card-body">
                    <h4>Peninjauan Permohonan KP</h4>
                    <p>Departemen meninjau formulir permohonan KP yang telah diajukan.</p>
                    <span class="time">1 Hari</span>
                </div>
            </div>
            <div class="procedure-card">
                <div class="card-icon">2</div>
                <div class="card-body">
                    <h4>Peninjauan Permohonan KP</h4>
                    <p>Departemen meninjau formulir permohonan KP yang telah diajukan.</p>
                    <span class="time">1 Hari</span>
                </div>
            </div>
            <div class="procedure-card">
                <div class="card-icon">2</div>
                <div class="card-body">
                    <h4>Peninjauan Permohonan KP</h4>
                    <p>Departemen meninjau formulir permohonan KP yang telah diajukan.</p>
                    <span class="time">1 Hari</span>
                </div>
            </div>
            <div class="procedure-card">
                <div class="card-icon">2</div>
                <div class="card-body">
                    <h4>Peninjauan Permohonan KP</h4>
                    <p>Departemen meninjau formulir permohonan KP yang telah diajukan.</p>
                    <span class="time">1 Hari</span>
                </div>
            </div>
            <!-- Tambahkan langkah-langkah selanjutnya dengan struktur yang sama -->
        </div>
    </div>

    


</template>

<style>
    .sop-timeline {
        padding: 20px;
        background-color: #f9f9f9;
        border-radius: 8px;
    }

    .timeline {
        position: relative;
        padding: 20px 0;
        list-style: none;
    }

    .timeline::after {
        content: '';
        position: absolute;
        width: 4px;
        background-color: #e0e0e0;
        top: 0;
        bottom: 0;
        left: 30px;
        margin-left: -2px;
    }

    .timeline-item {
        position: relative;
        margin-bottom: 20px;
        padding-left: 60px;
    }

    .timeline-item::before {
        content: '';
        position: absolute;
        left: 22px;
        background-color: #fff;
        border: 4px solid #4CAF50;
        top: 0;
        width: 16px;
        height: 16px;
        border-radius: 50%;
    }

    .timeline-content {
        background-color: #fff;
        padding: 10px 15px;
        border-radius: 6px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .timeline-content h4 {
        margin: 0 0 5px;
        color: #333;
    }

    .timeline-content .time {
        font-size: 0.9em;
        color: #777;
    }

 

    /* -------------------------- */
    .sop-stepper {
        padding: 20px;
        background-color: #fafafa;
        border-radius: 8px;
    }

    .step {
        display: flex;
        align-items: flex-start;
        margin-bottom: 20px;
    }

    .step-number {
        background-color: #4CAF50;
        color: white;
        border-radius: 50%;
        width: 30px;
        height: 30px;
        text-align: center;
        line-height: 30px;
        font-weight: bold;
        margin-right: 15px;
    }

    .step-content h4 {
        margin: 0 0 5px;
        color: #333;
    }

    .step-content .time {
        font-size: 0.9em;
        color: #777;
    }
/* ------------------ */
    .sop-card-layout {
        padding: 20px;
        background-color: #f0f8ff;
        border-radius: 8px;
    }

    .card-container {
        display: flex;
        flex-wrap: wrap;
        gap: 20px;
    }

    .procedure-card {
        background-color: #fff;
        border: 1px solid #ddd;
        border-radius: 8px;
        width: calc(50% - 20px);
        box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        display: flex;
        align-items: flex-start;
        padding: 15px;
    }

    .card-icon {
        background-color: #4CAF50;
        color: white;
        border-radius: 50%;
        width: 30px;
        height: 30px;
        text-align: center;
        line-height: 30px;
        font-weight: bold;
        margin-right: 15px;
    }

    .card-body h4 {
        margin: 0 0 5px;
        color: #333;
    }

    .card-body .time {
        font-size: 0.9em;
        color: #777;
    }


</style>

<script setup
>
import AccordionTest2 from './AccordionTest2.vue'

</script>