<script setup>
import { inject, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { getSectionandWarning, getSopStep, getSopVersion, updateSopDetail } from '@/api/sopApi';
import { addDraftFeedback, getDraftFeedback } from '@/api/feedbackApi';
import { getSopImplementer } from '@/api/implementerApi';
import { getSopEquipment } from '@/api/equipmentApi';
import { getIQ } from '@/api/implementQualification';
import { getRelatedSop } from '@/api/relatedSopApi';
import { getSopLawBasis } from '@/api/lawBasisApi';
import { getSopRecord } from '@/api/recordApi';
import { getCurrentHod } from '@/api/userApi';

import { useToastPromise } from '@/utils/toastPromiseHandler';
import { switchStatusSopDetail } from '@/utils/getStatus';
import { useAuthStore } from '@/stores/auth';

import Divider from '@/components/Divider.vue';
import SopDocTemplate from '@/components/sop/SopDocTemplate.vue';
import SopBpmnTemplate from '@/components/sop/SopBpmnTemplate.vue';
import GreenBadgeIndicator from '@/components/indicator/GreenBadgeIndicator.vue';
import YellowBadgeIndicator from '@/components/indicator/YellowBadgeIndicator.vue';
import ExclamationMarkIcon from '@/assets/icons/ExclamationMarkIcon.vue';
import XMarkCloseIcon from '@/assets/icons/XMarkCloseIcon.vue';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const layoutType = inject('layoutType');
layoutType.value = 'admin';

const statusSop = ref('');
const newFeedback = ref('');
const draftFeedback = ref([]);
const showConfirmationModal = ref(false);

const sopData = ref({
    id: '',
    name: '',
    is_active: null,
    number: '',
    version: '',
    status: null,
    description: '',
    pic_position: '',
    revision_date: '',
    effective_date: '',
    section: '',
    users: [],
    organization: {},

    implementer: [],
    legalBasis: [],
    implementQualification: [],
    relatedSop: [],
    equipment: [],
    warning: '',
    record: [],

    steps: [],
});
const hodData = ref({
    id_number: '',
    name: '',
});

const idsopdetail = ref(null);

const fetchSopVersion = async () => {
    try {
        const result = await getSopVersion(route.query.id, route.query.version);
        if (!result.success) {
            console.error('API Error:', result.error);
            return;
        }

        if (result?.data) {
            idsopdetail.value = result.data.id;
            sopData.value = { ...sopData.value, ...result.data };
        }

    } catch (error) {
        console.error('Fetch error:', error);
    }
};

const fetchInfoSop = async () => {
    try {

        let response = await getSectionandWarning(idsopdetail.value);
        sopData.value.section = response.data.section;
        sopData.value.warning = response.data.warning;

        response = await getSopImplementer(idsopdetail.value);
        sopData.value.implementer = response.data;

        response = await getSopLawBasis(idsopdetail.value);
        sopData.value.legalBasis = response.data.map(item => ({
            id: item.id,
            legal: `${item.law_type} Nomor ${item.number} Tahun ${item.year} tentang ${item.about}`
        }));;

        response = await getIQ(idsopdetail.value);
        sopData.value.implementQualification = response.data.map(item => item.qualification);

        response = await getRelatedSop(idsopdetail.value);
        sopData.value.relatedSop = response.data.map(item => item.related_sop);

        response = await getSopEquipment(idsopdetail.value);
        sopData.value.equipment = response.data.map(item => item.equipment);

        response = await getSopRecord(idsopdetail.value);
        sopData.value.record = response.data.map(item => item.data_record);

        response = null;

    } catch (error) {
        console.error('Fetch info sop error:', error);
    }
};

const fetchSopStep = async () => {
    try {
        const response = await getSopStep(idsopdetail.value);
        sopData.value.steps = response.data.sort((a, b) => a.seq_number - b.seq_number);
    } catch (error) {
        console.error('Fetch tahapan sop error:', error);
    }
};

const fetchCurrentHod = async () => {
    try {
        const response = await getCurrentHod();
        hodData.value.id_number = response.data.id_number;
        hodData.value.name = response.data.name;
    } catch (error) {
        console.error('Fetch data kadep error:', error);
    }
};

const fetchFeedback = async () => {
    try {
        const response = await getDraftFeedback(idsopdetail.value);
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
        id_sop_detail: idsopdetail.value,
        feedback: newFeedback.value,
        type: statusSop.value,
    };

    // Jika setuju dan user adalah kadep, tampilkan modal konfirmasi terlebih dahulu
    if (statusSop.value == 1 && authStore.userRole === 'kadep') {
        // Simpan data feedback untuk digunakan nanti
        showConfirmationModal.value = true;
        return; // Hentikan eksekusi fungsi di sini
    }

    // Untuk kasus lain (bukan kadep atau tidak setuju), lanjutkan normal
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
                    resolve(response);
                })
                .catch(error => reject(error));
        }),
        {
            messages: {
                success: 'Umpan balik berhasil dikirim!',
            }
        }
    );

    // Tentukan status baru dan redirect path berdasarkan pilihan dan role
    let newStatus = null;
    let redirectPath = `/app/docs/${route.query.id}`;

    if (feedbackData.type == 1) {         // setuju
        // cek dulu lingkup organisasinya apakah dsi atau tidak
        const isDSI = sopData.value.organization.name === 'Departemen Sistem Informasi' ||
            sopData.value.organization.id === 0;

        if (isDSI || authStore.userRole === 'kadep') {
            newStatus = 7; // Sedang disahkan oleh Kadep
            redirectPath = `/app/docs/legal/${idsopdetail.value}`;
        } else if (authStore.userRole === 'pj') {
            newStatus = 5; // Sedang direview Kadep
        }
    } else if (feedbackData.type == 2) {  // perlu revisi
        newStatus = authStore.userRole === 'kadep' ? 6 : 4; // 6 for Kadep, 4 for PJ
    }

    // Update status dan redirect
    if (newStatus !== null) {
        await updateSopDetail(idsopdetail.value, { status: newStatus });
        setTimeout(() => {
            router.push(redirectPath);
        }, 5000);
    }
};

const confirmSop = async () => {
    // Tutup modal
    showConfirmationModal.value = false;

    // Buat data feedback untuk diproses
    const feedbackData = {
        id_sop_detail: idsopdetail.value,
        feedback: newFeedback.value,
        type: statusSop.value,
    };

    // Proses feedback dan update status
    await processSubmitFeedback(feedbackData);
};

onMounted(async () => {
    await fetchSopVersion();
    await fetchInfoSop();
    await fetchSopStep();
    await fetchCurrentHod();
    await fetchFeedback();
});
</script>

<template>
    <main class="p-4 md:ml-64 h-auto pt-20 px-10">

        <h2 class="text-4xl text-center my-10 font-bold"> Pengecekan Draft SOP {{ sopData?.name }}</h2>

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
                <ul class="list-disc list-inside">
                    <li class="text-lg font-bold" v-for="(user, index) in sopData?.users" :key="index">
                        {{ user.identity_number }} - {{ user.name }}
                    </li>
                </ul>
            </div>
            <div class="bg-gray-200 p-5 rounded-xl shadow-md col-span-2">
                <h4 class="mb-2.5 text-lg">Deskripsi</h4>
                <h5 class="text-base font-bold">
                    {{ sopData?.description }}
                </h5>
            </div>
        </div>

        <SopDocTemplate class="mt-8" :name="sopData.name" :number="sopData.number" created-date="-"
            :revision-date="sopData.revision_date" :effective-date="sopData.effective_date" :pic-name="hodData.name"
            :pic-number="hodData.id_number" :section="sopData.section"
            :law-basis="sopData.legalBasis.map(item => item.legal)"
            :implement-qualification="sopData.implementQualification" :related-sop="sopData.relatedSop"
            :equipment="sopData.equipment" :warning="sopData.warning" :record-data="sopData.record"
            :implementer="sopData.implementer" :steps="sopData.steps" />

        <Divider />

        <!-- Only render when both steps and implementer arrays exist and have data -->
        <SopBpmnTemplate
            v-if="sopData.steps && sopData.steps.length > 0 && sopData.implementer && sopData.implementer.length > 0"
            :name="sopData.name" :steps="sopData.steps || []" :implementer="sopData.implementer || []" />

        <div v-else class="my-4 p-4 bg-gray-100 rounded text-center">
            Belum ada tahapan yang diinputkan oleh penyusun!
        </div>

        <div class="w-full lg:w-2/3 flex flex-col mx-auto mt-12 mb-5" v-if="![2].includes(sopData.status)">
            <h2 class="text-xl font-semibold mb-4">Umpan Balik Sebelumnya</h2>
            <div v-if="draftFeedback && draftFeedback.length > 0" class="space-y-4">
                <div v-for="(feedback, index) in draftFeedback" :key="index"
                    class="bg-gray-200 p-4 rounded-lg shadow-md">
                    <div class="flex items-center">
                        <span class="text-base font-bold">{{ feedback?.user?.name || 'User' }}</span>
                        <span class="ml-1 mr-2">({{ feedback.user.role }})</span> |
                        <span class="text-sm text-gray-600 mx-2">{{ feedback?.createdAt || '-' }}</span> |
                        <span class="mx-2">
                            <YellowBadgeIndicator v-if="feedback?.type == 'revisi'" teks="Perlu Revisi" />
                            <GreenBadgeIndicator v-else-if="feedback?.type == 'setuju'" teks="Setuju" />
                        </span>
                    </div>
                    <p class="text-lg mt-1">{{ feedback?.feedback || '-' }}</p>
                </div>
            </div>
            <div v-else class="text-center text-gray-500">
                Belum ada umpan balik yang diberikan.
            </div>
        </div>

        <div class="w-full lg:w-2/3 flex justify-center mx-auto my-10" v-if="![2, 7].includes(sopData.status)">
            <form class="w-full bg-white space-y-5" @submit.prevent="submitFeedback">
                <h2 class="text-xl font-semibold mb-4">Form Umpan Balik</h2>
                <div>
                    <label for="status" class="block mb-2 text-sm font-medium">Status<span
                            class="text-red-600">*</span></label>
                    <select type="text" id="status" v-model="statusSop"
                        class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                        required>
                        <option selected disabled value="">Pilih status</option>
                        <option value="1">Setuju</option>
                        <option value="2">Perlu Revisi</option>
                    </select>
                </div>
                <div>
                    <label for="description" class="block mb-2 text-sm font-medium">Keterangan<span
                            class="text-red-600">*</span></label>
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

        <div class="flex justify-center mt-8 mb-12" v-if="sopData.status === 7">
            <button type="button" @click="router.push(`/app/docs/legal/${route.query.id}`)"
                class="w-2/5 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5">
                <p>Lanjut ke Pengesahan SOP ==></p>
            </button>
        </div>

    </main>

    <div v-show="showConfirmationModal"
        class="fixed inset-0 z-50 flex items-center justify-center w-full h-full shadow-lg">
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
                    <button @click="showConfirmationModal = false"
                        class="py-2.5 px-5 ms-3 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100">
                        Batal
                    </button>
                </div>
            </div>
        </div>
    </div>

</template>
