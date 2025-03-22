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
import PenToSquareIcon from '@/assets/icons/PenToSquareIcon.vue';
import TrashCanIcon from '@/assets/icons/TrashCanIcon.vue';
import DeleteDataModal from '@/components/modal/DeleteDataModal.vue';
import PageTitle from '@/components/authenticated/PageTitle.vue';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const layoutType = inject('layoutType');
layoutType.value = 'admin';

const statusSop = ref('');
const newFeedback = ref('');
const draftFeedback = ref([]);

const showModal = ref({
    approveSopDraft: false,
    editAssignment: false,
    deleteAssignment: false,
});

const sopData = ref({
    id: null,
    id_sop: null,
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

const fetchSopVersion = async () => {
    try {
        const result = await getSopVersion(route.params.id);
        if (!result.success) {
            console.error('API Error:', result.error);
            return;
        }

        if (result?.data) {
            sopData.value = { ...sopData.value, ...result.data };
        }

    } catch (error) {
        console.error('Fetch error:', error);
    }
};

const fetchInfoSop = async () => {
    try {

        let response = await getSectionandWarning(route.params.id);
        sopData.value.section = response.data.section;
        sopData.value.warning = response.data.warning;

        response = await getSopImplementer(route.params.id);
        sopData.value.implementer = response.data;

        response = await getSopLawBasis(route.params.id);
        sopData.value.legalBasis = response.data.map(item => ({
            id: item.id,
            legal: `${item.law_type} Nomor ${item.number} Tahun ${item.year} tentang ${item.about}`
        }));;

        response = await getIQ(route.params.id);
        sopData.value.implementQualification = response.data.map(item => item.qualification);

        response = await getRelatedSop(route.params.id);
        sopData.value.relatedSop = response.data.map(item => item.related_sop);

        response = await getSopEquipment(route.params.id);
        sopData.value.equipment = response.data.map(item => item.equipment);

        response = await getSopRecord(route.params.id);
        sopData.value.record = response.data.map(item => item.data_record);

        response = null;

    } catch (error) {
        console.error('Fetch info sop error:', error);
    }
};

const fetchSopStep = async () => {
    try {
        const response = await getSopStep(route.params.id);
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

    // Jika setuju dan user adalah kadep, tampilkan modal konfirmasi terlebih dahulu
    if (statusSop.value == 1 && authStore.userRole === 'kadep') {
        // Simpan data feedback untuk digunakan nanti
        showModal.value.approveSopDraft = true;
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
    let redirectPath = `/app/docs/${sopData.value.id_sop}`;

    if (feedbackData.type == 1) {         // setuju
        // cek dulu lingkup organisasinya apakah dsi atau tidak
        const isDSI = sopData.value.organization.name === 'Departemen Sistem Informasi' ||
            sopData.value.organization.id === 0;

        if (isDSI || authStore.userRole === 'kadep') {
            newStatus = 7; // Sedang disahkan oleh Kadep
            redirectPath = `/app/docs/legal/${route.params.id}`;
        } else if (authStore.userRole === 'pj') {
            newStatus = 5; // Sedang direview Kadep
        }
    } else if (feedbackData.type == 2) {  // perlu revisi
        newStatus = authStore.userRole === 'kadep' ? 6 : 4; // 6 for Kadep, 4 for PJ
    }

    // Update status dan redirect
    if (newStatus !== null) {
        await updateSopDetail(route.params.id, { status: newStatus });
        setTimeout(() => {
            router.push(redirectPath);
        }, 5000);
    }
};

const confirmSop = async () => {
    // Tutup modal
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

const redirectEditAssignment = () => {
    router.push({
        name: 'SopAssignmentUpdate',
        params: { id: route.params.id },
    }).catch((err) => {
        if (err.name !== 'NavigationDuplicated') {
            console.error('Navigation error:', err);
        }
    });
};

const deleteData = async (id) => {
    // Implementasi penghapusan data
    console.log('Menghapus data dengan ID:', id);
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

        <div class="text-4xl my-10 font-bold flex justify-center items-center">
            <PageTitle :judul="`Pengecekan Draft SOP ${sopData?.name}`" />
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
            <button type="button" @click="router.push(`/app/docs/legal/${route.params.id}`)"
                class="w-2/5 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5">
                <p>Lanjut ke Pengesahan SOP ==></p>
            </button>
        </div>

    </main>

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

    <!-- <div class="fixed inset-0 z-50 flex items-center justify-center w-full h-full" v-show="showModal.editAssignment">

        <div class="fixed inset-0 bg-gray-800 bg-opacity-30" @click="showModal.editAssignment = false"></div>

        <div class="relative w-full max-w-2xl max-h-full">
            <div class="relative bg-white rounded-lg shadow">
                <div class="flex items-center justify-between p-4 md:p-5 border-b rounded-t">
                    <h3 class="text-xl font-medium text-gray-900">
                        Perbarui Data Penugasan
                    </h3>
                    <button type="button"
                        class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center"
                        @click="showModal.editAssignment = false">
                        <XMarkCloseIcon class="w-3 h-3" />
                        <span class="sr-only">Tutup modal</span>
                    </button>
                </div>

                <div class="p-4 md:p-5 space-y-4 max-h-[620px] overflow-y-auto">
                    <div class="grid gap-4 mb-4 grid-cols-2">
                        <div class="col-span-2">
                            <label for="name" class="block mb-2 text-sm font-medium text-gray-900">Nama</label>
                            <input type="text" id="name"
                                class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                                placeholder="belum ada data" readonly>
                        </div>
                        <div class="col-span-2 sm:col-span-1">
                            <label for="num" class="block mb-2 text-sm font-medium text-gray-900">
                                Nomor<span class="text-red-600">*</span>
                            </label>
                            <div class="flex items-center">
                                <span
                                    class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-l-lg p-2.5">
                                    T/
                                </span>
                                <input name="num" type="number" min="1" max="999" required @blur=""
                                    class="bg-gray-50 border-t border-b border-gray-300 text-gray-900 text-sm p-2.5 min-w-12 w-full"
                                    title="Masukkan no urut sop">
                                <span
                                    class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-r-lg p-2.5 w-fit whitespace-nowrap">
                                    /UN16.17.02/OT.01.00/{{ new Date().getFullYear() }}
                                </span>
                            </div>
                        </div>
                        <div class="col-span-2 sm:col-span-1">
                            <label for="org" class="block mb-2 text-sm font-medium text-gray-900">
                                Organisasi<span class="text-red-600">*</span>
                            </label>
                            <select id="org" required
                                class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5">
                                <option selected disabled value="">Pilih organisasi</option>
                                <option value="2">Dua</option>
                            </select>
                        </div>

                        <div class="col-span-2">
                            <label for="description"
                                class="block mb-2 text-sm font-medium text-gray-900">Deskripsi</label>
                            <textarea id="description" rows="4"
                                class="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                                readonly placeholder="belum ada data"></textarea>
                        </div>
                        <div class="col-span-2">
                            <label class="block mb-2 text-sm font-medium text-gray-900">Penyusun</label>
                            <ul class="max-w-2xl space-y-1 list-disc list-inside columns-2">
                                <li class="italic text-gray-400 text-sm"> belum ada data </li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div
                    class="flex items-center p-4 md:p-5 space-x-3 rtl:space-x-reverse border-t border-gray-200 rounded-b">
                    <button type="button"
                        class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center">
                        Perbarui data penugasan
                    </button>
                </div>
            </div>
        </div>

    </div> -->

    <DeleteDataModal :showModal="showModal.deleteAssignment" :deleteData="deleteData" :selectedId="sopData.id"
        @update:showModal="showModal.deleteAssignment = $event" text="Anda yakin ingin menghapus penugasan SOP ini?" />

</template>
