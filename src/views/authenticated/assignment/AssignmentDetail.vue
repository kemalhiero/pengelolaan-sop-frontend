<script setup>
import { ref, provide, onMounted, watch, inject, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { toast } from 'vue3-toastify';

import { createSopStep, getAssignmentDetail, getSectionandWarning, getSopStep, updateSopDetail, updateSopStep, deleteSopStep } from '@/api/sopApi';
import { createSopLawBasis, getLawBasis, getSopLawBasis, deleteSopLawBasis } from '@/api/lawBasisApi';
import { createSopImplementer, getSopImplementer, deleteSopImplementer } from '@/api/implementerApi';
import { createEquipment, getSopEquipment, deleteSopEquipment } from '@/api/equipmentApi';
import { createRelatedSop, getRelatedSop, deleteRelatedSop } from '@/api/relatedSopApi';
import { createRecord, getSopRecord, deleteSopRecord } from '@/api/recordApi';
import { createIQ, getIQ, deleteIQ } from '@/api/implementQualificationApi';
import { useToastPromise } from '@/utils/toastPromiseHandler';
import { getDraftFeedback } from '@/api/feedbackApi';
import { getCurrentHod } from '@/api/userApi';

import NumberOneCircleIcon from '@/assets/icons/NumberOneCircleIcon.vue';
import NumberTwoCircleIcon from '@/assets/icons/NumberTwoCircleIcon.vue';
import NumberThreeCircleIcon from '@/assets/icons/NumberThreeCircleIcon.vue';
import CircleArrowRight from '@/assets/icons/CircleArrowRight.vue';
import CircleArrowLeft from '@/assets/icons/CircleArrowLeft.vue';
import FloppyDiskIcon from '@/assets/icons/FloppyDiskIcon.vue';
import CheckIcon from '@/assets/icons/CheckIcon.vue';

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

const picInfo = ref();
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
const hodData = ref({
    id_number: '',
    name: '',
});
const isDisabled = computed(() => {
    return picInfo.value && (picInfo.value.status === 1 || picInfo.value.status === 0);
});

// Fungsi untuk menentukan apakah data sudah lengkap, sekaligus mengecek apakah user iseng
const isDataError = computed(() => {
    return !picInfo.value || !picInfo.value.name || !picInfo.value.number;
});

provide('picData', picInfo);
provide('sopStep', sopStep);
provide('legalBasisData', legalBasisData);
provide('hodData', hodData);
provide('sopFormData', {
    formData,
    updateFormData(newData) {
        formData.value = { ...formData.value, ...newData }
    }
});
provide('isDisabled', isDisabled);

const fetchPicInfo = async () => {
    try {
        const response = await getAssignmentDetail(idsopdetail);
        picInfo.value = response.data;
    } catch (error) {
        console.error('Fetch error:', error);
    }
};

const fetchLegalBasis = async () => {
    try {
        const response = await getLawBasis();
        const stringifyLegal = response.data.map(item => ({
            id: item.id,
            legal: `${item.law_type} Nomor ${item.number} Tahun ${item.year} tentang ${item.about}`
        }));

        legalBasisData.value = stringifyLegal;
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
                type: '',
                id_implementer: '',
                fittings: '',
                time: '',
                time_unit: 'h',
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


const fetchCurrentHod = async () => {
    try {
        const response = await getCurrentHod();
        hodData.value.id_number = response.data.id_number;
        hodData.value.name = response.data.name;
    } catch (error) {
        console.error('Fetch data kadep error:', error);
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

// sinkron data sop
const syncSopInfo = async () => {

    const syncPromise = new Promise(async (resolve, reject) => {
        try {
            // Konfigurasi untuk setiap jenis data
            const syncConfigurations = [
                // ----------many to many-------------
                {
                    existingData: formData.value.implementer,
                    createFn: createSopImplementer,
                    deleteFn: deleteSopImplementer,
                    idKey: 'id_implementer',
                    deleteParams: 'two'
                },
                {
                    existingData: formData.value.legalBasis,
                    createFn: createSopLawBasis,
                    deleteFn: deleteSopLawBasis,
                    idKey: 'id_legal',
                    deleteParams: 'two'
                },
                // ----------one to many-------------
                {
                    existingData: formData.value.record,
                    createFn: createRecord,
                    deleteFn: deleteSopRecord,
                    idKey: 'data_record',
                    deleteParams: 'one'
                },
                {
                    existingData: formData.value.equipment,
                    createFn: createEquipment,
                    deleteFn: deleteSopEquipment,
                    idKey: 'equipment',
                    deleteParams: 'one'
                },
                {
                    existingData: formData.value.relatedSop,
                    createFn: createRelatedSop,
                    deleteFn: deleteRelatedSop,
                    idKey: 'related_sop',
                    deleteParams: 'one'
                },
                {
                    existingData: formData.value.implementQualification,
                    createFn: createIQ,
                    deleteFn: deleteIQ,
                    idKey: 'qualification',
                    deleteParams: 'one'
                }
            ];

            // Update section dan warning
            await updateSopDetail(idsopdetail, {
                section: formData.value.section,
                warning: formData.value.warning
            });

            let allNewData = [];
            let allDeleteData = [];

            // Proses sinkronisasi untuk setiap konfigurasi
            for (const config of syncConfigurations) {
                const {
                    existingData,
                    createFn,
                    deleteFn,
                    idKey,
                    deleteParams
                } = config;

                // Fetch data existing dari API untuk perbandingan
                const apiResponse = await fetchExistingSopInfo(idsopdetail, idKey);
                const apiData = apiResponse.data;

                let newData;
                let removedData;

                if (deleteParams === 'two') {
                    newData = existingData.filter(
                        newItem => !apiData.some(
                            existItem => existItem.id === newItem.id
                        )
                    );
                    removedData = apiData.filter(
                        existItem => !existingData.some(
                            newItem => existItem.id === newItem.id
                        )
                    );
                } else {
                    newData = existingData.filter(
                        newItem => !apiData.some(
                            existItem => existItem[idKey] === newItem
                        )
                    );
                    removedData = apiData.filter(
                        existItem => !existingData.some(
                            newItem => existItem[idKey] === newItem
                        )
                    );
                };

                allNewData.push(...newData)
                allDeleteData.push(...removedData)

                if (newData.length > 0) {
                    for (let i = 0; i < newData.length; i++) {
                        await addNewData(newData[i], createFn, idKey, deleteParams);
                    }
                }

                if (removedData.length > 0) {
                    for (let i = 0; i < removedData.length; i++) {
                        await deleteRemovedData(removedData[i], deleteFn, deleteParams);
                    }
                }
            };

            console.log('allNewData', allNewData)
            console.log('allDeleteData', allDeleteData)
            console.log('Berhasil sinkronisasi data SOP');

            // Resolve promise jika berhasil
            resolve(`Berhasil menambah ${allNewData.length} data baru dan menghapus ${allDeleteData.length} data`);
        } catch (error) {
            console.error('Error saat sinkronisasi data:', error);
            // Reject promise jika gagal
            reject(error);
        }
    });

    useToastPromise(syncPromise, {
        messages: {
            success: 'Berhasil menyimpan progres!',
        },
        toastOptions: {
            autoClose: 3000,
        },
    });
};

async function addNewData(newData, createFn, idKey, deleteParams) {
    if (deleteParams == 'two') {
        await createFn({
            id_sop_detail: idsopdetail,
            [idKey]: newData.id
        })
    } else {
        await createFn({
            id_sop_detail: idsopdetail,
            [idKey]: newData
        })
    }
};

async function deleteRemovedData(removedData, deleteFn, deleteParams) {
    if (deleteParams === 'two') {
        // For implementer and legal basis
        await deleteFn(idsopdetail, removedData.id);
    } else {
        // For record, equipment, etc.
        await deleteFn(removedData.id);
    }
};

// Fungsi untuk fetch data existing (sesuaikan dengan kebutuhan API Anda)
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
const compareSteps = (responseSteps, currentSteps) => {
    // Konversi array menjadi map untuk memudahkan pencarian
    const responseStepsMap = new Map(
        responseSteps.map(step => [step.seq_number, step])
    );
    const currentStepsMap = new Map(
        currentSteps.map(step => [step.seq_number, step])
    );

    // Data untuk diproses
    const stepsToAdd = [];    // Data baru untuk ditambahkan
    const stepsToDelete = []; // Data yang akan dihapus
    const stepsToUpdate = []; // Data yang akan diupdate

    // Cek data yang akan ditambahkan dan diupdate
    currentSteps.forEach(currentStep => {
        // Jika id_step null atau tidak ada di responseSteps, berarti data baru
        if (!currentStep.id_step || !responseStepsMap.has(currentStep.id_step)) {
            stepsToAdd.push(currentStep);
            return;
        }

        // Cek apakah ada perubahan pada data yang sudah ada
        const responseStep = responseStepsMap.get(currentStep.id_step);
        const hasChanges = Object.keys(currentStep).some(key =>
            JSON.stringify(currentStep[key]) !== JSON.stringify(responseStep[key])
        );

        if (hasChanges) {
            stepsToUpdate.push({
                id: currentStep.id_step,
                data: currentStep
            });
        }
    });

    // Cek data yang akan dihapus
    responseSteps.forEach(responseStep => {
        if (!currentStepsMap.has(responseStep.id_step)) {
            stepsToDelete.push(responseStep.id_step);
        }
    });

    return {
        toAdd: stepsToAdd,
        toUpdate: stepsToUpdate,
        toDelete: stepsToDelete
    };
};

const syncSopStep = async () => {
    const syncPromise = new Promise(async (resolve, reject) => {
        try {
            const changes = compareSteps(apiResponseStep, sopStep.value);

            // Proses penghapusan data
            for (const id of changes.toDelete) {
                await deleteSopStep(id);
            }

            // Proses update data
            for (const { id, data } of changes.toUpdate) {
                console.log('Data being sent to update:', {
                    id_next_step_if_yes: data.id_next_step_if_yes,
                    id_next_step_if_no: data.id_next_step_if_no,
                    type: data.type
                });

                const updateData = {
                    id_sop_detail: idsopdetail,
                    seq_number: data.seq_number,
                    name: data.name,
                    type: data.type,
                    id_implementer: data.id_implementer,
                    fittings: data.fittings,
                    time: data.time,
                    time_unit: data.time_unit,
                    output: data.output,
                    description: data.description
                };

                // Only add next step IDs if type is decision
                if (data.type === 'decision') {
                    updateData.id_next_step_if_yes = data.id_next_step_if_yes;
                    updateData.id_next_step_if_no = data.id_next_step_if_no;
                }

                await updateSopStep(id, updateData);
            }

            // Add new steps
            for (let i = 0; i < changes.toAdd.length; i++) {
                const item = changes.toAdd[i];

                const { seq_number, name, type, id_implementer, fittings, time, time_unit, output, description } = item;
                const createData = {
                    id_sop_detail: idsopdetail,
                    seq_number,
                    name,
                    type,
                    id_implementer,
                    fittings,
                    time,
                    time_unit,
                    output,
                    description
                };

                // Only add next step IDs if type is decision
                if (item.type === 'decision') {
                    createData.id_next_step_if_yes = item.id_next_step_if_yes;
                    createData.id_next_step_if_no = item.id_next_step_if_no;
                }

                const response = await createSopStep(createData);
                console.log('New step created:', response.data);
            }

            // Fetch updated steps after all changes
            await fetchSopStep();

            // Gunakan resolve dengan pesan detail
            resolve(`Berhasil menambah ${changes.toAdd.length} data baru, memperbarui ${changes.toUpdate.length} data dan menghapus ${changes.toDelete.length} data`);
        } catch (error) {
            console.error('Error saat sinkronisasi data:', error);
            reject(error);
        }
    });

    useToastPromise(syncPromise, {
        messages: {
            // Ambil pesan sukses dari resolve promise
            success: (msg) => msg,
        },
    });
};

// Tambahkan fungsi validasi
const validateLastStep = () => {
    if (!sopStep.value.length) return true;
    const lastStep = sopStep.value[sopStep.value.length - 1];
    return lastStep.type === 'terminator';
};

const validateStepForm = (step) => {
    if (!step.name || !step.type || !step.id_implementer || !step.time) {
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
            toast.warning('Silakan lengkapi data untuk semua kolom yang wajib diisi! (ditandai dengan <span class="text-red-600">*</span>)', {
                autoClose: 7000,
                dangerouslyHTMLString: true
            });
            return;
        }
        if (!validateLastStep()) {
            toast.warning('Tahap terakhir harus bertipe End. Silakan ubah tipe tahap terakhir.', {
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
        let promiseApdet;
        promiseApdet = new Promise((resolve, reject) => {
            // Set status 5 if organization is DSI, otherwise set status 3
            const newStatus = picInfo.value.organization === 'Departemen Sistem Informasi' ? 5 : 3;

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
                success: 'Umpan balik berhasil dikirim!',
            }
        }
        );

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

const fetchAllData = async () => {
    await fetchPicInfo();

    await fetchInfoSop();
    await fetchSopStep();

    await fetchLegalBasis();
    await fetchCurrentHod();

    if (picInfo.value.status !== 2) {
        await fetchFeedback();
    }
};

onMounted(fetchAllData);
</script>

<template>
    <PageTitle :judul="isDataError ? 'Ngapain iseng iseng?🤨' :  `Penyusunan Dokumen SOP`" class="my-12" />

    <template v-if="!isDataError">
        <!-- Main SOP creation stepper and content -->
        <ol
            class="flex items-center justify-center w-full text-sm font-medium text-center text-gray-500 sm:text-base max-w-2xl mx-auto">
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
        <div class="my-8 px-6 md:px-0">
            <FirstStep v-if="currentStep == 1" ref="firstStepRef" />
            <SecondStep v-else-if="currentStep == 2" />
            <ThirdStep v-else-if="currentStep == 3" />
        </div>
    
        <div class="flex justify-between mb-8 px-6 max-w-3xl mx-auto">
            <button type="button" :disabled="currentStep == 1"
                class="w-1/4 text-white bg-gray-500 hover:bg-gray-600 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-base px-5 py-2.5 text-center inline-flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                @click="prevStep">
                <CircleArrowLeft class="fill-current w-5 mr-2 mt-1" />
                Sebelumnya
            </button>
    
            <button type="button"
                :title="isDisabled ? 'Tidak dapat menyimpan progres!' : currentStep < 3 ? 'Klik untuk menyimpan progres saat ini ke server' : 'Untuk menyimpan progres, klik tombol kirim!'"
                :disabled="currentStep === 3 || isDisabled"
                class="w-[28%] text-white bg-green-500 hover:bg-green-600 focus:ring-4 focus:outline-none focus:ring-green-300 font-medium rounded-lg text-base px-5 py-2.5 text-center inline-flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                @click="syncData">
                <!-- <SpinnerIcon class="inline w-5 me-3 fill-current animate-spin" />
                Loading... -->
                <FloppyDiskIcon class="fill-current w-5 mr-2" />
                Simpan Progres
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
        <div class="fixed bottom-6 right-6 z-50">
            <div v-if="showFeedback && draftFeedback && draftFeedback.length > 0" 
                class="absolute bottom-full right-0 mb-3 w-96 bg-white rounded-lg shadow-xl border border-gray-200 transition-all duration-300 transform origin-bottom-right">
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
                    <div v-for="(feedback, index) in draftFeedback" :key="index"
                        class="p-4 border-b last:border-b-0" 
                        :class="[feedback?.type === 'revisi' ? 'bg-yellow-50' : 'bg-green-50']">
                        <div class="flex items-center justify-between mb-2">
                            <div class="flex items-center">
                                <span class="font-semibold text-sm">{{ feedback?.user?.name || 'User' }}</span>
                                <span class="text-xs text-gray-500 ml-2">({{ feedback.user.role }})</span>
                            </div>
                            <div class="flex items-center gap-2">
                                <span class="text-xs text-gray-500">{{ feedback?.createdAt || '-' }}</span>
                                <span v-if="feedback?.type == 'revisi'" class="inline-block bg-yellow-100 text-yellow-800 text-xs px-2 py-0.5 rounded-full">Perlu Revisi</span>
                                <span v-else-if="feedback?.type == 'setuju'" class="inline-block bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full">Setuju</span>
                            </div>
                        </div>
                        <p class="text-sm">{{ feedback?.feedback || '-' }}</p>
                    </div>
                </div>
            </div>
            
            <!-- Floating feedback button with badge -->
            <button 
                v-if="draftFeedback && draftFeedback.length > 0"
                @click="showFeedback = !showFeedback" :title="showFeedback ? 'Tutup' : 'Lihat Umpan Balik'"
                class="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-3 shadow-lg flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 transition-all duration-300"
                :class="{'rotate-45 bg-red-600 hover:bg-red-700': showFeedback}">
                <span v-if="!showFeedback" class="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {{ draftFeedback.length }}
                </span>
                <!-- Use the same icon (plus/close) for both states so rotation works properly -->
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path v-if="!showFeedback" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                          d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                    <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                          d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>
    </template>
    <Error v-else @click="fetchAllData" />
</template>
