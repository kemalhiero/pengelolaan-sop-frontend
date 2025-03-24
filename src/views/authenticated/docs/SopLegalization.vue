<script setup>
import { inject, ref } from 'vue';
import { useRouter } from 'vue-router';

import Divider from '@/components/Divider.vue';
import XMarkCloseIcon from '@/assets/icons/XMarkCloseIcon.vue';
import SopDocTemplate from '@/components/sop/SopDocTemplate.vue';
import SopBpmnTemplate from '@/components/sop/SopBpmnTemplate.vue';
import ExclamationMarkIcon from '@/assets/icons/ExclamationMarkIcon.vue';

const layoutType = inject('layoutType');
layoutType.value = 'admin';

const showConfirmationModal = ref(false);
const router = useRouter();

// data dummy
import sopSteps from '@/data/sopSteps.json';
import implementer from '@/data/sopImplementer.json';

const confirm = () => {
    // Logic to handle confirmation
    console.log('SOP and BPMN confirmed');
    router.push({ name: 'SopDocs' });
};
</script>

<template>
    <main class="p-4 md:ml-64 h-auto pt-20 px-10">
        <h2 class="text-4xl text-center my-8 font-bold">Pengesahan SOP .....</h2>

        <!-- Tanda Tangan -->
        <div class="lg:col-span-2 p-6">
            <h2 class="text-2xl font-bold text-gray-800 mb-1">Tanda Tangan</h2>
            <p class="text-sm mb-6">Unggah hasil pindai dari tanda tangan dan stempel jabatan anda. Pastikan latar
                belakangnya berwarna putih!</p>
            <form @submit.prevent="" class="space-y-4">
                <div class="flex items-center">
                    <input type="file" @change="" accept="image/png, image/jpeg, image/webp" ref="signatureInput"
                        class="sr-only" />
                    <button type="button" @click=""
                        class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition">
                        Pilih Tanda Tangan
                    </button>
                    <span class="ml-4 text-gray-600">ini itu.jepege</span>
                </div>
                <div class="flex justify-center">
                    <img src="/signature.webp" alt="Pratinjau Tanda Tangan" class="max-w-full max-h-32 rounded-md" />
                </div>
                <div class="flex justify-end">
                    <button type="submit" disabled
                        class="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition disabled:cursor-not-allowed disabled:bg-opacity-60">
                        Unggah Tanda Tangan
                    </button>
                </div>
            </form>
        </div>

        
        <h3 class="text-3xl text-center font-bold my-4">Pratinjau Dokumen SOP dan BPMN</h3>

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

            is-signed="true"
        />

        <Divider />

        <SopBpmnTemplate name="Prosedur pendaftaran kerja praktik" :steps="sopSteps" :implementer="implementer" />

        <div class="my-10 flex justify-center">
            <button type="button" @click="showConfirmationModal = true"
                class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors w-1/4">
                Sahkan SOP dan BPMN?
            </button>
        </div>

    </main>

    <div v-show="showConfirmationModal" class="fixed inset-0 z-50 flex items-center justify-center w-full h-full shadow-lg">
        <div class="fixed inset-0 bg-gray-800 bg-opacity-50" @click="showConfirmationModal = false"></div>
        <div class="relative w-full max-w-2xl max-h-full">

            <div class="relative bg-white rounded-lg shadow">
                <button type="button" @click="showConfirmationModal = false"
                    class="absolute top-3 right-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 inline-flex justify-center items-center">
                    <XMarkCloseIcon class="w-3 h-3" />
                    <span class="sr-only">Tutup modal</span>
                </button>
                <div class="p-4 md:p-5 text-center">
                    <ExclamationMarkIcon class="mx-auto mb-4 text-gray-400 w-12 h-12" />
                    <h3 class="mb-2 text-xl font-normal text-gray-800">
                        Anda yakin ingin mengesahkan SOP dan BPMN ini?
                    </h3>
                    <p class="text-gray-500 mb-1">
                        SOP ini akan ditandatangani oleh anda dan akan menjadi SOP yang berlaku di
                        Departemen Sistem Informasi Universitas Andalas!
                    </p>
                    <p class="text-gray-600 mb-5">
                        <span class="text-red-600">*</span>
                        SOP akan dipublikasikan dan dapat dilihat oleh semua orang
                        <span class="text-red-600">*</span>
                    </p>
                    <button @click="confirm"
                        class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm inline-flex items-center px-5 py-2.5 text-center">
                        Yakin
                    </button>
                    <button @click="showConfirmationModal = false"
                        class="py-2.5 px-5 ms-3 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100">
                        Batal
                    </button>
                </div>
            </div>

        </div>
    </div>

</template>
