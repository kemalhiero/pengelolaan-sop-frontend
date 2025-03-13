<script setup>
import { inject } from 'vue';
import { useAuthStore } from '@/stores/auth';

import SopDocTemplate from '@/components/sop/SopDocTemplate.vue';
import SopBpmnTemplate from '@/components/sop/SopBpmnTemplate.vue';
import IconDownload from '@/assets/icons/DownloadIcon.vue';
import Divider from '@/components/Divider.vue';

const layoutType = inject('layoutType');
layoutType.value = 'guest';

const authStore = useAuthStore();

// Impor data dummy
import sopSteps from '@/data/sopSteps.json';
import implementer from '@/data/sopImplementer.json';
</script>

<template>

    <div class="container mx-auto">

        <h2 class="text-4xl text-center my-12 font-bold">SOP Pendaftaran Kerja Praktik</h2>

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

        <Divider/>

        <h2 class="text-4xl text-center my-12 font-bold">BPMN Pendaftaran Kerja Praktik</h2>

        <SopBpmnTemplate 
            name="Prosedur pendaftaran kerja praktik" 
            :steps="sopSteps" 
            :implementer="implementer" 
        />

        <div class="flex flex-col lg:flex-row max-w-screen-lg mx-auto my-10 space-y-6 lg:space-y-0 lg:space-x-8">
            <!-- Bagian Kiri: Tombol -->
            <div class="w-full lg:w-1/3 p-6 flex flex-col space-y-4">
                <h2 class="text-lg font-semibold mb-4">Simpan Dokumen</h2>
                <button
                    class="text-white bg-[#2557D6] hover:bg-[#2557D6]/90 focus:ring-4 focus:ring-[#2557D6]/50 focus:outline-none font-medium rounded-lg text-base py-3 px-6 flex items-center justify-center">
                    <IconDownload class="w-5 mr-3 fill-current" />
                    Unduh SOP
                </button>
                <button
                    class="text-white bg-[#2557D6] hover:bg-[#2557D6]/90 focus:ring-4 focus:ring-[#2557D6]/50 focus:outline-none font-medium rounded-lg text-base py-3 px-6 flex items-center justify-center">
                    <IconDownload class="w-5 mr-3 fill-current" />
                    Unduh BPMN
                </button>
            </div>

            <!-- Garis Pemisah -->
            <div class="hidden lg:block w-0.5 rounded-3xl bg-gray-400"></div>

            <!-- Bagian Kanan: Form dengan Overlay Login -->
            <div class="w-full lg:w-2/3 relative">
                <!-- Form Container -->
                <form class="w-full bg-white p-6 space-y-5" :class="{ 'blur-sm pointer-events-none': !authStore.isAuthenticated }" >
                    <h2 class="text-lg font-semibold mb-4">Form Umpan Balik</h2>
                    <div>
                        <label for="judul" class="block mb-2 text-sm font-medium">Judul</label>
                        <input type="text" id="judul" 
                            class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" 
                            placeholder="Contoh: Saran Proses Pengajuan KP" required />
                    </div>
                    <div>
                        <label for="message" class="block mb-2 text-sm font-medium">Kritik/Saran</label>
                        <textarea id="message" rows="4" 
                            class="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500" 
                            placeholder="Ketikkan kritik atau saran Anda..."></textarea>
                    </div>
                    <button type="submit" 
                        class="w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5">
                        Submit
                    </button>
                </form>

                <!-- Overlay Login -->
                <div 
                    v-if="!authStore.isAuthenticated"
                    class="absolute inset-0 flex items-center justify-center bg-gray-700/20 rounded-xl"
                >
                    <div class="bg-white p-6 rounded-lg shadow-lg text-center">
                        <h3 class="text-lg font-semibold mb-4">Silakan Login</h3>
                        <p class="text-gray-600 mb-4">Anda harus login terlebih dahulu untuk memberikan umpan balik</p>
                        <RouterLink to="/login">
                            <button class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-6 py-2.5">
                                Login
                            </button>
                        </RouterLink>
                    </div>
                </div>
            </div>
        </div>

    </div>

</template>

