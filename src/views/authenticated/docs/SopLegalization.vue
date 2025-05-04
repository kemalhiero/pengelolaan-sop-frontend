<script setup>
import { inject, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { useSopData } from '@/composables/useSopData';
import { getUserProfile } from '@/api/userApi';
import { confirmSopandBpmn } from '@/api/sopApi';

import XMarkCloseIcon from '@/assets/icons/XMarkCloseIcon.vue';
import SopInfoTemplate from '@/components/sop/SopInfoTemplate.vue';
import SopStepTemplate from '@/components/sop/SopStepTemplate.vue';
import SopBpmnTemplate from '@/components/sop/SopBpmnTemplate.vue';
import ExclamationMarkIcon from '@/assets/icons/ExclamationMarkIcon.vue';
import CheckIcon from '@/assets/icons/CheckIcon.vue';
import { useToastPromise } from '@/utils/toastPromiseHandler';

const layoutType = inject('layoutType');
layoutType.value = 'admin';

const showConfirmationModal = ref(false);
const activeTab = ref('document');
const router = useRouter();
const route = useRoute();

const { sopData, signer, fetchSopVersion, fetchInfoSop, fetchSopStep, fetchCurrentHod } = useSopData(route.params.id);

const confirm = () => {
    try {
        // Call the API to confirm the SOP and BPMN
        useToastPromise(
            new Promise((resolve, reject) => {
                confirmSopandBpmn(sopData.value.id)
                    .then(response => {
                        if (!response.success) {
                            throw response;
                        }
                        console.log('SOP and BPMN confirmed successfully!');
                        resolve();
                        router.push({ name: 'SopDocs' });
                    })
                    .catch(error => reject(error));
            }),
            {
                messages: {
                    success: 'Berhasil mengesahkan SOP dan BPMN!'
                }
            }
        );
    } catch (error) {
        console.error('Error confirming SOP and BPMN:', error);
    } finally {
        showConfirmationModal.value = false; // Close the modal after confirmation
    }
};

const userSignature = ref(''); // Placeholder untuk menyimpan tanda tangan yang diunggah

const fetchProfile = async () => {
    try {
        const result = await getUserProfile();
        userSignature.value = result.data.signature; // Ambil tanda tangan dari profil pengguna
    } catch (error) {
        console.error('Fetch error:', error);
    }
};

onMounted(async () => {
    // Periksa apakah data SOP sudah ada dan valid
    if (!sopData.value.id || sopData.value.id !== route.params.id) {
        console.log('Data SOP tidak ditemukan atau tidak sesuai, mengambil ulang dari API...');
        await fetchSopVersion();
        await fetchInfoSop();
    }

    // Periksa apakah langkah-langkah SOP sudah ada
    if (!sopData.value.steps || sopData.value.steps.length === 0) {
        console.log('Langkah-langkah SOP tidak ditemukan, mengambil ulang dari API...');
        await fetchSopStep();
    }

    // Periksa apakah data HOD sudah ada
    if (!signer.value.id_number) {
        console.log('hod', signer.value)
        console.log('Data HOD tidak ditemukan, mengambil ulang dari API...');
        await fetchCurrentHod();
    }
    await fetchProfile();
});
</script>

<template>
    <h2 class="text-4xl text-center my-8 font-bold">Pengesahan SOP {{ sopData.name }}</h2>

    <div class="lg:col-span-2 p-6">
        <h2 class="text-2xl font-bold text-gray-800 mb-1">Tanda Tangan</h2>
        <p class="text-sm mb-6">Status tanda tangan Anda.</p>
    
        <div v-if="!userSignature" class="flex items-center text-red-600 font-medium">
            <ExclamationMarkIcon class="w-5 h-5 mr-2" />
            <p>
                Anda belum mengunggah tanda tangan. Silakan unggah tanda tangan Anda di halaman 
                <RouterLink to="/profile" class="underline text-blue-600">Profil Pengguna!</RouterLink>
            </p>
        </div>
        <div v-else class="flex items-center text-green-600 font-medium">
            <CheckIcon class="w-5 h-5 mr-2" />
            Tanda tangan Anda telah diunggah. Silahkan tinjau dan sahkan SOP ini!
        </div>
    </div>

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
        <SopInfoTemplate
            :name="sopData.name" :number="sopData.number"
            :pic-name="signer.name" :pic-number="signer.id_number"
            created-date="-" :revision-date="sopData.revision_date" :effective-date="sopData.effective_date"
            :section="sopData.section" :warning="sopData.warning"
            :law-basis="sopData.legalBasis.map(item => item.legal)"
            :implement-qualification="sopData.implementQualification.map(item => item.qualification)" 
            :related-sop="sopData.relatedSop.map(item => item.related_sop)"
            :equipment="sopData.equipment.map(item => item.equipment)" 
            :record-data="sopData.record.map(item => item.data_record)"
            :signature="userSignature"
        /> 
        
        <SopStepTemplate
            :implementer="sopData.implementer" :steps="sopData.steps"
        />
    </div>

    <div v-else-if="activeTab === 'bpmn'" class="mb-10">
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

    <div class="mb-10 flex flex-col items-center">
        <button type="button" @click="showConfirmationModal = true" :disabled="!userSignature"
            class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors w-1/4 disabled:cursor-not-allowed disabled:bg-opacity-60">
            Sahkan SOP dan BPMN?
        </button>
        <p v-if="!userSignature" class="text-sm text-red-600 mt-2">
            Anda harus mengunggah tanda tangan terlebih dahulu untuk dapat mengesahkan SOP.
        </p>
    </div>

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
