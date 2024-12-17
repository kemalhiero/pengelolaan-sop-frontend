<script setup>
import { ref, provide, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router'
import { validateText } from '@/utils/validation';

import { createSopStep, getAssignmentDetail, getSectionandWarning, getSopStep, updateSopDetail } from '@/api/sopApi';
import { createSopLawBasis, getLawBasis, getSopLawBasis, deleteSopLawBasis } from '@/api/lawBasisApi';
import { createSopImplementer, getSopImplementer, deleteSopImplementer } from '@/api/implementerApi';
import { createEquipment, getSopEquipment, deleteSopEquipment } from '@/api/equipmentApi';
import { createRelatedSop, getRelatedSop, deleteRelatedSop } from '@/api/relatedSopApi';
import { createRecord, getSopRecord, deleteSopRecord } from '@/api/recordApi';
import { createIQ, getIQ, deleteIQ } from '@/api/implementQualification';

import NumberOneCircleIcon from '@/assets/icons/NumberOneCircleIcon.vue';
import NumberTwoCircleIcon from '@/assets/icons/NumberTwoCircleIcon.vue';
import NumberThreeCircleIcon from '@/assets/icons/NumberThreeCircleIcon.vue';
import CircleArrowRight from '@/assets/icons/CircleArrowRight.vue';
import CircleArrowLeft from '@/assets/icons/CircleArrowLeft.vue';
import FloppyDiskIcon from '@/assets/icons/FloppyDiskIcon.vue';
import SpinnerIcon from '@/assets/icons/SpinnerIcon.vue';
import CheckIcon from '@/assets/icons/CheckIcon.vue';

import FirstStep from './assignmentDetailStep/FirstStep.vue';
import SecondStep from './assignmentDetailStep/SecondStep.vue';
import ThirdStep from './assignmentDetailStep/ThirdStep.vue';

const route = useRoute();

// State untuk mengatur langkah
const currentStep = ref(1);  // Langkah sekarang
const firstStepRef = ref(null);

const picInfo = ref();
const fetchPicInfo = async () => {
    try {
        const response = await getAssignmentDetail(route.params.id);
        picInfo.value = response.data;
    } catch (error) {
        console.error('Fetch error:', error);
    }
};
provide('picData', picInfo);

let idsopdetail;
watch(() => picInfo.value,
    (newValue) => {
        if (newValue) {
            idsopdetail = newValue.id_sop_detail;
            fetchInfoSop();
            fetchSopStep();
        }
    }
);

const legalBasisData = ref();
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
provide('legalBasisData', legalBasisData);

// TODO buat tambah & fetch data info sop sudah✅, sekarang buat untuk proses updatenya/memperbarui

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
provide('sopFormData', {
    formData,
    updateFormData(newData) {
        formData.value = { ...formData.value, ...newData }
    }
});

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

// TODO buat sinkronisasi untuk tahapan sop, yaitu simpan✅, lihat✅, dan memperbarui data
const sopStep = ref([
    {
        kegiatan: '',
        tipeKegiatan: 'terminator',
        pelaksana: '',
        kelengkapan: '',
        waktu: '',
        satuanWaktu: 'h',
        output: '',
        keterangan: ''
    }
]);
provide('sopStep', {
    sopStep,
    updateSopStep(newData) {
        sopStep.value = { ...sopStep.value, ...newData }
    }
});

const fetchSopStep = async () => {
    try {
        let response = await getSopStep(idsopdetail);

        sopStep.value = response.data.map(item => ({
            kegiatan: item.name,
            tipeKegiatan: item.type,
            pelaksana: item.id_implementer,
            kelengkapan: item.fittings,
            waktu: item.time,
            satuanWaktu: item.time_unit,
            output: item.output,
            keterangan: item.description
        }));

    } catch (error) {
        console.error('Fetch tahapan sop error:', error);
    }
};

// sinkron data sop
// TODO udah berhasil tapi yang ditambah dan dihapus masih berulang-ulang, padahal cuma nambahin satu data aja
const syncSopInfo = async () => {
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
        await updateSopDetail(picInfo.value.id, {
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
            const apiResponse = await fetchExistingData(idsopdetail, idKey);
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
            // console.log('existingData')
            // console.log(existingData)
            // console.log('apiData')
            // console.log(apiData)

            // console.log('newData')
            // console.log(newData)
            // console.log('removedData')
            // console.log(removedData)

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

        console.log('allNewData')
        console.log(allNewData)
        console.log('allDeleteData')
        console.log(allDeleteData)

        console.log('Berhasil sinkronisasi data SOP');
    } catch (error) {
        console.error('Error saat sinkronisasi data:', error);
    }
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
}

async function deleteRemovedData(removedData, deleteFn, deleteParams) {
    if (deleteParams === 'two') {
        // For implementer and legal basis
        await deleteFn(idsopdetail, removedData.id);
    } else {
        // For record, equipment, etc.
        await deleteFn(removedData.id);
    }
}

// Fungsi untuk fetch data existing (sesuaikan dengan kebutuhan API Anda)
const fetchExistingData = async (idsopdetail, dataType) => {
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

const syncSopStep = async () => {
    try {
        sopStep.value.forEach(async (item, index) => {
            await createSopStep({
                id_sop_detail: idsopdetail,
                seq_number: index + 1,
                name: item.kegiatan,
                type: item.tipeKegiatan,
                id_implementer: item.pelaksana,
                fittings: item.kelengkapan,
                time: item.waktu,
                time_unit: item.satuanWaktu,
                output: item.output,
                description: item.keterangan
            })
        });

        console.log('berhasil sinkronisasi data tahapan sop');

    } catch (error) {
        console.error('Error saat mengirim data:', error);;
    }
};

const syncData = () => {
    switch (currentStep.value) {
        case 1:
            syncSopInfo();
            break;
        case 2:
            console.log(sopStep.value);
            syncSopStep();
            break;
        default:
            break;
    }
};

// Fungsi untuk ke langkah berikutnya
const nextStep = () => {
    if (currentStep.value === 1) {
        // Pastikan firstStepRef.value tidak null sebelum memanggil method
        if (firstStepRef.value && firstStepRef.value.validateFields) {
            const isValid = firstStepRef.value.validateFields();

            if (isValid) {
                currentStep.value++;
            }
        } else {
            console.error('Referensi komponen tidak ditemukan');
        }
    } else if (currentStep.value < 3) {
        currentStep.value++;
    }
};

// Fungsi untuk ke langkah sebelumnya
const prevStep = () => {
    if (currentStep.value > 1) {
        currentStep.value--;
    }
};

onMounted(() => {
    fetchPicInfo();
    fetchLegalBasis();
});
</script>

<template>
    <h2 class="text-4xl text-center my-12 font-bold">Penyusunan Dokumen SOP</h2>
    <!-- stepper -->
    <ol
        class="flex items-center justify-center w-full text-sm font-medium text-center text-gray-500 sm:text-base max-w-2xl mx-auto">
        <li class="flex md:w-full items-center text-blue-600 sm:after:content-[''] after:w-full after:h-1 after:border-b after:border-gray-400 after:border-1 after:hidden sm:after:inline-block after:mx-6 xl:after:mx-10"
            title="Informasi mengenai sop yang ditentukan oleh penanggung jawab" @click="currentStep = 1">
            <span class="flex items-center after:content-['/'] sm:after:hidden after:mx-2 after:text-gray-400">
                <CheckIcon v-if="currentStep > 1" />
                <NumberOneCircleIcon class="mr-2" v-else-if="currentStep == 1" />
                Informasi
                <span class="hidden sm:inline-flex sm:ms-2">SOP</span>
            </span>
        </li>
        <li class="flex md:w-full items-center after:content-[''] after:w-full after:h-1 after:border-b after:border-gray-400 after:border-1 after:hidden sm:after:inline-block after:mx-6 xl:after:mx-10"
            :class="{ 'text-blue-600': currentStep >= 2 }" @click="currentStep = 2">
            <span class="flex items-center after:content-['/'] sm:after:hidden after:mx-2 after:text-gray-400">
                <span class="me-2" v-if="currentStep < 2">2</span>
                <CheckIcon class="fill-blue-600" v-else-if="currentStep > 2" />
                <NumberTwoCircleIcon class="mr-2 fill-blue-700" v-else="currentStep == 2" />
                Tahapan <span class="hidden sm:inline-flex sm:ms-2">SOP</span>
            </span>
        </li>
        <li class="flex items-center" @click="currentStep = 3" :class="{ 'text-blue-600': currentStep === 3 }">
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

        <button type="button" title="Klik untuk menyimpan progres saat ini ke server" :disabled="currentStep == 3"
            class="w-[28%] text-white bg-green-500 hover:bg-green-600 focus:ring-4 focus:outline-none focus:ring-green-300 font-medium rounded-lg text-base px-5 py-2.5 text-center inline-flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            @click="syncData">
            <!-- <SpinnerIcon class="inline w-5 me-3 fill-current animate-spin" />
            Loading... -->
            <FloppyDiskIcon class="fill-current w-5 mr-2" />
            Simpan Progres
        </button>

        <button type="button"
            class="w-1/4 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-base px-5 py-2.5 text-center inline-flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            @click="nextStep">
            <p v-if="currentStep == 3">Kirim</p>
            <p v-else>Lanjut</p>
            <CircleArrowRight class="fill-current w-5 ml-2 mt-1" />
        </button>
    </div>

</template>
