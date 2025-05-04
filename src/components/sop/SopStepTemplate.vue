<script setup>
import { computed, ref } from 'vue';

import Process from '@/components/sop/shape/flowchart/Process.vue';
import StartEnd from '@/components/sop/shape/flowchart/StartEnd.vue';
import Decision from '@/components/sop/shape/flowchart/Decision.vue';
import OffPageConnector from '@/components/sop/shape/flowchart/OffPageConnector.vue';
import ArrowConnector from '@/components/sop/shape/ArrowConnector.vue';

const props = defineProps({
    steps: {
        type: Array,
        required: true,
        default: () => []
    },
    implementer: {
        type: Array,
        required: true
    }
});

// Fungsi untuk mendapatkan komponen shape berdasarkan tipe
const getShapeComponent = (type) => {
    const shapeMap = {
        'terminator': StartEnd,
        'process': Process,
        'decision': Decision,
        'connector': OffPageConnector
    };
    return shapeMap[type] || Process;
};

// Add this function to transform time units
const getFullTimeUnit = (unit) => {
    const timeUnits = {
        'h': 'Jam',
        'm': 'Menit',
        'd': 'Hari',
        'w': 'Minggu',
        'mo': 'Bulan',
        'y': 'Tahun'
    };
    return timeUnits[unit] || unit;
};

// Tambahkan reactive untuk track mounting status
const arrowsMounted = ref(new Set());

// Handler untuk mounted event dari arrow
const handleArrowMounted = () => {
    arrowsMounted.value.add(true);
};

// Computed property untuk koneksi
const connections = computed(() => {
    const allConnections = [];

    props.steps.forEach((step) => {
        if (step.type === 'decision') {
            // Tambahkan koneksi untuk kondisi 'Yes'
            if (step.id_next_step_if_yes) {
                allConnections.push({
                    from: `sop-step-${step.seq_number}`,
                    to: `sop-step-${props.steps.find(s => s.id_step === step.id_next_step_if_yes)?.seq_number}`,
                    label: 'Ya',
                    condition: 'yes'
                });
            }

            // Tambahkan koneksi untuk kondisi 'No'
            if (step.id_next_step_if_no) {
                allConnections.push({
                    from: `sop-step-${step.seq_number}`,
                    to: `sop-step-${props.steps.find(s => s.id_step === step.id_next_step_if_no)?.seq_number}`,
                    label: 'Tidak',
                    condition: 'no'
                });
            }
        } else {
            // Untuk step non-decision, gunakan sequential berikutnya
            const nextStep = props.steps.find(s => s.seq_number === step.seq_number + 1);
            if (nextStep) {
                allConnections.push({
                    from: `sop-step-${step.seq_number}`,
                    to: `sop-step-${nextStep.seq_number}`
                });
            }
        }
    });

    return allConnections;
});
</script>

<template>
    <div class="flex justify-center px-5 lg:px-0 print:px-0">
        <div class="relative print-page">
            <table class="w-full border-collapse border-2 border-black" id="sop-container">
                <thead>
                    <tr class="bg-[#D9D9D9]">
                        <th rowspan="2" class="border-2 py-0.5 px-2 border-black">NO</th>
                        <th rowspan="2" class="border-2 py-0.5 px-2 border-black">KEGIATAN</th>
                        <th :colspan="implementer.length" class="border-2 py-0.5 px-2 border-black">PELAKSANA</th>
                        <th colspan="3" class="border-2 py-0.5 px-2 border-black">MUTU BAKU</th>
                        <th rowspan="2" class="border-2 py-0.5 px-2 border-black">KET</th>
                    </tr>
                    <tr class="bg-[#D9D9D9]">
                        <th v-for="impl in props.implementer" :key="impl.id" class="border-2 py-0.5 px-2 border-black">
                            {{ impl.name.toUpperCase() }}
                        </th>
                        <th class="border-2 py-0.5 px-2 border-black">KELENGKAPAN</th>
                        <th class="border-2 py-0.5 px-2 border-black">WAKTU</th>
                        <th class="border-2 py-0.5 px-2 border-black">OUTPUT</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="step in steps" :key="step.id_step">
                        <td class="border-2 border-black py-0.5 px-2">{{ step.seq_number }}</td>
                        <td class="border-2 border-black py-0.5 px-2">{{ step.name }}</td>
                        <td v-for="impl in props.implementer" :key="impl.id"
                            class="border-2 border-black p-0 text-center align-middle">
                            <div v-if="step.id_implementer === impl.id" class="flex justify-center items-center p-5">
                                <component :is="getShapeComponent(step.type)" :id="`sop-step-${step.seq_number}`"
                                    class="relative z-10" />
                            </div>
                        </td>
                        <td class="border-2 border-black py-0.5 px-2">{{ step.fittings }}</td>
                        <td class="border-2 border-black py-0.5 px-2">{{ `${step.time}
                            ${getFullTimeUnit(step.time_unit)}` }}
                        </td>
                        <td class="border-2 border-black py-0.5 px-2">{{ step.output }}</td>
                        <td class="border-2 border-black py-0.5 px-2">{{ step.description }}</td>
                    </tr>
                </tbody>
            </table>
    
            <!-- Panah -->
            <svg class="absolute inset-0 w-full h-full pointer-events-none z-0">
                <arrow-connector 
                    v-for="(connection, index) in connections" 
                    :idarrow="index" 
                    idcontainer="sop-container"
                    :key="`${connection.from}-${connection.to}`" 
                    :connection="connection" 
                    @mounted="handleArrowMounted" 
                />
            </svg>
        </div>
    </div>
</template>
