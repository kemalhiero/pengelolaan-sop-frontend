<script setup>
import { inject, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { useSopData } from '@/composables/useSopData';
import XMarkCloseIcon from '@/assets/icons/XMarkCloseIcon.vue';
import SopDocTemplate from '@/components/sop/SopDocTemplate.vue';
import SopBpmnTemplate from '@/components/sop/SopBpmnTemplate.vue';
import ExclamationMarkIcon from '@/assets/icons/ExclamationMarkIcon.vue';

const layoutType = inject('layoutType');
layoutType.value = 'admin';

const showConfirmationModal = ref(false);
const activeTab = ref('document');
const router = useRouter();
const route = useRoute();

const { sopData, hodData, fetchSopVersion, fetchInfoSop, fetchSopStep, fetchCurrentHod } = useSopData(route.params.id);

const confirm = () => {
    // Logic to handle confirmation
    console.log('SOP and BPMN confirmed');
    router.push({ name: 'SopDocs' });
};

const signaturePreview = ref(''); // URL atau path pratinjau tanda tangan
const signature = ref(''); // Placeholder untuk menyimpan tanda tangan yang diunggah
const signatureUploaded = ref(false); // State untuk mengecek apakah tanda tangan sudah diunggah
const signatureUsed = ref(false); // State untuk mengecek apakah tanda tangan sudah digunakan

const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
        // Simpan URL pratinjau tanda tangan
        signaturePreview.value = URL.createObjectURL(file);
        signatureUploaded.value = true;
    }
};

const removeSignature = () => {
    signaturePreview.value = '';
    signature.value = ''; // Reset tanda tangan yang diunggah
    signatureUploaded.value = false;
    signatureUsed.value = false; // Reset status penggunaan tanda tangan
    console.log('Tanda tangan dihapus');
};

const useSignature = () => {
    if (signatureUploaded.value) {
        signatureUsed.value = true; // Tandai bahwa tanda tangan telah digunakan
        signature.value = signaturePreview.value; // Simpan tanda tangan yang digunakan
        // Logika untuk menggunakan tanda tangan, misalnya menyimpannya ke server atau menambahkannya ke dokumen
        console.log('Tanda tangan digunakan:', signaturePreview.value);
        // Tambahkan logika lain, seperti menyimpan tanda tangan ke server
    } else {
        console.error('Tidak ada tanda tangan yang diunggah!');
    }
};

onMounted(async () => {
    await fetchSopVersion();
    await fetchInfoSop();
    await fetchSopStep();
    await fetchCurrentHod();
});
</script>

<template>
    <main class="p-4 md:ml-64 h-auto pt-20 px-10">
        <h2 class="text-4xl text-center my-8 font-bold">Pengesahan SOP .....</h2>

        <!-- Tanda Tangan -->
        <div class="lg:col-span-2 p-6">
            <h2 class="text-2xl font-bold text-gray-800 mb-1">Tanda Tangan</h2>
            <p class="text-sm mb-6">
                Unggah hasil pindai dari tanda tangan dan stempel jabatan Anda. Pastikan latar belakangnya berwarna putih!
            </p>

            <!-- Jika tanda tangan belum diunggah -->
            <div v-if="!signatureUploaded" class="space-y-4">
                <div class="flex items-center">
                    <input
                        type="file"
                        @change="handleFileUpload"
                        accept="image/png, image/jpeg, image/webp"
                        class="sr-only"
                        id="signatureInput"
                    />
                    <label
                        for="signatureInput"
                        class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition cursor-pointer"
                    >
                        Pilih Tanda Tangan
                    </label>
                    <span class="ml-4 text-gray-600">Belum ada file yang dipilih</span>
                </div>
            </div>

            <!-- Jika tanda tangan sudah diunggah -->
            <div v-else class="space-y-4">
                <div class="flex justify-center">
                    <img
                        :src="signaturePreview"
                        alt="Pratinjau Tanda Tangan"
                        class="max-w-full max-h-32 rounded-md border border-gray-300"
                    />
                </div>
                <div class="flex justify-end space-x-4">
                    <button
                        @click="removeSignature"
                        class="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition"
                    >
                        Hapus Tanda Tangan
                    </button>
                    <button
                        type="button" @click="useSignature"
                        class="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition"
                    >
                        Gunakan Tanda Tangan
                    </button>
                </div>
                <div v-if="signatureUsed" class="flex justify-end mt-4">
                    <p class="text-green-600 font-medium">Tanda tangan telah digunakan!</p>
                </div>
            </div>
        </div>

        
        <h3 class="text-3xl text-center font-bold my-4">Pratinjau Dokumen SOP dan BPMN</h3>

        <div class="flex justify-center my-6">
            <div class="inline-flex rounded-md shadow-sm" role="group">
            <button 
                @click="activeTab = 'document'" 
                type="button" 
                class="px-4 py-2 text-sm font-medium bg-white border-2 rounded-l-lg hover:bg-gray-200 focus:z-10 focus:ring-2 focus:ring-blue-700"
                :class="activeTab === 'document' ? 'text-blue-700 border-blue-700' : 'text-gray-900 border-gray-200 hover:text-blue-700'"
            >
                Dokumen SOP
            </button>
            <button 
                @click="activeTab = 'bpmn'" 
                type="button" 
                class="px-4 py-2 text-sm font-medium bg-white border-2 rounded-r-lg hover:bg-gray-200 focus:z-10 focus:ring-2 focus:ring-blue-700"
                :class="activeTab === 'bpmn' ? 'text-blue-700 border-blue-700' : 'text-gray-900 border-gray-200 hover:text-blue-700'"
            >
                Diagram BPMN
            </button>
            </div>
        </div>

        <div v-if="activeTab === 'document'">
            <SopDocTemplate 
                :name="sopData.name" :number="sopData.number"
                :pic-name="hodData.name" :pic-number="hodData.id_number"
                created-date="-" :revision-date="sopData.revision_date" :effective-date="sopData.effective_date"
                :section="sopData.section" :warning="sopData.warning"
                :law-basis="sopData.legalBasis.map(item => item.legal)"
                :implement-qualification="sopData.implementQualification.map(item => item.qualification)" 
                :related-sop="sopData.relatedSop.map(item => item.related_sop)"
                :equipment="sopData.equipment.map(item => item.equipment)" 
                :record-data="sopData.record.map(item => item.data_record)"
                :implementer="sopData.implementer" :steps="sopData.steps" 
                :signature="signature"
            />           
        </div>

        <div v-else-if="activeTab === 'bpmn'">
            <SopBpmnTemplate
                v-if="sopData.steps && sopData.steps.length > 0 && sopData.implementer && sopData.implementer.length > 0"
                :name="sopData.name" 
                :steps="sopData.steps || []" 
                :implementer="sopData.implementer || []" 
            />
            <div v-else class="my-4 p-4 bg-gray-100 rounded text-center">
                Belum ada tahapan yang diinputkan oleh penyusun!
            </div>
        </div>

        <div class="my-10 flex justify-center">
            <button type="button" @click="showConfirmationModal = true" :disabled="!signatureUsed"
                class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors w-1/4 disabled:cursor-not-allowed disabled:bg-opacity-60">
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
