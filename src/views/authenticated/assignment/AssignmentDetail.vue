<script setup>
import { ref, provide, onMounted, watch, inject, computed, onBeforeUnmount } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { toast } from 'vue3-toastify';

import { createSopStep, getAssignmentDetail, getSectionandWarning, getSopStep, updateSopDetail, updateSopStep, deleteSopStep, saveSopDisplayConfig } from '@/api/sopApi';
import { createSopLawBasis, getLawBasis, getSopLawBasis, deleteSopLawBasis } from '@/api/lawBasisApi';
import { createSopImplementer, getSopImplementer, deleteSopImplementer } from '@/api/implementerApi';
import { createEquipment, getSopEquipment, deleteSopEquipment } from '@/api/equipmentApi';
import { createRelatedSop, getRelatedSop, deleteRelatedSop } from '@/api/relatedSopApi';
import { createRecord, getSopRecord, deleteSopRecord } from '@/api/recordApi';
import { createIQ, getIQ, deleteIQ } from '@/api/implementQualificationApi';
import useToastPromise from '@/utils/toastPromiseHandler';
import { getDraftFeedback } from '@/api/feedbackApi';
import useSopData from '@/composables/useSopData';

import NumberOneCircleIcon from '@/assets/icons/NumberOneCircleIcon.vue';
import NumberTwoCircleIcon from '@/assets/icons/NumberTwoCircleIcon.vue';
import NumberThreeCircleIcon from '@/assets/icons/NumberThreeCircleIcon.vue';
import CircleArrowRight from '@/assets/icons/CircleArrowRight.vue';
import CircleArrowLeft from '@/assets/icons/CircleArrowLeft.vue';
import FloppyDiskIcon from '@/assets/icons/FloppyDiskIcon.vue';
import CheckIcon from '@/assets/icons/CheckIcon.vue';
import GearIcon from '@/assets/icons/GearIcon.vue';

import FirstStep from './step/FirstStep.vue';
import SecondStep from './step/SecondStep.vue';
import ThirdStep from './step/ThirdStep.vue';
import PageTitle from '@/components/authenticated/PageTitle.vue';
import Error from '@/components/Error.vue';

const layoutType = inject('layoutType');
layoutType.value = 'guest';

const route = useRoute();
const router = useRouter();
let idsopdetail = route.params.id;

// State untuk mengatur langkah
const currentStep = ref(1);  // Langkah sekarang
const firstStepRef = ref(null);

const showFeedback = ref(false)
const draftFeedback = ref([]);

const assignmentInfo = ref();
const legalBasisData = ref();
const formData = ref({
    section: '',
    implementer: [],
    legalBasis: [],
    implementQualification: [],
    relatedSop: [],
    equipment: [],
    warning: '',
    record: []
});
const sopStep = ref([]);
const isDisabled = computed(() => {
    return assignmentInfo.value && (assignmentInfo.value.status === 1 || assignmentInfo.value.status === 0);
});

// Fungsi untuk menentukan apakah data sudah lengkap, sekaligus mengecek apakah user iseng
const isDataError = computed(() => {
    return !assignmentInfo.value || !assignmentInfo.value.name || !assignmentInfo.value.number;
});

const { fetchSopDisplayConfig, fetchSigner, sopConfig, signer } = useSopData(idsopdetail);

provide('assignmentInfo', assignmentInfo);
provide('sopStep', sopStep);
provide('legalBasisData', legalBasisData);
provide('sopFormData', {
    formData,
    updateFormData(newData) {
        formData.value = { ...formData.value, ...newData }
    }
});
provide('isDisabled', isDisabled);
provide('sopConfig', sopConfig);

const fetchAssignmentInfo = async () => {
    try {
        const response = await getAssignmentDetail(idsopdetail);
        assignmentInfo.value = response.data;
    } catch (error) {
        console.error('Fetch error:', error);
    }
};

const fetchLegalBasis = async () => {
    try {
        const response = await getLawBasis();
        legalBasisData.value = response.data.map(item => ({
            id: item.id,
            legal: `${item.law_type} Nomor ${item.number} Tahun ${item.year} tentang ${item.about}`
        }));
    } catch (error) {
        console.error('Fetch error:', error);
    }
};

const fetchInfoSop = async () => {
    try {
        let response = await getSectionandWarning(idsopdetail);
        formData.value.section = response.data.section;
        formData.value.warning = response.data.warning;

        response = await getSopImplementer(idsopdetail);
        formData.value.implementer = response.data;

        response = await getSopLawBasis(idsopdetail);
        formData.value.legalBasis = response.data.map(item => ({
            id: item.id,
            legal: `${item.law_type} Nomor ${item.number} Tahun ${item.year} tentang ${item.about}`
        }));;

        response = await getIQ(idsopdetail);
        formData.value.implementQualification = response.data.map(item => item.qualification);

        response = await getRelatedSop(idsopdetail);
        formData.value.relatedSop = response.data.map(item => item.related_sop);

        response = await getSopEquipment(idsopdetail);
        formData.value.equipment = response.data.map(item => item.equipment);

        response = await getSopRecord(idsopdetail);
        formData.value.record = response.data.map(item => item.data_record);

        response = null;

    } catch (error) {
        console.error('Fetch info sop error:', error);
    }
};

watch(() => sopStep.value,
    (newValue) => {
        if (!newValue || newValue.length === 0) {
            sopStep.value = [{
                id_step: null,
                id_next_step_if_no: null,
                id_next_step_if_yes: null,
                seq_number: null,
                name: '',
                type: 'terminator',
                id_implementer: 0,
                fittings: '',
                time: 0,
                time_unit: 'm',
                output: '',
                description: ''
            }];
        }
    },
    { immediate: true }
);

let apiResponseStep;
const fetchSopStep = async () => {
    try {
        let response = await getSopStep(idsopdetail);
        apiResponseStep = response.data

        sopStep.value = response.data.map(item => ({ ...item }));

    } catch (error) {
        console.error('Fetch tahapan sop error:', error);
    }
};

// jalanin kalau status sop selain 1 dan 2
const fetchFeedback = async () => {
    try {
        const response = await getDraftFeedback(idsopdetail);
        if (response.success) {
            draftFeedback.value = response.data;
        }
    } catch (error) {
        console.error('Fetch feedback error:', error);
    }
};

// Fungsi untuk update section dan warning
async function updateSectionAndWarning() {
    await updateSopDetail(idsopdetail, {
        section: formData.value.section,
        warning: formData.value.warning
    });
}

// Fungsi untuk membandingkan data baru dan lama
function getDiffData(existingData, apiData, idKey, mode) {
    if (mode === 'two') {
        // Data berupa objek dengan id
        return {
            toAdd: existingData.filter(newItem =>
                !apiData.some(apiItem => apiItem.id === newItem.id)
            ),
            toRemove: apiData.filter(apiItem =>
                !existingData.some(newItem => apiItem.id === newItem.id)
            )
        };
    } else {
        // Data berupa array of string/number
        return {
            toAdd: existingData.filter(newItem =>
                !apiData.some(apiItem => apiItem[idKey] === newItem)
            ),
            toRemove: apiData.filter(apiItem =>
                !existingData.some(newItem => apiItem[idKey] === newItem)
            )
        };
    }
}

// Fungsi utama sinkronisasi data SOP
const syncSopInfo = async () => {
    const syncPromise = (async () => {
        try {
            // 1. Update section dan warning
            await updateSectionAndWarning();

            // 2. Konfigurasi data yang akan disinkronkan
            const configs = [
                { data: formData.value.implementer, create: createSopImplementer, del: deleteSopImplementer, key: 'id_implementer', mode: 'two' },
                { data: formData.value.legalBasis, create: createSopLawBasis, del: deleteSopLawBasis, key: 'id_legal', mode: 'two' },
                { data: formData.value.record, create: createRecord, del: deleteSopRecord, key: 'data_record', mode: 'one' },
                { data: formData.value.equipment, create: createEquipment, del: deleteSopEquipment, key: 'equipment', mode: 'one' },
                { data: formData.value.relatedSop, create: createRelatedSop, del: deleteRelatedSop, key: 'related_sop', mode: 'one' },
                { data: formData.value.implementQualification, create: createIQ, del: deleteIQ, key: 'qualification', mode: 'one' }
            ];

            let totalAdded = 0, totalRemoved = 0;

            // 3. Sinkronisasi tiap jenis data
            for (const cfg of configs) {
                const apiResp = await fetchExistingSopInfo(idsopdetail, cfg.key);
                const apiData = apiResp.data;
                const { toAdd, toRemove } = getDiffData(cfg.data, apiData, cfg.key, cfg.mode);

                // Tambah data baru
                for (const item of toAdd) {
                    if (cfg.mode === 'two') {
                        await cfg.create({ id_sop_detail: idsopdetail, [cfg.key]: item.id });
                    } else {
                        await cfg.create({ id_sop_detail: idsopdetail, [cfg.key]: item });
                    }
                }
                // Hapus data yang tidak ada lagi
                for (const item of toRemove) {
                    if (cfg.mode === 'two') {
                        await cfg.del(idsopdetail, item.id);
                    } else {
                        await cfg.del(item.id);
                    }
                }
                totalAdded += toAdd.length;
                totalRemoved += toRemove.length;
            }

            return `Berhasil menambah ${totalAdded} data baru dan menghapus ${totalRemoved} data`;
        } catch (error) {
            console.error('Error saat sinkronisasi data:', error);
            throw error;
        }
    })();

    useToastPromise(syncPromise, {
        messages: { success: 'Berhasil menyimpan progres!' },
        toastOptions: { autoClose: 3000 }
    });
};

const fetchExistingSopInfo = async (idsopdetail, dataType) => {
    try {
        switch (dataType) {
            case 'id_implementer':
                return await getSopImplementer(idsopdetail);
            case 'id_legal':
                return await getSopLawBasis(idsopdetail);
            case 'data_record':
                return await getSopRecord(idsopdetail);
            case 'equipment':
                return await getSopEquipment(idsopdetail);
            case 'related_sop':
                return await getRelatedSop(idsopdetail);
            case 'qualification':
                return await getIQ(idsopdetail);
            default:
                return { data: [] };
        }
    } catch (error) {
        console.error(`Error fetching existing data for ${dataType}:`, error);
        return { data: [] };
    }
};

// ---------- fungsi sop step---------------
// Membandingkan langkah SOP antara data server dan data user
function compareSteps(serverSteps, userSteps) {
    // Buat Map berdasarkan id_step agar pencarian lebih akurat
    const serverStepsMap = new Map(serverSteps.map(step => [step.id_step, step]));
    // Untuk userStepsMap, kita hanya memetakan langkah yang sudah memiliki id_step (bukan yang baru dibuat di client)
    const userStepsWithIdMap = new Map(userSteps.filter(step => step.id_step).map(step => [step.id_step, step]));

    const stepsToAdd = [];
    const stepsToUpdate = [];
    const stepsToDelete = [];

    // Cari langkah yang perlu ditambah atau diupdate
    userSteps.forEach(userStep => {
        if (!userStep.id_step) {
            // Jika userStep tidak memiliki id_step, berarti ini adalah data baru
            stepsToAdd.push(userStep);
        } else {
            const serverStep = serverStepsMap.get(userStep.id_step);
            if (serverStep) {
                // Langkah ada di server, cek apakah ada perbedaan
                // Kunci-kunci yang tidak perlu dibandingkan secara langsung (misal: timestamp server)
                const excludedKeys = ['createdAt', 'updatedAt', 'id_sop_detail'];
                const isDifferent = Object.keys(userStep).some(key => {
                    if (excludedKeys.includes(key)) {
                        return false;
                    }
                    // Periksa apakah properti ada di kedua objek atau hanya di salah satu (misalnya properti decision type)
                    const userValue = userStep[key];
                    const serverValue = serverStep[key];

                    // Jika satu ada dan yang lain tidak (kecuali null/undefined dianggap sama jika keduanya tidak ada)
                    if ((userValue !== undefined && serverValue === undefined) || (userValue === undefined && serverValue !== undefined)) {
                        // Anggap berbeda jika salah satu null/undefined dan yang lain memiliki nilai
                        if (!((userValue === null || userValue === undefined) && (serverValue === null || serverValue === undefined))) {
                            return true;
                        }
                    }

                    return JSON.stringify(userValue) !== JSON.stringify(serverValue);
                });

                if (isDifferent) {
                    stepsToUpdate.push({ id: userStep.id_step, data: userStep });
                }
            } else {
                // User step memiliki id_step, tapi tidak ditemukan di server.
                // Ini bisa berarti langkah tersebut baru dibuat di client dan id_step nya unik (misal UUID client-side)
                // atau langkah tersebut sudah dihapus di server.
                // Jika id_step di-generate client dan unik, maka ini adalah langkah baru.
                // Namun, jika id_step seharusnya dari server, ini anomali.
                // Untuk kasus umum di mana id_step baru ada setelah dibuat di server,
                // kondisi `!userStep.id_step` sudah menangani penambahan.
                // Jika Anda mengizinkan id_step client-side sebelum create, logika ini mungkin perlu penyesuaian.
                // Berdasarkan deskripsi masalah, kita asumsikan id_step adalah pengenal dari server.
                // Jika userStep.id_step ada tapi tidak di server, ini bisa dianggap sebagai data baru jika id_step unik.
                // Namun, karena sudah ada filter `!userStep.id_step` untuk data baru,
                // kita bisa asumsikan ini adalah kasus yang tidak diharapkan atau id_step yang "yatim".
                // Untuk skenario umum, jika id_step ada, seharusnya ada di server atau akan diupdate.
                // Jika tidak ada di server, dan bukan baru (karena punya id_step), ini bisa jadi error data.
                // Untuk saat ini, jika punya id_step tapi tidak di server, kita tidak menambahkannya ke `stepsToAdd` di sini
                // karena sudah ditangani oleh `!userStep.id_step`.
            }
        }
    });

    // Cari langkah yang perlu dihapus (langkah yang ada di server tapi tidak ada lagi di user)
    serverSteps.forEach(serverStep => {
        if (!userStepsWithIdMap.has(serverStep.id_step)) {
            stepsToDelete.push(serverStep.id_step);
        }
    });

    return { stepsToAdd, stepsToUpdate, stepsToDelete };
};

// Membuat payload untuk create/update step
function getStepPayload(step) {
    const payload = {
        id_sop_detail: idsopdetail,
        seq_number: step.seq_number,
        name: step.name,
        type: step.type,
        id_implementer: step.id_implementer,
        fittings: step.fittings,
        time: step.time,
        time_unit: step.time_unit,
        output: step.output,
        description: step.description
    };
    if (step.type === 'decision') {
        payload.id_next_step_if_yes = step.id_next_step_if_yes;
        payload.id_next_step_if_no = step.id_next_step_if_no;
    }
    return payload;
};

// Sinkronisasi langkah SOP ke server
const syncSopStep = async () => {
    const syncPromise = (async () => {
        // Bandingkan data server dan data user
        const { stepsToAdd, stepsToUpdate, stepsToDelete } = compareSteps(apiResponseStep, sopStep.value);

        // Hapus langkah yang tidak ada di user
        for (const id of stepsToDelete) {
            await deleteSopStep(id);
        }

        // Update langkah yang berubah
        for (const { id, data } of stepsToUpdate) {
            const updateData = getStepPayload(data);
            await updateSopStep(id, updateData);
        }

        // Tambah langkah baru
        for (const step of stepsToAdd) {
            const createData = getStepPayload(step);
            await createSopStep(createData);
        }

        // Ambil ulang data terbaru dari server
        await fetchSopStep();

        console.log(`Berhasil menambah ${stepsToAdd.length} data baru, memperbarui ${stepsToUpdate.length} data dan menghapus ${stepsToDelete.length} data`)
        return 'Berhasil menyimpan tahapan SOP!';
    })();

    useToastPromise(syncPromise, {
        messages: { success: (msg) => msg },
        toastOptions: { autoClose: 3000 }
    });

    try {
        await syncPromise;
    } catch (error) {
        console.error('Error saat sinkronisasi data:', error);
    }
};


// ---------- Fungsi validasi ---------------
const validateLastStep = () => {
    if (!sopStep.value.length) return true;
    const lastStep = sopStep.value[sopStep.value.length - 1];
    return lastStep.type === 'terminator';
};

const validateStepForm = (step) => {
    if (!step.name || !step.type || !step.id_implementer || step.time === null || step.time_unit === null) {
        return false;
    }
    if (step.type === 'decision' && (!step.id_next_step_if_yes || !step.id_next_step_if_no)) {
        return false;
    }
    return true;
};

// Modifikasi fungsi syncData
const syncData = () => {
    switch (currentStep.value) {
        case 1:
            syncSopInfo();
            break;
        case 2:
            // Check if all steps are filled correctly
            if (sopStep.value.some(step => !validateStepForm(step))) {
                toast.warning('Silakan lengkapi data untuk semua kolom yang wajib diisi! (ditandai dengan <span class="text-red-600">*</span>)', {
                    autoClose: 7000,
                    dangerouslyHTMLString: true
                });
                return;
            }
            syncSopStep();
            break;
        default:
            break;
    }
};

// Fungsi untuk ke langkah berikutnya
const nextStep = async () => {
    if (currentStep.value === 1) {
        if (firstStepRef.value && firstStepRef.value.validateFields) {
            const isValid = firstStepRef.value.validateFields();
            if (isValid) {
                currentStep.value++;
            }
        }
    } else if (currentStep.value === 2) {
        if (sopStep.value.length < 3) {
            toast.warning('Silakan tambahkan tahapan SOP terlebih dahulu, minimal 3', {
                autoClose: 7000,
            });
            return;
        }
        // Check if all steps are filled correctly
        if (sopStep.value.some(step => !validateStepForm(step))) {
            toast.warning('Silakan lengkapi data wajib terlebih dahulu! (ditandai dengan <span class="text-red-600">*</span>)', {
                autoClose: 7000,
                dangerouslyHTMLString: true
            });
            return;
        }
        if (!validateLastStep()) {
            toast.warning('Tahap terakhir harus bertipe End. Silakan ubah!', {
                autoClose: 7000,
            });
            return;
        }
        currentStep.value++;
    } else if (currentStep.value === 3) {
        syncSopInfo();
        syncSopStep();

        // Update status SOP kalau sekarang sudah dikirim untuk nantinya dicek oleh penanggung jawab atau kadep
        // dicek dulu apakah organisasinya dsi atau tidak, jika dsi maka akan langsung di cek oleh kadep
        // jika bukan dsi maka akan di cek oleh penanggung jawab
        const promiseApdet = new Promise((resolve, reject) => {
            // Set status 5 if organization is DSI, otherwise set status 3
            const newStatus = assignmentInfo.value.organization.id_org === 0 ? 5 : 3;

            updateSopDetail(idsopdetail, { status: newStatus })
                .then(response => {
                    if (!response.success) {
                        throw response;
                    }
                    resolve(response);
                })
                .catch(error => reject(error));
        });

        useToastPromise(promiseApdet, {
            messages: {
                success: 'Draft SOP berhasil dikirim!',
            }
        });

        setTimeout(() => {
            router.push('/assignment')
        }, 5000);
    }
};

// Fungsi untuk ke langkah sebelumnya
const prevStep = () => {
    if (currentStep.value > 1) {
        currentStep.value--;
    }
};

const showConfigPanel = ref(false);

// Fungsi simpan ke API (ganti dengan API Anda)
const saveSopConfig = async () => {
    try {
        const promise = new Promise(async (resolve, reject) => {
            try {
                await saveSopDisplayConfig(idsopdetail, {
                    nominal_basic_page_steps: sopConfig.value.firstPageSteps,
                    nominal_steps_both_opc: sopConfig.value.nextPageSteps,
                    kegiatan_width: sopConfig.value.widthKegiatan,
                    kelengkapan_width: sopConfig.value.widthKelengkapan,
                    waktu_width: sopConfig.value.widthWaktu,
                    output_width: sopConfig.value.widthOutput,
                    ket_width: sopConfig.value.widthKeterangan
                });
                showConfigPanel.value = false;
                resolve();
            } catch (err) {
                reject(err);
            }
        });

        useToastPromise(promise, {
            messages: { success: 'Konfigurasi berhasil disimpan!' },
            toastOptions: { autoClose: 3000 }
        });
    } catch (err) {
        toast.error('Gagal menyimpan konfigurasi!', { autoClose: 3000 });
    }
};

const fetchAllData = async () => {
    await fetchAssignmentInfo();

    await fetchInfoSop();
    await fetchSopStep();

    await fetchLegalBasis();

    await fetchSopDisplayConfig();

    if (assignmentInfo.value.status !== 2) {
        await fetchFeedback();
    }
};

onMounted(fetchAllData);

function handleEscClose(e) {
    if (e.key === 'Escape') {
        if (showConfigPanel.value) showConfigPanel.value = false;
        if (showFeedback.value) showFeedback.value = false;
    }
}

watch([showConfigPanel, showFeedback], ([valConfig, valFeedback]) => {
    if (valConfig || valFeedback) {
        window.addEventListener('keydown', handleEscClose);
    } else {
        window.removeEventListener('keydown', handleEscClose);
    }
});

onBeforeUnmount(() => {
    window.removeEventListener('keydown', handleEscClose);
});
</script>

<template>
    <PageTitle :judul="isDataError ? 'Ngapain iseng iseng?🤨' : `Penyusunan Dokumen SOP`" class="my-12 print:hidden" />

    <template v-if="!isDataError">
        <!-- Main SOP creation stepper and content -->
        <ol class="flex items-center justify-center w-full text-sm font-medium text-center text-gray-500 sm:text-base max-w-2xl mx-auto print:hidden">
            <li class="flex md:w-full items-center text-blue-600 sm:after:content-[''] after:w-full after:h-1 after:border-b after:border-gray-400 after:border-1 after:hidden sm:after:inline-block after:mx-6 xl:after:mx-10"
                title="Informasi mengenai sop yang ditentukan oleh penanggung jawab">
                <span class="flex items-center after:content-['/'] sm:after:hidden after:mx-2 after:text-gray-400">
                    <CheckIcon v-if="currentStep > 1" />
                    <NumberOneCircleIcon class="mr-2" v-else-if="currentStep == 1" />
                    Informasi
                    <span class="hidden sm:inline-flex sm:ms-2">SOP</span>
                </span>
            </li>
            <li class="flex md:w-full items-center after:content-[''] after:w-full after:h-1 after:border-b after:border-gray-400 after:border-1 after:hidden sm:after:inline-block after:mx-6 xl:after:mx-10"
                :class="{ 'text-blue-600': currentStep >= 2 }">
                <span class="flex items-center after:content-['/'] sm:after:hidden after:mx-2 after:text-gray-400">
                    <span class="me-2" v-if="currentStep < 2">2</span>
                    <CheckIcon class="fill-blue-600" v-else-if="currentStep > 2" />
                    <NumberTwoCircleIcon class="mr-2 fill-blue-700" v-else="currentStep == 2" />
                    Tahapan <span class="hidden sm:inline-flex sm:ms-2">SOP</span>
                </span>
            </li>
            <li class="flex items-center" :class="{ 'text-blue-600': currentStep === 3 }">
                <span class="me-2" v-if="currentStep < 3">3</span>
                <NumberThreeCircleIcon class="mr-2 fill-blue-600" v-else-if="currentStep == 3" />
                Pratinjau
            </li>
        </ol>

        <!-- tampilan data -->
        <div class="my-8">
            <FirstStep v-if="currentStep == 1" ref="firstStepRef" />
            <SecondStep v-else-if="currentStep == 2" />
            <ThirdStep v-else-if="currentStep == 3" />
        </div>

        <div class="flex justify-between mb-8 px-6 max-w-3xl mx-auto print:hidden">
            <button type="button" :disabled="currentStep == 1"
                class="w-1/4 text-white bg-gray-500 hover:bg-gray-600 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-base px-5 py-2.5 text-center inline-flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                @click="prevStep">
                    <CircleArrowLeft class="fill-current w-5 mr-2 mt-1" />
                    Sebelumnya
            </button>
            <button type="button" :disabled="isDisabled" v-if="currentStep < 3"
                :title="isDisabled ? 'Tidak dapat menyimpan progres!' : 'Klik untuk menyimpan progres saat ini ke server'"
                class="w-[28%] text-white bg-green-500 hover:bg-green-600 focus:ring-4 focus:outline-none focus:ring-green-300 font-medium rounded-lg text-base px-5 py-2.5 text-center inline-flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                @click="syncData">
                    <FloppyDiskIcon class="fill-current w-5 mr-2" />
                    Simpan Tahap {{ currentStep }}
            </button>
            <button type="button" @click="nextStep" :disabled="isDisabled && currentStep == 3"
                :title="(currentStep === 3 && isDisabled) ? 'Tidak dapat mengirim draft!' : currentStep == 3 ? 'Kirim Draft' : 'Lanjut ke langkah berikutnya'"
                class="w-1/4 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-base px-5 py-2.5 text-center inline-flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed">
                    <p v-if="currentStep == 3">Kirim</p>
                    <p v-else>Lanjut</p>
                    <CircleArrowRight class="fill-current w-5 ml-2 mt-1" />
            </button>
        </div>

        <!-- Floating feedback button and panel -->
        <div class="fixed bottom-6 left-6 z-50 print:hidden">
            <div v-if="showFeedback && draftFeedback && draftFeedback.length > 0"
                class="absolute bottom-full left-0 mb-3 w-96 bg-white rounded-lg shadow-xl border border-gray-200 transition-all duration-300 transform origin-bottom-right">
                <div class="flex justify-between items-center bg-blue-50 p-3 rounded-t-lg border-b border-gray-200">
                    <div class="flex items-center">
                        <span class="font-medium">Umpan Balik</span>
                        <span class="bg-yellow-100 text-yellow-800 text-xs font-medium ml-2 px-2 py-0.5 rounded-full">{{ draftFeedback.length }}</span>
                    </div>
                    <button @click="showFeedback = false" class="text-gray-500 hover:text-gray-700 focus:outline-none">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <div class="max-h-96 overflow-y-auto p-1">
                    <div v-for="(feedback, index) in draftFeedback" :key="index" class="p-4 border-b last:border-b-0"
                        :class="[feedback?.type === 'revisi' ? 'bg-yellow-50' : 'bg-green-50']">
                        <div class="flex items-center justify-between mb-2">
                            <div class="flex items-center">
                                <span class="font-semibold text-sm">{{ feedback?.user?.name || 'User' }}</span>
                                <span class="text-xs text-gray-500 ml-2">({{ feedback.user.role }})</span>
                            </div>
                            <div class="flex items-center gap-2">
                                <span class="text-xs text-gray-500">{{ feedback?.createdAt || '-' }}</span>
                                <span v-if="feedback?.type == 'revisi'"
                                    class="inline-block bg-yellow-100 text-yellow-800 text-xs px-2 py-0.5 rounded-full">Perlu Revisi</span>
                                <span v-else-if="feedback?.type == 'setuju'"
                                    class="inline-block bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full">Setuju</span>
                            </div>
                        </div>
                        <p class="text-sm">{{ feedback?.feedback || '-' }}</p>
                    </div>
                </div>
            </div>

            <!-- Floating feedback button with badge -->
            <button v-if="draftFeedback && draftFeedback.length > 0" @click="showFeedback = !showFeedback"
                :title="showFeedback ? 'Tutup' : 'Lihat Umpan Balik'"
                class="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-3 shadow-lg flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 transition-all duration-300"
                :class="{ 'rotate-45 bg-red-600 hover:bg-red-700': showFeedback }">
                <span v-if="!showFeedback"
                    class="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {{ draftFeedback.length }}
                </span>
                <!-- Use the same icon (plus/close) for both states so rotation works properly -->
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path v-if="!showFeedback" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                    <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>

        <!-- Floating sop display config panel, only on step 3 -->
        <div v-if="currentStep === 3" class="fixed bottom-6 right-6 z-50 print:hidden">
            <div v-if="showConfigPanel"
                class="absolute bottom-full right-0 mb-3 w-80 bg-white rounded-lg shadow-xl border border-gray-200 transition-all duration-300 transform origin-bottom-left text-sm">
                <div class="flex justify-between items-center bg-blue-50 p-3 rounded-t-lg border-b border-gray-200">
                    <span class="font-medium">Konfigurasi Tampilan SOP</span>
                    <button @click="showConfigPanel = false" class="text-gray-500 hover:text-gray-700 focus:outline-none">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <form @submit.prevent="saveSopConfig">
                    <div class="p-4 space-y-3">
                        <!-- Judul Bagian Atas -->
                        <div class="font-bold mb-2">Jumlah Tahapan per Halaman</div>
                        <!-- Bagian Atas: Jumlah Tahapan -->
                        <div class="flex items-center gap-3">
                            <label class="block text-gray-700 font-medium mb-0.5 w-2/3">Hal. 1</label>
                            <input type="number" min="3" v-model.number="sopConfig.firstPageSteps"
                                class="w-1/3 border rounded-lg px-3 py-2 focus:outline-none focus:ring focus:border-blue-300 text-sm" />
                        </div>
                        <div class="flex items-center gap-3">
                            <label class="block text-gray-700 font-medium mb-0.5 w-2/3">Hal. Berikutnya</label>
                            <input type="number" min="3" v-model.number="sopConfig.nextPageSteps"
                                class="w-1/3 border rounded-lg px-3 py-2 focus:outline-none focus:ring focus:border-blue-300 text-sm" />
                        </div>
                        <hr class="my-2" />
                        <!-- Judul Bagian Bawah -->
                        <div class="font-bold mb-2">Lebar Kolom (%)</div>
                        <!-- Bagian Bawah: Lebar Kolom -->
                        <div class="flex items-center gap-3">
                            <label class="block text-gray-700 font-medium mb-0.5 w-2/3">Kegiatan</label>
                            <input type="number" min="11" max="100" v-model.number="sopConfig.widthKegiatan"
                                class="w-1/3 border rounded-lg px-3 py-2 focus:outline-none focus:ring focus:border-blue-300 text-sm" />
                        </div>
                        <div class="flex items-center gap-3">
                            <label class="block text-gray-700 font-medium mb-0.5 w-2/3">Kelengkapan</label>
                            <input type="number" min="16" max="100" v-model.number="sopConfig.widthKelengkapan"
                                class="w-1/3 border rounded-lg px-3 py-2 focus:outline-none focus:ring focus:border-blue-300 text-sm" />
                        </div>
                        <div class="flex items-center gap-3">
                            <label class="block text-gray-700 font-medium mb-0.5 w-2/3">Waktu</label>
                            <input type="number" min="9" max="100" v-model.number="sopConfig.widthWaktu"
                                class="w-1/3 border rounded-lg px-3 py-2 focus:outline-none focus:ring focus:border-blue-300 text-sm" />
                        </div>
                        <div class="flex items-center gap-3">
                            <label class="block text-gray-700 font-medium mb-0.5 w-2/3">Output</label>
                            <input type="number" min="9" max="100" v-model.number="sopConfig.widthOutput"
                                class="w-1/3 border rounded-lg px-3 py-2 focus:outline-none focus:ring focus:border-blue-300 text-sm" />
                        </div>
                        <div class="flex items-center gap-3">
                            <label class="block text-gray-700 font-medium mb-0.5 w-2/3">Keterangan</label>
                            <input type="number" min="5" max="100" v-model.number="sopConfig.widthKeterangan"
                            class="w-1/3 border rounded-lg px-3 py-2 focus:outline-none focus:ring focus:border-blue-300 text-sm" />
                        </div>
                        <!-- Keterangan lebar kolom pelaksana -->
                        <div class="text-xs text-gray-500 mb-2">
                            <span class="font-semibold">Catatan:</span> Lebar kolom <span class="font-semibold">Pelaksana</span> akan dibagi rata berdasarkan jumlah pelaksana yang dipilih. Setiap kolom memiliki lebar: 70 dibagi jumlah pelaksana (%).
                        </div>
                    </div>
                    <div class="flex justify-end p-3 border-t">
                        <button type="button" @click="fetchSopDisplayConfig"
                            class="bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg px-5 py-2 font-semibold shadow focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition-all duration-300 text-sm mr-2">
                            Reset
                        </button>
                        <button type="submit"
                            class="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-5 py-2 font-semibold shadow focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 transition-all duration-300 text-sm">
                            Simpan
                        </button>
                    </div>
                </form>
            </div>
            <!-- Floating config button -->
            <button @click="showConfigPanel = !showConfigPanel"
                :title="showConfigPanel ? 'Tutup Panel Konfigurasi' : 'Atur Tampilan SOP'"
                class="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-3 shadow-lg flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 transition-all duration-300"
                :class="{ 'rotate-45 bg-red-600 hover:bg-red-700': showConfigPanel }">
                    <GearIcon v-if="!showConfigPanel" class="w-6 h-6 fill-current" />
                    <svg v-else class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
            </button>
        </div>
    </template>
    <Error v-else @click="fetchAllData" />
</template>
