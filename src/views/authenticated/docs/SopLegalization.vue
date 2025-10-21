<script setup>
import { computed, inject, onMounted, provide, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { useAuthStore } from '@/stores/auth';
import { getUserProfile } from '@/api/userApi';
import { confirmSopandBpmn } from '@/api/sopApi';
import useSopData from '@/composables/useSopData';
import useToastPromise from '@/utils/toastPromiseHandler';
import roleAbbreviation from '@/data/roleAbbrv.json';

import XMarkCloseIcon from '@/assets/icons/XMarkCloseIcon.vue';
import SopInfoTemplate from '@/components/sop/SopInfoTemplate.vue';
import SopStepTemplate from '@/components/sop/SopFlowchartTemplate.vue';
import SopBpmnTemplate from '@/components/sop/SopBpmnTemplate.vue';
import ExclamationMarkIcon from '@/assets/icons/ExclamationMarkIcon.vue';
import CheckIcon from '@/assets/icons/CheckIcon.vue';
import Error from '@/components/Error.vue';
import TableSkeleton from '@/components/TableSkeleton.vue';

const layoutType = inject('layoutType');
layoutType.value = 'admin';

const isLoading = ref(true);
const hasError = ref(false);
const showConfirmationModal = ref(false);
const activeTab = ref('document');
const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const { 
    sopData, signer, fetchSopVersion, fetchInfoSop, fetchSopStep, fetchSigner, isDataError, 
    fetchSopDisplayConfig, sopConfig, flowchartArrowConfig, bpmnArrowConfig, flowchartLabelConfig, bpmnLabelConfig
} = useSopData(route.params.id);
provide('sopConfig', sopConfig);
provide('labelConfigs', {
    flowchartLabelConfig,
    bpmnLabelConfig
});

const confirm = () => {
    try {
        // Call the API to confirm the POS and BPMN
        useToastPromise(
            new Promise((resolve, reject) => {
                confirmSopandBpmn(sopData.value.id)
                    .then(response => {
                        if (!response.success) {
                            throw response;
                        }
                        console.log('POS and BPMN confirmed successfully!');
                        resolve();
                        router.push({ name: 'SopDocs' });
                    })
                    .catch(error => reject(error));
            }),
            {
                messages: {
                    success: 'Berhasil mengesahkan POS dan BPMN!'
                }
            }
        );
    } catch (error) {
        console.error('Error confirming POS and BPMN:', error);
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

const fetchAllData = async () => {
    isLoading.value = true;
    hasError.value = false;
    try {
        // Periksa apakah data POS sudah ada dan valid
        if (!sopData.value.id || sopData.value.id !== route.params.id) {
            console.log('Data POS tidak ditemukan atau tidak sesuai, mengambil ulang dari API...');
            await fetchSopVersion();
            await fetchInfoSop();
        }

        // Periksa apakah langkah-langkah POS sudah ada
        if (!sopData.value.steps || sopData.value.steps.length === 0) {
            console.log('Langkah-langkah POS tidak ditemukan, mengambil ulang dari API...');
            await fetchSopStep();
        }

        // Periksa apakah data HOD sudah ada
        if (!signer.value.id_number) {
            console.log('Data HOD tidak ditemukan, mengambil ulang dari API...');
            await fetchSigner(sopData.value.signer_id);
        }
        await fetchProfile();
        await fetchSopDisplayConfig();
    } catch (error) {
        console.error('Fetch data error:', error);
        hasError.value = true;
    } finally {
        isLoading.value = false;
    }
}

const canAccessLegalization = computed(() => {
    // status 7: untuk kadep, status 8: untuk pj
    if (!sopData.value || !sopData.value.status) return false;
    // role: kadep = 'kadep', pj = 'pj'
    const userRole = authStore.userRole;
    return (
        (sopData.value.status === 7 && userRole === 'kadep') ||
        (sopData.value.status === 8 && userRole === 'pj')
    );
});

onMounted(fetchAllData);
</script>

<template>
    <TableSkeleton v-if="isLoading" :columns="1" :rows="10" class="m-14" />
    <Error v-else-if="hasError" @click="fetchAllData" />
    <template v-else>
        <h2 class="text-4xl text-center my-8 font-bold">
            {{ isDataError || !sopData.steps.length || !canAccessLegalization ? 'Ngapain iseng iseng?🤨' : `Pengesahan POS ${sopData.name}` }}
        </h2>

        <template v-if="!isDataError && sopData.steps.length > 0 && canAccessLegalization">
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
                    Tanda tangan Anda telah diunggah. Silahkan tinjau dan sahkan POS ini!
                </div>
            </div>

            <SopInfoTemplate class="mt-8"
                :name="sopData.name" :number="sopData.number" :version="sopData.version"
                :pic-name="signer.name" :pic-number="signer.id_number" 
                :pic-role="roleAbbreviation[sopData.pic_position || signer.role]"
                :created-date="sopData.creation_date" :revision-date="sopData.revision_date" :effective-date="sopData.effective_date"
                :section="sopData.section" :warning="sopData.warning"
                :law-basis="sopData.legalBasis.map(item => item.legal)"
                :implement-qualification="sopData.implementQualification.map(item => item.qualification)" 
                :related-sop="sopData.relatedSop.map(item => item.related_sop)"
                :equipment="sopData.equipment.map(item => item.equipment)" 
                :record-data="sopData.record.map(item => item.data_record)"
                :signature="userSignature"
            /> 

            <div class="flex justify-center my-6 print:hidden">
                <div class="inline-flex rounded-md shadow-sm" role="group">
                    <button @click="activeTab = 'document'" type="button" 
                        class="px-4 py-2 text-sm font-medium bg-white border-2 rounded-l-lg hover:bg-gray-200 focus:z-10 focus:ring-2 focus:ring-blue-700"
                        :class="activeTab === 'document' ? 'text-blue-700 border-blue-700' : 'text-gray-900 border-gray-200 hover:text-blue-700'">
                        Flowchart
                    </button>
                    <button @click="activeTab = 'bpmn'" type="button" 
                        class="px-4 py-2 text-sm font-medium bg-white border-2 rounded-r-lg hover:bg-gray-200 focus:z-10 focus:ring-2 focus:ring-blue-700"
                        :class="activeTab === 'bpmn' ? 'text-blue-700 border-blue-700' : 'text-gray-900 border-gray-200 hover:text-blue-700'">
                        BPMN
                    </button>
                </div>
            </div>

            <div v-if="activeTab === 'document' || activeTab === 'bpmn'">
                <template v-if="sopData.steps && sopData.steps.length > 0 && sopData.implementer && sopData.implementer.length > 0">
                    <SopStepTemplate
                        v-if="activeTab === 'document'"
                        :implementer="sopData.implementer"
                        :steps="sopData.steps"
                        :arrow-config="flowchartArrowConfig"
                        :label-config="flowchartLabelConfig"
                        :layout-config="sopConfig"
                    />
                    <SopBpmnTemplate
                        v-else
                        :name="sopData.name"
                        :steps="sopData.steps"
                        :implementer="sopData.implementer"
                        :arrow-config="bpmnArrowConfig"
                        :label-config="bpmnLabelConfig"
                    />
                </template>
                <div v-else class="my-4 p-4 bg-gray-100 rounded text-center">
                    Belum ada tahapan yang diinputkan oleh penyusun!
                </div>
            </div>

            <div class="my-10 flex flex-col items-center">
                <button type="button" @click="showConfirmationModal = true" :disabled="!userSignature"
                    class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors w-1/4 disabled:cursor-not-allowed disabled:bg-opacity-60">
                    Sahkan POS dan BPMN?
                </button>
                <p v-if="!userSignature" class="text-sm text-red-600 mt-2">
                    Anda harus mengunggah tanda tangan terlebih dahulu untuk dapat mengesahkan POS.
                </p>
            </div>
        </template>
    </template>
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
                        Anda yakin ingin mengesahkan POS dan BPMN ini?
                    </h3>
                    <p class="text-gray-500 mb-1">
                        POS ini akan ditandatangani oleh anda dan akan menjadi POS yang berlaku di
                        Departemen Sistem Informasi Universitas Andalas!
                    </p>
                    <p class="text-gray-600 mb-5">
                        <span class="text-red-600">*</span>
                        POS akan dipublikasikan dan dapat dilihat oleh semua orang
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
