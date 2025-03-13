<script setup>
import { inject, ref } from 'vue';
import SopBpmnTemplate from '@/components/sop/SopBpmnTemplate.vue';
import SopDocTemplate from '@/components/sop/SopDocTemplate.vue';
import Divider from '@/components/Divider.vue';

const layoutType = inject('layoutType');
layoutType.value = 'admin';

// data dummy
import sopSteps from '@/data/sopSteps.json';
import implementer from '@/data/sopImplementer.json';

const statusSop = ref('');
</script>

<template>
    <main class="p-4 md:ml-64 h-auto pt-20 px-10">
        <!-- <template> -->
        <h2 class="text-4xl text-center my-8 font-bold">SOP sopean</h2>

        <div class="grid grid-cols-3 gap-5">
            <div class="bg-gray-200 p-5 rounded-xl shadow-md">
                <h4 class="mb-2.5 text-lg">Versi</h4>
                <h5 class="text-lg font-bold">
                    bla
                </h5>
            </div>
            <div class="bg-gray-200 p-5 rounded-xl shadow-md">
                <h4 class="mb-2.5 text-lg">Status</h4>
                <h5 class="text-xl font-bold">
                    ble
                </h5>
            </div>
            <div class="bg-gray-200 p-5 rounded-xl shadow-md row-span-2">
                <h4 class="mb-2.5 text-lg">Penyusun</h4>
                <ul class="list-disc list-inside">
                    <li class="text-xl font-bold">
                        blo
                    </li>
                    <li class="text-xl font-bold">
                        blu
                    </li>
                    <li class="text-xl font-bold">
                        ble
                    </li>
                    <li class="text-xl font-bold">
                        bla
                    </li>
                </ul>
            </div>
            <div class="bg-gray-200 p-5 rounded-xl shadow-md">
                <h4 class="mb-2.5 text-lg">Deskripsi</h4>
                <h5 class="text-xl font-bold">
                    blo
                </h5>
            </div>
            <div class="bg-gray-200 p-5 rounded-xl shadow-md">
                <h4 class="mb-2.5 text-lg">Jabatan Penanggung Jawab</h4>
                <h5 class="text-xl font-bold">
                    blo
                </h5>
            </div>
        </div>

        <SopDocTemplate class="mt-12"
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

        <Divider />

        <SopBpmnTemplate name="Prosedur pendaftaran kerja praktik" :steps="sopSteps" :implementer="implementer" />
        <!-- </template> -->

        <div class="w-full lg:w-2/3 flex justify-center mx-auto mt-5 mb-10">
            <form class="w-full bg-white p-6 space-y-5" >
                <h2 class="text-lg font-semibold mb-4">Form umpan balik</h2>
                <div>
                    <label for="status" class="block mb-2 text-sm font-medium">Status<span class="text-red-600">*</span></label>
                    <select type="text" id="status" v-model="statusSop" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" required>
                        <option selected disabled value="">Pilih status</option>
                        <option value="1">Setuju</option>
                        <option value="2">Perlu Revisi</option>
                    </select>
                </div>
                <div>
                    <label for="description" class="block mb-2 text-sm font-medium">Keterangan</label>
                    <textarea id="description" rows="4" 
                        class="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500" 
                        placeholder="Jelaskan umpan balik anda..."></textarea>
                </div>
                <button type="submit" :disabled="statusSop == ''"
                    class="w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 disabled:cursor-not-allowed disabled:bg-opacity-60">
                    <p v-if="statusSop == 1">Lanjut ke Pengesahan SOP</p>
                    <p v-else>Kirim Umpan Balik</p>
                </button>
            </form>
        </div>

    </main>
</template>
