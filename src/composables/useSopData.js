import { ref } from 'vue';

import { getSopVersion, getSectionandWarning, getSopStep } from '@/api/sopApi';
import { getSopImplementer } from '@/api/implementerApi';
import { getIQ } from '@/api/implementQualificationApi';
import { getSopEquipment } from '@/api/equipmentApi';
import { getRelatedSop } from '@/api/relatedSopApi';
import { getSopLawBasis } from '@/api/lawBasisApi';
import { getSopRecord } from '@/api/recordApi';
import { getCurrentHod } from '@/api/userApi';

export function useSopData(route) {
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
            const result = await getSopVersion(route);
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

            response = null;
        } catch (error) {
            console.error('Fetch info sop error:', error);
        }
    };

    const fetchSopStep = async () => {
        try {
            const response = await getSopStep(route);
            sopData.value.steps = response.data.sort((a, b) => a.seq_number - b.seq_number);
        } catch (error) {
            console.error('Fetch tahapan sop error:', error);
        }
    };

    const fetchCurrentHod = async () => {
        try {
            const response = await getCurrentHod();
            hodData.value = response.data;
        } catch (error) {
            console.error('Fetch data kadep error:', error);
        }
    };

    return {
        sopData,
        hodData,
        fetchSopVersion,
        fetchInfoSop,
        fetchSopStep,
        fetchCurrentHod,
    };
};
