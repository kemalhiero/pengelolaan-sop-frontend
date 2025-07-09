<script setup>
import { computed, inject, onMounted, provide, ref } from 'vue';
import { useRoute } from 'vue-router';

import { useAuthStore } from '@/stores/auth';
import useSopData from '@/composables/useSopData';
import roleAbbreviation from '@/data/roleAbbrv.json';
import useToastPromise from '@/utils/toastPromiseHandler';
import { addDraftFeedback, deleteDraftFeedback, getGeneralFeedback } from '@/api/feedbackApi';

import DeleteDataModal from '@/components/modal/DeleteDataModal.vue';
import SopBpmnTemplate from '@/components/sop/SopBpmnTemplate.vue';
import SopInfoTemplate from '@/components/sop/SopInfoTemplate.vue';
import SopStepTemplate from '@/components/sop/SopStepTemplate.vue';
import PrintIcon from '@/assets/icons/PrintIcon.vue';
import Error from '@/components/Error.vue';

const layoutType = inject('layoutType');
layoutType.value = 'guest';

const route = useRoute();
const authStore = useAuthStore();

const { sopData, signer, fetchSopVersion, fetchInfoSop, fetchSopStep, fetchSigner, isDataError, fetchSopDisplayConfig, sopConfig } = useSopData(route.params.id);
provide('sopConfig', sopConfig);

const activeTab = ref('document');
const cdnUrl = import.meta.env.VITE_CDN_URL; // URL untuk CDN
const newFeedback = ref(''); // State untuk menyimpan umpan balik baru
const draftFeedback = ref([]);

const showAllFeedback = ref(false);
const showModalDelete = ref(false);
const feedbackIdToDelete = ref(null); // State untuk menyimpan ID umpan balik yang akan dihapus

// Computed property untuk menampilkan feedback yang sesuai (4 pertama atau semua)
const displayedFeedback = computed(() => {
    return showAllFeedback.value
        ? draftFeedback.value
        : draftFeedback.value.slice(0, 4);
});

const printSop = () => {
    window.print();
};

const openDeleteModal = (id) => {
    feedbackIdToDelete.value = id; // Menyimpan ID yang dipilih
    showModalDelete.value = true; // Tampilkan modal
};

const fetchFeedback = async () => {
    try {
        const response = await getGeneralFeedback(route.params.id);
        if (response.success) {
            draftFeedback.value = response.data;
        }
    } catch (error) {
        console.error('Fetch feedback error:', error);
    }
};

const submitFeedback = () => {
    const feedbackData = {
        id_sop_detail: route.params.id,
        feedback: newFeedback.value,
        type: 'umum',
    };

    try {
        useToastPromise(
            new Promise((resolve, reject) => {
                addDraftFeedback(feedbackData)
                    .then(response => {
                        if (!response.success) {
                            throw response;
                        }
                        fetchFeedback();
                        newFeedback.value = '';
                        resolve();
                    })
                    .catch(error => reject(error));
            }),
            {
                messages: {
                    success: 'Umpan balik berhasil dikirim!',
                },
                toastOptions: {
                    autoClose: 3000,
                },
            }
        );
        console.log('Feedback submitted!');
    } catch (error) {
        console.error('Error:', error.message);
    }
};

const deleteFeedback = async (feedbackId) => {
    try {
        useToastPromise(
            new Promise((resolve, reject) => {
                deleteDraftFeedback(feedbackId)
                    .then(response => {
                        if (!response.success) {
                            throw response;
                        }
                        fetchFeedback();
                        showModalDelete.value = false;
                        resolve();
                    })
                    .catch(error => reject(error));
            }),
            {
                messages: {
                    success: 'Umpan balik berhasil dihapus!',
                },
                toastOptions: {
                    autoClose: 3000,
                },
            }
        );
    } catch (error) {
        console.error('Error deleting feedback:', error);
    }
};

const reloadPage = () => {
    location.reload();
};

const fetchAllData = async () => {
    await fetchSopVersion();
    await fetchInfoSop();
    await fetchSopStep();
    await fetchSigner(sopData.value.signer_id);
    await fetchFeedback();
    await fetchSopDisplayConfig();
};

onMounted(fetchAllData);
</script>

<template>
    <h2 class="text-4xl text-center my-12 font-bold print:hidden">
        {{ isDataError || sopData.status != 1 ? 'Ngapain iseng iseng?🤨' : `SOP ${sopData.name}` }}
    </h2>

    <template v-if="!isDataError && sopData.status == 1">
        <div>
            <SopInfoTemplate class="mt-8" 
                :name="sopData.name" :number="sopData.number" :pic-name="signer.name"
                :pic-number="signer.id_number" :pic-role="roleAbbreviation[sopData.pic_position || signer.role]"
                :created-date="sopData.creation_date" :revision-date="sopData.revision_date"
                :effective-date="sopData.status == 0 ? `${sopData.effective_date} (Kadaluarsa)` : sopData.effective_date"
                :section="sopData.section" :warning="sopData.warning"
                :law-basis="sopData.legalBasis.map(item => item.legal)"
                :implement-qualification="sopData.implementQualification.map(item => item.qualification)"
                :related-sop="sopData.relatedSop.map(item => item.related_sop)"
                :equipment="sopData.equipment.map(item => item.equipment)"
                :record-data="sopData.record.map(item => item.data_record)"
                :signature="`${cdnUrl}/${sopData.signature_url}`" />

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

            <div v-if="activeTab === 'document'" class="w-full print:overflow-visible">
                <div class="print:block print:bg-white">
                    <SopStepTemplate :implementer="sopData.implementer" :steps="sopData.steps" />
                </div>
            </div>

            <div v-else-if="activeTab === 'bpmn'">
                <div v-if="sopData.steps && sopData.steps.length > 0 && sopData.implementer && sopData.implementer.length > 0"
                    class="w-full print:overflow-visible">
                    <div class="print:block print:bg-white">
                        <SopBpmnTemplate :name="sopData.name" :steps="sopData.steps || []"
                            :implementer="sopData.implementer || []" />
                    </div>
                </div>
                <div v-else class="my-4 p-4 bg-gray-100 rounded text-center mx-auto">
                    Belum ada tahapan yang diinputkan oleh penyusun!
                </div>
            </div>

            <button @click="printSop"
                class="mx-auto text-white bg-[#2557D6] hover:bg-[#2557D6]/90 focus:ring-4 focus:ring-[#2557D6]/50 focus:outline-none font-medium rounded-lg text-base py-3 px-6 flex items-center justify-center print:hidden mt-6">
                <PrintIcon class="w-5 mr-3 fill-current" />
                Cetak SOP (Ukuran A4)
            </button>

            <div class="mx-4 sm:mx-10 lg:w-2/3 lg:mx-auto mt-10 mb-6 print:hidden">
                <div class="border-b-2 border-blue-500 pb-2 mb-4 flex justify-between items-center">
                    <h2 class="text-2xl font-bold">Umpan Balik Pengguna</h2>
                    <span v-if="draftFeedback && draftFeedback.length > 0" class="text-sm text-gray-500">{{ draftFeedback.length }} komentar</span>
                </div>

                <div v-if="draftFeedback && draftFeedback.length > 0" class="space-y-2">
                    <!-- Menampilkan hanya 4 feedback pertama -->
                    <div v-for="(feedback, index) in displayedFeedback" :key="index"
                        class="bg-white p-3 rounded-lg shadow-sm border-l-4 border-blue-500 hover:shadow-md transition duration-300">
                        <div class="flex items-center mb-1 justify-between">
                            <div class="flex items-center">
                                <div class="bg-blue-100 rounded-full p-1.5 mr-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </div>
                                <span class="text-sm font-bold text-gray-800">{{ feedback?.user?.name || 'User' }}</span>
                                <span class="ml-2 px-1.5 py-0.5 text-xs bg-gray-200 text-gray-700 rounded-full">{{ roleAbbreviation[feedback.user.role] }}</span>
                                <span class="mx-2 text-gray-400 text-xs">|</span>
                                <span class="text-xs text-gray-600">{{ feedback?.createdAt || '-' }}</span>
                            </div>

                            <!-- Tombol hapus hanya muncul jika user yang login adalah pembuat komentar -->
                            <button v-if="authStore.userIdNumber === feedback.user.id_number"
                                @click="openDeleteModal(feedback.id)"
                                class="text-gray-400 hover:text-red-500 transition-colors p-1 rounded-full hover:bg-red-50"
                                title="Hapus komentar anda">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </button>
                        </div>
                        <p class="text-sm mt-1 pl-8 text-gray-700">{{ feedback?.feedback || '-' }}</p>
                    </div>

                    <!-- Tombol untuk menampilkan seluruh feedback -->
                    <div v-if="draftFeedback.length > 4" class="flex justify-center mt-2">
                        <button v-if="!showAllFeedback" @click="showAllFeedback = true"
                            class="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors">
                            Lihat semua {{ draftFeedback.length }} komentar
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>
                        <button v-else @click="showAllFeedback = false"
                            class="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors">
                            Lihat lebih sedikit
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
                            </svg>
                        </button>
                    </div>
                </div>

                <div v-else class="bg-gray-50 p-6 rounded-lg text-center border border-dashed border-gray-300">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 mx-auto text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                    <p class="text-gray-500 text-base">Belum ada umpan balik yang diberikan.</p>
                </div>
            </div>

            <div class="mx-4 sm:mx-10 lg:w-2/3 lg:mx-auto my-10 print:hidden">
                <div class="border-b-2 border-blue-500 pb-2 mb-6">
                    <h2 class="text-2xl font-bold">Form Umpan Balik</h2>
                </div>

                <div class="relative mb-32">
                    <form @submit.prevent="submitFeedback" class="w-full bg-white space-y-5"
                        :class="{ 'blur-sm pointer-events-none': !authStore.isAuthenticated }">
                        <textarea v-model="newFeedback" rows="4" minlength="5" maxlength="500" required
                            class="block p-3 w-full text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                            placeholder="Ketikkan kritik atau saran Anda untuk perbaikan SOP..."></textarea>

                        <button type="submit"
                            class="w-full text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-3 transition duration-300 flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 transform rotate-45" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                            </svg>
                            Kirim Umpan Balik
                        </button>
                    </form>

                    <!-- Overlay Login -->
                    <div v-if="!authStore.isAuthenticated" class="absolute inset-0 flex items-center justify-center">
                        <div class="bg-white/95 shadow-xl rounded-lg py-5 px-6 text-center w-5/6 max-w-lg mx-auto flex flex-col items-center">
                            <div class="bg-blue-100 rounded-full p-3 w-14 h-14 flex items-center justify-center mb-3">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            </div>
                            <h3 class="text-xl font-bold mb-2 text-gray-800">Silakan Login</h3>
                            <p class="text-gray-600 mb-4">Anda harus login terlebih dahulu untuk memberikan umpan balik</p>
                            <RouterLink to="/login" class="w-3/4 max-w-xs">
                                <button class="text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-base px-6 py-2.5 transition duration-300 w-full flex items-center justify-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                                    </svg>
                                    Login Sekarang
                                </button>
                            </RouterLink>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <DeleteDataModal :showModal="showModalDelete" :selected-id="feedbackIdToDelete" :deleteData="deleteFeedback"
            text="Apakah anda yakin ingin menghapus umpan balik ini?" @update:showModal="showModalDelete = $event" />
    </template>

    <Error v-else @click="reloadPage" />
</template>
