<script setup>
import { inject, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { getSectionandWarning, getSopStep, getSopVersion, updateSopDetail } from '@/api/sopApi';
import { useToastPromise } from '@/utils/toastPromiseHandler';
import { switchStatusSopDetail } from '@/utils/getStatus';
import { getSopImplementer } from '@/api/implementerApi';
import { getSopEquipment } from '@/api/equipmentApi';
import { getIQ } from '@/api/implementQualification';
import { addDraftFeedback } from '@/api/feedbackApi';
import { getRelatedSop } from '@/api/relatedSopApi';
import { getSopLawBasis } from '@/api/lawBasisApi';
import { getSopRecord } from '@/api/recordApi';
import { getCurrentHod } from '@/api/userApi';
import { useAuthStore } from '@/stores/auth';

import Divider from '@/components/Divider.vue';
import SopDocTemplate from '@/components/sop/SopDocTemplate.vue';
import SopBpmnTemplate from '@/components/sop/SopBpmnTemplate.vue';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const layoutType = inject('layoutType');
layoutType.value = 'admin';

const statusSop = ref('');
const feedback = ref('');

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

let idsopdetail;
const fetchSopVersion = async () => {
    try {
        const result = await getSopVersion(route.query.id, route.query.version);
        if (!result.success) {
            console.error('API Error:', result.error);
            return;
        }

        if (result?.data) {
            idsopdetail = result.data.id;
            sopData.value = { ...sopData.value, ...result.data };
        }

    } catch (error) {
        console.error('Fetch error:', error);
    }
};

const fetchInfoSop = async () => {
    try {

        let response = await getSectionandWarning(idsopdetail);
        sopData.value.section = response.data.section;
        sopData.value.warning = response.data.warning;

        response = await getSopImplementer(idsopdetail);
        sopData.value.implementer = response.data;

        response = await getSopLawBasis(idsopdetail);
        sopData.value.legalBasis = response.data.map(item => ({
            id: item.id,
            legal: `${item.law_type} Nomor ${item.number} Tahun ${item.year} tentang ${item.about}`
        }));;

        response = await getIQ(idsopdetail);
        sopData.value.implementQualification = response.data.map(item => item.qualification);

        response = await getRelatedSop(idsopdetail);
        sopData.value.relatedSop = response.data.map(item => item.related_sop);

        response = await getSopEquipment(idsopdetail);
        sopData.value.equipment = response.data.map(item => item.equipment);

        response = await getSopRecord(idsopdetail);
        sopData.value.record = response.data.map(item => item.data_record);

        response = null;

    } catch (error) {
        console.error('Fetch info sop error:', error);
    }
};

const fetchSopStep = async () => {
    try {
        const response = await getSopStep(idsopdetail);
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

const submitFeedback = async () => {
    const data = {
        id_sop_detail: idsopdetail,
        status: statusSop.value,
        feedback: feedback.value,
    };

    useToastPromise(
        new Promise((resolve, reject) => {
            addDraftFeedback(data)
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

    if (statusSop.value == 1) {         // setuju
        // cek dulu lingkup organisasinya apakah dsi atau tidak
        if (sopData.value.organization.name === 'Departemen Sistem Informasi' || sopData.value.organization.id === 0) {
            // jika iya, maka langsung ke pengesahan oleh kadep
            // sop yang tampil di sini hanya bisa dilihat oleh kadep, sudah diatur di backend
            await updateSopDetail(idsopdetail, { status: 7 });
            setTimeout(() => {
                router.push(`/app/docs/legal/${route.query.id}`)
            }, 5000);
            
        } else {
            // jika tidak, maka akan dicek dulu oleh pj, jika pj sudah setuju maka akan diteruskan ke kadep
            if (authStore.userRole === 'kadep') {
                await updateSopDetail(idsopdetail, { status: 7 });
                setTimeout(() => {
                    router.push(`/app/docs/legal/${route.query.id}`)
                }, 5000);
            } else if (authStore.userRole === 'pj') {
                await updateSopDetail(idsopdetail, { status: 5 });
                setTimeout(() => {
                    router.push(`/app/docs/${route.query.id}`)
                }, 5000);
            }
        }
    } else if (statusSop.value == 2) {  // perlu revisi
        if (authStore.userRole === 'kadep') {
            await updateSopDetail(idsopdetail, { status: 6 });
        } else if (authStore.userRole === 'pj') {
            await updateSopDetail(idsopdetail, { status: 4 });
        }
        setTimeout(() => {
            router.push(`/app/docs/${route.query.id}`)
        }, 5000);
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

        <SopDocTemplate class="mt-8"
            :name="sopData.name" 
            :number="sopData.number"
            created-date="-" 
            :revision-date="sopData.revision_date" 
            :effective-date="sopData.effective_date" 
            :pic-name="hodData.name"
            :pic-number="hodData.id_number" 
            :section="sopData.section" 
            :law-basis="sopData.legalBasis.map(item => item.legal)" 
            :implement-qualification="sopData.implementQualification" 
            :related-sop="sopData.relatedSop" 
            :equipment="sopData.equipment" 
            :warning="sopData.warning"
            :record-data="sopData.record"

            :implementer="sopData.implementer"
            :steps="sopData.steps"
        />

        <Divider />

        <!-- Only render when both steps and implementer arrays exist and have data -->
        <SopBpmnTemplate 
            v-if="sopData.steps && sopData.steps.length > 0 && sopData.implementer && sopData.implementer.length > 0"
            :name="sopData.name" 
            :steps="sopData.steps || []" 
            :implementer="sopData.implementer || []" 
        />
        <div v-else class="my-4 p-4 bg-gray-100 rounded text-center">
            Belum ada tahapan yang diinputkan oleh penyusun!
        </div>

        <div class="w-full lg:w-2/3 flex justify-center mx-auto mt-5 mb-10" v-if="![2].includes(sopData.status)">
            <form class="w-full bg-white p-6 space-y-5" @submit.prevent="submitFeedback">
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
                    <label for="description" class="block mb-2 text-sm font-medium">Keterangan<span class="text-red-600">*</span></label>
                    <textarea id="description" rows="4" v-model="feedback" required minlength="5" maxLength="500"
                        class="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500" 
                        placeholder="Tuliskan umpan balik anda (minimal 5 karakter)"></textarea>
                </div>
                <button type="submit" :disabled="statusSop === '' || feedback.length < 5"
                    class="w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 disabled:cursor-not-allowed disabled:bg-opacity-60">
                    <p v-if="statusSop == 1">Lanjut ke Pengesahan SOP</p>
                    <p v-else>Kirim Umpan Balik</p>
                </button>
            </form>
        </div>

    </main>
</template>
