<script setup>
import { inject, onMounted, provide, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { addDraftFeedback, deleteDraftFeedback, getDraftFeedback } from '@/api/feedbackApi';
import { deleteSopDetail, deleteSopStep, updateSopDetail } from '@/api/sopApi';
import { deleteSopImplementer } from '@/api/implementerApi';
import { deleteIQ } from '@/api/implementQualificationApi';
import { deleteSopEquipment } from '@/api/equipmentApi';
import { deleteRelatedSop } from '@/api/relatedSopApi';
import { deleteSopLawBasis } from '@/api/lawBasisApi';
import { deleteSopRecord } from '@/api/recordApi';
import { deleteSopDrafter } from '@/api/userApi';

import useToastPromise from '@/utils/toastPromiseHandler';
import { switchStatusSopDetail } from '@/utils/getStatus';
import useSopData from '@/composables/useSopData';
import { useAuthStore } from '@/stores/auth';
import roleAbbreviation from '@/data/roleAbbrv.json';

import YellowBadgeIndicator from '@/components/indicator/YellowBadgeIndicator.vue';
import GreenBadgeIndicator from '@/components/indicator/GreenBadgeIndicator.vue';
import BlueBadgeIndicator from '@/components/indicator/BlueBadgeIndicator.vue';
import ExclamationMarkIcon from '@/assets/icons/ExclamationMarkIcon.vue';
import DeleteDataModal from '@/components/modal/DeleteDataModal.vue';
import SopBpmnTemplate from '@/components/sop/SopBpmnTemplate.vue';
import SopInfoTemplate from '@/components/sop/SopInfoTemplate.vue';
import SopStepTemplate from '@/components/sop/SopStepTemplate.vue';
import PenToSquareIcon from '@/assets/icons/PenToSquareIcon.vue';
import PageTitle from '@/components/authenticated/PageTitle.vue';
import XMarkCloseIcon from '@/assets/icons/XMarkCloseIcon.vue';
import TrashCanIcon from '@/assets/icons/TrashCanIcon.vue';
import Error from '@/components/Error.vue';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const cdnUrl = import.meta.env.VITE_CDN_URL; // URL untuk CDN

const layoutType = inject('layoutType');
layoutType.value = 'admin';

const statusSop = ref('');
const newFeedback = ref('');
const draftFeedback = ref([]);
const activeTab = ref('document'); // 'document' or 'bpmn'

const showModal = ref({
    approveSopDraft: false,
    deleteAssignment: false,
});

const { 
    sopData, signer, fetchSopVersion, fetchInfoSop, fetchSopStep, fetchSigner, isDataError, 
    fetchSopDisplayConfig, sopConfig, flowchartArrowConfig, bpmnArrowConfig 
} = useSopData(route.params.id);
provide('sopConfig', sopConfig);

const fetchFeedback = async () => {
    try {
        const response = await getDraftFeedback(route.params.id);
        if (response.success) {
            draftFeedback.value = response.data;
        }
    } catch (error) {
        console.error('Fetch feedback error:', error);
    }
};

const submitFeedback = async () => {
    // Data yang akan dikirim untuk umpan balik
    const feedbackData = {
        id_sop_detail: route.params.id,
        feedback: newFeedback.value,
        type: statusSop.value,
    };

    // Jika setuju, tampilkan modal konfirmasi terlebih dahulu
    if (statusSop.value == 1) {
        showModal.value.approveSopDraft = true;
        return;
    }
    
    console.log('feedbackData', feedbackData);
    await processSubmitFeedback(feedbackData);
};

const confirmSop = async () => {
    showModal.value.approveSopDraft = false;

    // Buat data feedback untuk diproses
    const feedbackData = {
        id_sop_detail: route.params.id,
        feedback: newFeedback.value,
        type: statusSop.value,
    };

    // Proses feedback dan update status
    await processSubmitFeedback(feedbackData);
};

// Fungsi untuk memproses umpan balik dan status update
const processSubmitFeedback = async (feedbackData) => {
    // Kirim umpan balik
    useToastPromise(
        new Promise((resolve, reject) => {
            addDraftFeedback(feedbackData)
                .then(response => {
                    if (!response.success) {
                        throw response;
                    }
                    resolve();
                })
                .catch(error => reject(error));
        }),
        {
            messages: {
                success: 'Umpan balik berhasil dikirim!',
            },
            toastOptions: {
                autoClose: 2000,
            },
        }
    );
    
    // Tentukan status baru dan redirect path berdasarkan pilihan dan role
    let newStatus = null;
    let redirectPath = `/app/docs/${sopData.value.id_sop}`;
    
    if (feedbackData.type == 1) {         // setuju
        // cek dulu lingkup organisasinya apakah dsi atau tidak
        const isDSI = sopData.value.organization.id === 0;

        if (isDSI || authStore.userRole === 'kadep') {
            newStatus = 7; // Sedang disahkan oleh Kadep
        } else if (authStore.userRole === 'pj') {
            newStatus = 8; // Sedang disahkan oleh PJ (kenapa 8? karena status ini baru ditambahkan)
        }
        redirectPath = `/app/docs/draft/${route.params.id}/legal`;
    } else if (feedbackData.type == 2) {  // perlu revisi
        newStatus = authStore.userRole === 'kadep' ? 6 : 4; // 6 for Kadep, 4 for PJ
    } else if (feedbackData.type == 3) { // catatan
        // tidak mengubah status, hanya menambahkan catatan
        setTimeout(() => location.reload(), 2000);
        return;
    }

    // Update status dan redirect
    if (newStatus !== null) {
        await updateSopDetail(route.params.id, { status: newStatus });
        setTimeout(() => {
            router.push(redirectPath);
        }, 2000);
    }
};

const redirectEditAssignment = () => {
    router.push({
        name: 'SopAssignmentUpdate',
        params: { id: route.params.id },
    }).catch((err) => {
        if (err.name !== 'NavigationDuplicated') {
            console.error('Navigation error:', err);
        } else {
            console.error('error :', err);
        }
    });
};

const deleteData = async (id) => {
    console.log('Menghapus data dengan ID:', id);
    try {
        await useToastPromise(
            (async () => {
                // Hapus data child SOP terlebih dahulu secara paralel
                await Promise.all([
                    // many to many
                    ...sopData.value.implementer.map(item => deleteSopImplementer(id, item.id)),
                    ...sopData.value.legalBasis.map(item => deleteSopLawBasis(id, item.id)),
                    ...sopData.value.users.map(item => deleteSopDrafter(id, item.id)),
                    // one to many
                    ...sopData.value.record.map(item => deleteSopRecord(item.id)),
                    ...sopData.value.equipment.map(item => deleteSopEquipment(item.id)),
                    ...sopData.value.relatedSop.map(item => deleteRelatedSop(item.id)),
                    ...sopData.value.implementQualification.map(item => deleteIQ(item.id)),
                    ...sopData.value.steps.map(item => deleteSopStep(item.id_step)),
                    ...draftFeedback.value.map(item => deleteDraftFeedback(item.id))
                ]);
                console.log('Child data SOP berhasil dihapus');

                // Setelah itu, hapus data SOP detail
                await deleteSopDetail(id);
                console.log('SOP detail berhasil dihapus');
            })(),
            {
                messages: {
                    pending: 'Sedang menghapus data SOP...',
                    success: 'SOP berhasil dihapus!',
                    error: 'Gagal menghapus SOP'
                },
                toastOptions: {
                    autoClose: 2000,
                }
            }
        );

        router.replace({ name: 'SopDocDetail', params: { id: sopData.value.id_sop } }).catch((err) => {
            if (err.name !== 'NavigationDuplicated') {
                console.error('Navigation error:', err);
            } else {
                console.error('error :', err);
            }
        });
    } catch (error) {
        console.error('Error saat menghapus data SOP:', error);
    }
};

// Tambahkan fungsi pengecekan status
const isFeedbackFormDisabled = () => {
    return [1, 2, 7, 8].includes(sopData.value.status);
};

// Fungsi untuk menentukan apakah hanya opsi "Catatan" yang boleh dipilih
const isCatatanOnly = () => {
    if (
        (authStore.userRole === 'kadep' && [3, 4].includes(sopData.value.status)) ||
        (authStore.userRole === 'pj' && [5, 6].includes(sopData.value.status))
    ) {
        return true;
    }
    return false;
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
    <div class="my-10 flex justify-center items-center">
        <PageTitle :judul="sopData.name ? `Pengecekan Draft SOP ${sopData?.name}` : 'Ngapain iseng iseng?🤨'" />
        <div class="space-x-2 ml-3 flex justify-center items-center" v-if="[0, 2].includes(sopData.status)">
            <button title="Edit data penugasan" @click="redirectEditAssignment"
                class="p-2 text-white w-8 h-8 bg-yellow-400 rounded-full hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:ring-opacity-50">
                <PenToSquareIcon class="fill-current" />
            </button>
            <button title="Hapus" @click="showModal.deleteAssignment = true"
                class="p-2 text-white w-8 h-8 bg-red-600 rounded-full hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 flex items-center">
                <TrashCanIcon class="fill-current" />
            </button>
        </div>
    </div>

    <template v-if="!isDataError">
        <div class="grid grid-cols-2 lg:grid-cols-3 gap-5">
            <div class="bg-gray-200 p-5 rounded-xl shadow-md">
                <h4 class="mb-2.5 text-lg">Versi</h4>
                <h5 class="text-lg font-bold">
                    {{ sopData?.version }}
                </h5>
            </div>
            <div class="bg-gray-200 p-5 rounded-xl shadow-md">
                <h4 class="mb-2.5 text-lg">Status</h4>
                <h5 class="text-xl font-bold">
                    {{ switchStatusSopDetail(sopData?.status) }}
                </h5>
            </div>
            <div class="bg-gray-200 p-5 rounded-xl shadow-md col-span-2 lg:col-span-1 lg:row-span-2">
                <h4 class="mb-2.5 text-lg">Penyusun</h4>
                <ul class="list-disc list-inside" v-if="sopData?.users.length > 0">
                    <li class="text-lg font-bold" v-for="(user, index) in sopData?.users" :key="index">
                        {{ user.identity_number }} - {{ user.name }}
                    </li>
                </ul>
                <p class="italic text-slate-600" v-else>belum ada penyusun yang dipilih</p>
            </div>
            <div class="bg-gray-200 p-5 rounded-xl shadow-md col-span-2">
                <h4 class="mb-2.5 text-lg">Deskripsi</h4>
                <h5 class="text-base font-bold">
                    {{ sopData?.description }}
                </h5>
            </div>
        </div>

        <SopInfoTemplate class="mt-8"
            :name="sopData.name" :number="sopData.number" 
            :pic-name="signer.name" :pic-number="signer.id_number" 
            :pic-role="roleAbbreviation[sopData.pic_position || signer.role]"
            :created-date="sopData.creation_date" :revision-date="sopData.revision_date" :effective-date="sopData.effective_date" 
            :section="sopData.section" :warning="sopData.warning"
            :law-basis="sopData.legalBasis.map(item => item.legal)"
            :implement-qualification="sopData.implementQualification.map(item => item.qualification)"
            :related-sop="sopData.relatedSop.map(item => item.related_sop)"
            :equipment="sopData.equipment.map(item => item.equipment)"
            :record-data="sopData.record.map(item => item.data_record)"
            :signature="sopData.status === 1 ? `${cdnUrl}/${sopData.signature_url}` : null" 
        />
        
        <div class="flex justify-center my-6">
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
                />
                <SopBpmnTemplate
                    v-else
                    :name="sopData.name"
                    :steps="sopData.steps"
                    :implementer="sopData.implementer"
                    :arrow-config="bpmnArrowConfig"
                />
            </template>
            <div v-else class="my-4 p-4 bg-gray-100 rounded text-center">
                Belum ada tahapan yang diinputkan oleh penyusun!
            </div>
        </div>

        <!-- Only render when both steps and implementer arrays exist and have data -->
        <div class="w-full lg:w-2/3 flex flex-col mx-auto mt-12 mb-5" v-if="![2].includes(sopData.status)">
            <h2 class="text-xl font-semibold mb-4">Umpan Balik Sebelumnya</h2>
            <div v-if="draftFeedback && draftFeedback.length > 0" class="space-y-4">
                <div v-for="(feedback, index) in draftFeedback" :key="index"
                    class="bg-gray-200 p-4 rounded-lg shadow-md">
                    <div class="flex items-center">
                        <span class="text-base font-bold">{{ feedback?.user?.name || 'User' }}</span>
                        <span class="ml-1 mr-2">({{ roleAbbreviation[feedback.user.role] }})</span> |
                        <span class="text-sm text-gray-600 mx-2">{{ feedback?.createdAt || '-' }}</span> |
                        <span class="mx-2">
                            <YellowBadgeIndicator v-if="feedback?.type == 'revisi'" teks="Perlu Revisi" />
                            <GreenBadgeIndicator v-else-if="feedback?.type == 'setuju'" teks="Setuju" />
                            <BlueBadgeIndicator v-else-if="feedback?.type == 'catatan'" teks="Catatan" />
                        </span>
                    </div>
                    <p class="text-lg mt-1 whitespace-pre-line">{{ feedback?.feedback || '-' }}</p>
                </div>
            </div>
            <div v-else class="text-center text-gray-500">
                Belum ada umpan balik yang diberikan.
            </div>
        </div>

        <div class="w-full lg:w-2/3 flex justify-center mx-auto my-10" v-if="!isFeedbackFormDisabled()">
            <form class="w-full bg-white space-y-5" @submit.prevent="submitFeedback">
                <h2 class="text-xl font-semibold mb-4">Form Umpan Balik</h2>
                <div>
                    <label for="status" class="block mb-2 text-sm font-medium">
                        Tipe<span class="text-red-600">*</span>
                    </label>
                    <select type="text" id="status" v-model="statusSop" required
                        class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5">
                        <option selected disabled value="">Pilih tipe</option>
                        <option v-if="!isCatatanOnly()" value="1" title="Setujui SOP">Setujui</option>
                        <option v-if="!isCatatanOnly()" value="2" title="SOP perlu direvisi lagi">Perlu Revisi</option>
                        <option value="3" title="Hanya memberikan catatan/tanggapan tanpa menyetujui atau merevisi SOP">Catatan</option>
                    </select>
                </div>
                <div>
                    <label for="description" class="block mb-2 text-sm font-medium">
                        Keterangan<span class="text-red-600">*</span>
                    </label>
                    <textarea id="description" rows="4" v-model="newFeedback" required minlength="5" maxLength="500"
                        class="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Tuliskan umpan balik anda (minimal 5 karakter)"></textarea>
                </div>
                <button type="submit" :disabled="statusSop === '' || newFeedback.length < 5"
                    class="w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 disabled:cursor-not-allowed disabled:bg-opacity-60">
                    <p v-if="statusSop == 1">Lanjut ke Pengesahan SOP</p>
                    <p v-else>Kirim Umpan Balik</p>
                </button>
            </form>
        </div>

        <div class="flex justify-center mt-8 mb-12" v-if="sopData.status === 7 || sopData.status === 8">
            <button type="button" @click="router.push({ name: 'SopLegalization', params: { id: route.params.id } })"
                class="w-2/5 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5">
                <p>Lanjut ke Pengesahan SOP ==></p>
            </button>
        </div>
    </template>
    <Error v-else @click="fetchAllData" />

    <div v-show="showModal.approveSopDraft"
        class="fixed inset-0 z-50 flex items-center justify-center w-full h-full shadow-lg">
        <div class="fixed inset-0 bg-gray-800 bg-opacity-50" @click="showModal.approveSopDraft = false"></div>
        <div class="relative w-full max-w-2xl max-h-full">
            <div class="relative bg-white rounded-lg shadow">
                <button type="button" @click="showModal.approveSopDraft = false"
                    class="absolute top-3 right-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 inline-flex justify-center items-center">
                    <XMarkCloseIcon class="w-3 h-3" />
                    <span class="sr-only">Tutup modal</span>
                </button>
                <div class="p-4 md:p-5 text-center">
                    <ExclamationMarkIcon class="mx-auto mb-4 text-gray-400 w-12 h-12" />
                    <h3 class="mb-2 text-xl font-normal text-gray-800">
                        Anda yakin ingin menyetujui draft SOP dan BPMN ini?
                    </h3>
                    <p class="text-gray-500 mb-1">
                        Draft SOP ini akan disetujui dan anda akan diarahkan ke halaman pengesahan.
                    </p>
                    <p class="text-gray-600 mb-5">
                        <span class="text-red-600">*</span>
                        Anda tidak dapat lagi mengubah status dan memberikan umpan balik pada draft ini!
                        <span class="text-red-600">*</span>
                    </p>
                    <button @click="confirmSop"
                        class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm inline-flex items-center px-5 py-2.5 text-center">
                        Yakin
                    </button>
                    <button @click="showModal.approveSopDraft = false"
                        class="py-2.5 px-5 ms-3 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100">
                        Batal
                    </button>
                </div>
            </div>
        </div>
    </div>

    <DeleteDataModal 
        :showModal="showModal.deleteAssignment" 
        :deleteData="deleteData" :selectedId="sopData.id"
        @update:showModal="showModal.deleteAssignment = $event"
        text="Anda yakin ingin menghapus penugasan SOP ini? Semua progres yang ada saat ini juga akan dihapus!" 
    />
</template>
