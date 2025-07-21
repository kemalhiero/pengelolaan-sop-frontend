import { computed, ref } from 'vue';

import { getSopVersion, getSectionandWarning, getSopStep, getSopDisplayConfig } from '@/api/sopApi';
import { getSopImplementer } from '@/api/implementerApi';
import { getIQ } from '@/api/implementQualificationApi';
import { getSopEquipment } from '@/api/equipmentApi';
import { getRelatedSop } from '@/api/relatedSopApi';
import { getSopLawBasis } from '@/api/lawBasisApi';
import { getSopRecord } from '@/api/recordApi';
import { getSigner } from '@/api/userApi';

export default function useSopData(route) {
    const sopData = ref({
        id: null,
        id_sop: null,
        name: '',
        is_active: null,
        number: '',
        version: '',
        status: null,
        description: '',
        signer_id: '',
        signature_url: '',
        pic_position: '',
        creation_date: '',
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

    const signer = ref({
        id_number: '',
        name: '',
    });

    const fetchSopVersion = async () => {
        try {
            const result = await getSopVersion(route);
            if (!result.success) {
                console.error('API Error:', result.error);
                return;
            }
            console.log('Mengambil data SOP dari API...');
            if (result?.data) {
                sopData.value = { ...sopData.value, ...result.data };
            }
        } catch (error) {
            console.error('Fetch error:', error);
        }
    };

    const fetchInfoSop = async () => {
        try {
            let response = await getSectionandWarning(route);
            sopData.value.section = response.data.section;
            sopData.value.warning = response.data.warning;

            response = await getSopImplementer(route);
            sopData.value.implementer = response.data;

            response = await getSopLawBasis(route);
            sopData.value.legalBasis = response.data.map(item => ({
                id: item.id,
                legal: `${item.law_type} Nomor ${item.number} Tahun ${item.year} tentang ${item.about}`,
            }));

            response = await getIQ(route);
            sopData.value.implementQualification = response.data;

            response = await getRelatedSop(route);
            sopData.value.relatedSop = response.data;

            response = await getSopEquipment(route);
            sopData.value.equipment = response.data;

            response = await getSopRecord(route);
            sopData.value.record = response.data;

            console.log('Mengambil data SOP dari API...');
        } catch (error) {
            console.error('Fetch info sop error:', error);
        }
    };

    const fetchSopStep = async () => {
        try {
            const response = await getSopStep(route);
            sopData.value.steps = response.data.sort((a, b) => a.seq_number - b.seq_number);
            console.log('Mengambil data SOP dari API...');
        } catch (error) {
            console.error('Fetch tahapan sop error:', error);
        }
    };

    const fetchSigner = async (iduser) => {
        try {
            const response = await getSigner(iduser);
            if (!response.success) {
                console.error('API Error:', response.error);
                return;
            }
            signer.value = response.data;
            console.log('Mengambil data penandatangan dari API...');
        } catch (error) {
            console.error('Fetch data penandatangan error:', error);
        }
    };

    // Computed untuk cek data kosong
    const isDataError = computed(() => {
        return !sopData.value || !sopData.value.name || !signer.value || !signer.value.name;
    });

    const sopConfig = ref({
        firstPageSteps: null,
        nextPageSteps: null,
        widthKegiatan: null,
        widthKelengkapan: null,
        widthWaktu: null,
        widthOutput: null,
        widthKeterangan: null,
        flowchartArrowConfig: {},
        bpmnArrowConfig: {},
    });

    const fetchSopDisplayConfig = async () => {
        try {
            const response = await getSopDisplayConfig(route);
            if (response.success) {
                sopConfig.value.firstPageSteps = response.data.nominal_basic_page_steps;
                sopConfig.value.nextPageSteps = response.data.nominal_steps_both_opc;
                sopConfig.value.widthKegiatan = response.data.kegiatan_width;
                sopConfig.value.widthKelengkapan = response.data.kelengkapan_width;
                sopConfig.value.widthWaktu = response.data.waktu_width;
                sopConfig.value.widthOutput = response.data.output_width;
                sopConfig.value.widthKeterangan = response.data.ket_width;
                sopConfig.value.flowchartArrowConfig = response.data.flowchart_arrow_config;
                sopConfig.value.bpmnArrowConfig = response.data.bpmn_arrow_config;
            } else {
                console.warn('Konfigurasi tampilan SOP belum ada:', response.message);
                // Set default values if API fails
                sopConfig.value.firstPageSteps = 5;
                sopConfig.value.nextPageSteps = 6;
                sopConfig.value.widthKegiatan = 23;
                sopConfig.value.widthKelengkapan = 19;
                sopConfig.value.widthWaktu = 11;
                sopConfig.value.widthOutput = 18;
                sopConfig.value.widthKeterangan = 28;
            }
        } catch (error) {
            console.error('Fetch SOP display config error:', error);
        }
    };

    const flowchartArrowConfig = computed(() => {
        const config = sopConfig.value?.flowchartArrowConfig;
        if (typeof config === 'string' && config) {
            try {
                return JSON.parse(config);
            } catch (e) {
                console.error("Gagal parse flowchartArrowConfig:", e);
                return {};
            }
        }
        return config || {};
    });

    const bpmnArrowConfig = computed(() => {
        const config = sopConfig.value?.bpmnArrowConfig;
        if (typeof config === 'string' && config) {
            try {
                return JSON.parse(config);
            } catch (e) {
                console.error("Gagal parse bpmnArrowConfig:", e);
                return {};
            }
        }
        return config || {};
    });

    return {
        signer,
        sopData,
        fetchSopVersion,
        fetchInfoSop,
        fetchSopStep,
        fetchSigner,
        isDataError,
        fetchSopDisplayConfig,
        sopConfig,
        flowchartArrowConfig,
        bpmnArrowConfig,
    };
}
