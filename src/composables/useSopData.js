import { ref } from 'vue';

import { getSopVersion, getSectionandWarning, getSopStep } from '@/api/sopApi';
import { getSopImplementer } from '@/api/implementerApi';
import { getIQ } from '@/api/implementQualificationApi';
import { getSopEquipment } from '@/api/equipmentApi';
import { getRelatedSop } from '@/api/relatedSopApi';
import { getSopLawBasis } from '@/api/lawBasisApi';
import { getSopRecord } from '@/api/recordApi';
import { getCurrentHod } from '@/api/userApi';

// Cache untuk menyimpan data SOP dan HOD
const sopCache = {};
const hodCache = ref(null);

export function useSopData(route) {
    const sopData = ref(sopCache[route] || {
        id: null,
        id_sop: null,
        name: '',
        is_active: null,
        number: '',
        version: '',
        status: null,
        description: '',
        signer: '',
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

    const hodData = ref(hodCache.value || {
        id_number: '',
        name: '',
    });

    const fetchSopVersion = async () => {
        if (!sopCache[route]) {
            try {
                const result = await getSopVersion(route);
                if (!result.success) {
                    console.error('API Error:', result.error);
                    return;
                }
                console.log('Mengambil data SOP dari API...');

                if (result?.data) {
                    sopData.value = { ...sopData.value, ...result.data };
                    sopCache[route] = sopData.value; // Simpan ke cache
                }
            } catch (error) {
                console.error('Fetch error:', error);
            }
        } else {
            console.log('Menggunakan data SOP dari cache');
            sopData.value = sopCache[route];
        }
    };

    const fetchInfoSop = async () => {
        if (!sopCache[route]?.section || !sopCache[route]?.warning) {
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
                sopCache[route] = sopData.value; // Simpan ke cache
            } catch (error) {
                console.error('Fetch info sop error:', error);
            }
        } else {
            console.log('Menggunakan data SOP info dari cache');
            sopData.value = sopCache[route];
        }
    };

    const fetchSopStep = async () => {
        if (!sopCache[route]?.steps || sopCache[route]?.steps.length === 0) {
            try {
                const response = await getSopStep(route);
                sopData.value.steps = response.data.sort((a, b) => a.seq_number - b.seq_number);

                console.log('Mengambil data SOP dari API...');
                sopCache[route] = sopData.value; // Simpan ke cache
            } catch (error) {
                console.error('Fetch tahapan sop error:', error);
            }
        } else {
            console.log('Menggunakan data SOP steps dari cache');
            sopData.value = sopCache[route];
        }
    };

    const fetchCurrentHod = async () => {
        if (!hodCache.value) {
            try {
                const response = await getCurrentHod();
                hodData.value = response.data;
                console.log('Mengambil data SOP dari API...');
                hodCache.value = hodData.value; // Simpan ke cache
            } catch (error) {
                console.error('Fetch data kadep error:', error);
            }
        } else {
            console.log('Menggunakan data HOD dari cache');
            hodData.value = hodCache.value;
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
}
