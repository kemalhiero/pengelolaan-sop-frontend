<script setup>
import { computed, onMounted, ref, nextTick, watch } from 'vue';

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

const BASE_STEPS_PER_PAGE = 6;
const STEPS_WITH_BOTH_OPC = 5;
const connectorChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const mainSopAreaId = 'main-sop-area'; // ID untuk container utama

// --- Refs for column positioning ---
const implementerHeaderRefs = ref({});
const opcMounted = ref(false);

const setImplementerHeaderRef = (el, implementerId) => {
    if (el) {
        implementerHeaderRefs.value[implementerId] = el;
    } else {
        // Clean up if element is removed (though less common for headers)
        delete implementerHeaderRefs.value[implementerId];
    }
};

const getShapeComponent = (type) => {
    const shapeMap = {
        'terminator': StartEnd,
        'process': Process,
        'decision': Decision,
        'connector': OffPageConnector
    };
    return shapeMap[type] || Process;
};

const getFullTimeUnit = (unit) => {
    const timeUnits = { 'h': 'Jam', 'm': 'Menit', 'd': 'Hari', 'w': 'Minggu', 'mo': 'Bulan', 'y': 'Tahun' };
    return timeUnits[unit] || unit;
};

// Helper function to get page number based on step sequence
const getPageNumber = (stepSeq) => {
    let currentPage = 0;
    let stepCounter = 0;
    
    for (let i = 0; i < props.steps.length; i++) {
        const step = props.steps[i];
        if (step.seq_number === stepSeq) {
            return currentPage;
        }
        
        stepCounter++;
        const stepsPerPage = getStepsPerPage(currentPage);
        
        if (stepCounter >= stepsPerPage) {
            currentPage++;
            stepCounter = 0;
        }
    }
    
    return currentPage;
};

const connections = computed(() => {
    const allConnections = [];

    props.steps.forEach((step) => {
        const sourceId = `sop-step-${step.seq_number}`;
        const sourcePage = getPageNumber(step.seq_number);

        const createConnectionEntries = (targetStepId, label = null, condition = null) => {
            if (!targetStepId) return;
            const targetStep = props.steps.find(s => s.id_step === targetStepId);
            if (!targetStep) return;

            const targetElementId = `sop-step-${targetStep.seq_number}`;
            const targetPage = getPageNumber(targetStep.seq_number);

            if (sourcePage !== targetPage) {
                // Ubah format baseConnectorId untuk konsistensi
                const baseConnectorId = `step-${step.seq_number}-to-step-${targetStep.seq_number}`;
                
                // Koneksi dari shape ke OPC outgoing
                allConnections.push({ 
                    from: sourceId, 
                    to: `opc-out-${baseConnectorId}`,
                    label, 
                    condition,
                    isOpcConnection: true,
                    direction: 'down',
                    sourcePage,
                    targetPage: sourcePage
                });

                // Koneksi dari OPC incoming ke shape target
                allConnections.push({ 
                    from: `opc-in-${baseConnectorId}`,
                    to: targetElementId,
                    isOpcConnection: true,
                    direction: 'up',
                    sourcePage: targetPage,
                    targetPage
                });
            } else {
                allConnections.push({ 
                    from: sourceId, 
                    to: targetElementId, 
                    label, 
                    condition,
                    sourcePage,
                    targetPage 
                });
            }
        };

        if (step.type === 'decision') {
            createConnectionEntries(step.id_next_step_if_yes, 'Ya', 'yes');
            createConnectionEntries(step.id_next_step_if_no, 'Tidak', 'no');
        } else {
            const nextStepInSequence = props.steps.find(s => s.seq_number === step.seq_number + 1);
            if (nextStepInSequence) createConnectionEntries(nextStepInSequence.id_step);
        }
    });

    return allConnections;
});

const allOffPageConnectors = computed(() => {
    const connectors = [];
    let currentConnectorPairIndex = 0;
    
    props.steps.forEach((step) => {
        const sourcePage = getPageNumber(step.seq_number);
        
        const processTargetForOPC = (targetStepId) => {
            if (!targetStepId) return;
            const targetStep = props.steps.find(s => s.id_step === targetStepId);
            if (!targetStep) return;
            
            const targetPage = getPageNumber(targetStep.seq_number);
            
            if (sourcePage !== targetPage) {
                const connectorLetter = connectorChars[currentConnectorPairIndex % connectorChars.length];
                const baseConnectorId = `step-${step.seq_number}-to-step-${targetStep.seq_number}`;
                
                // Push outgoing connector
                connectors.push({
                    id: `opc-out-${baseConnectorId}`,
                    stepSeq: step.seq_number,
                    implementerId: step.id_implementer,
                    type: 'outgoing',
                    letter: connectorLetter,
                    sourcePage,
                    targetPage
                });

                // Push incoming connector
                connectors.push({
                    id: `opc-in-${baseConnectorId}`,
                    stepSeq: targetStep.seq_number,
                    implementerId: targetStep.id_implementer,
                    type: 'incoming',
                    letter: connectorLetter,
                    sourcePage: targetPage,
                    targetPage
                });
                
                currentConnectorPairIndex++;
            }
        };
        
        if (step.type === 'decision') {
            processTargetForOPC(step.id_next_step_if_yes);
            processTargetForOPC(step.id_next_step_if_no);
        } else {
            const nextStepInSequence = props.steps.find(s => s.seq_number === step.seq_number + 1);
            if (nextStepInSequence) processTargetForOPC(nextStepInSequence.id_step);
        }
    });
    
    return connectors; // Pastikan mengembalikan array connectors
});

const getIncomingOPCForPage = (pageIndex) => {
    const connectors = allOffPageConnectors.value || [];
    return connectors.filter(opc => 
        opc.type === 'incoming' && 
        opc.targetPage === pageIndex
    );
};

const getOutgoingOPCForPage = (pageIndex) => {
    const connectors = allOffPageConnectors.value || [];
    return connectors.filter(opc => 
        opc.type === 'outgoing' && 
        opc.sourcePage === pageIndex
    );
};

const getStepsPerPage = (pageIndex) => {
    const totalSteps = props.steps.length;
    if (pageIndex === 0) {
        return BASE_STEPS_PER_PAGE;
    }
    const stepsLeft = totalSteps - BASE_STEPS_PER_PAGE - (pageIndex - 1) * STEPS_WITH_BOTH_OPC;
    if (stepsLeft <= BASE_STEPS_PER_PAGE) {
        return stepsLeft;
    }
    return STEPS_WITH_BOTH_OPC;
};

const allPages = computed(() => {
    const pages = [];
    let currentIndex = 0;

    while (currentIndex < props.steps.length) {
        const pageIndex = pages.length;
        const maxSteps = getStepsPerPage(pageIndex);
        pages.push(props.steps.slice(currentIndex, currentIndex + maxSteps));
        currentIndex += maxSteps;
    }
    return pages;
});

const getConnectionsForPage = (pageIndex) => {
    return connections.value.filter(conn => {
        if (conn.isOpcConnection) {
            // Tampilkan koneksi OPC hanya di halaman sumber atau target
            return conn.sourcePage === pageIndex || conn.targetPage === pageIndex;
        } else {
            // Untuk koneksi normal, tampilkan hanya di halaman sumber
            return conn.sourcePage === pageIndex;
        }
    });
};

const getOpcStyle = (opc) => {
    if (!opcMounted.value) return { visibility: 'hidden' };

    const implementerColumn = document.querySelector(`[data-implementer-id="${opc.implementerId}"]`);
    if (!implementerColumn) return { visibility: 'hidden' };

    const rect = implementerColumn.getBoundingClientRect();
    const containerDiv = document.querySelector(`#${mainSopAreaId}-${opc.sourcePage}`);
    if (!containerDiv) return { visibility: 'hidden' };

    const containerRect = containerDiv.getBoundingClientRect();
    
    const opcWidth = 50;
    const leftPosition = rect.left - containerRect.left + (rect.width - opcWidth) / 2;

    return { 
        position: 'absolute',
        left: `${leftPosition}px`,
        zIndex: 10,
        visibility: 'visible'
    };
};

// Fungsi untuk recalculate posisi OPC
const recalculateOPCPositions = async () => {
    await nextTick();
    opcMounted.value = false;
    await nextTick();
    opcMounted.value = true;
};

watch(props.steps, async () => {
    await recalculateOPCPositions();
}, { deep: true });

// Mounting lifecycle hook
onMounted(async () => {
    await nextTick();
    opcMounted.value = true;
});
</script>

<template>
    <div class="flex flex-col gap-8">
        <div v-for="(pageSteps, pageIndex) in allPages" :key="pageIndex"
             class="print-page w-[calc(297mm-3cm)] min-w-[calc(297mm-3cm)] mx-auto">
            <div :id="`${mainSopAreaId}-${pageIndex}`" class="relative">
                
                <!-- Incoming OPCs Area -->
                <div v-if="getIncomingOPCForPage(pageIndex).length" 
                     class="relative w-full h-[70px] mb-2">
                    <template v-for="opc in getIncomingOPCForPage(pageIndex)" :key="opc.id">
                        <OffPageConnector
                            v-show="opcMounted"
                            :id="opc.id"
                            :letter="opc.letter"
                            :style="getOpcStyle(opc)"
                        />
                    </template>
                </div>

                <!-- Table content -->
                <table class="w-full border-collapse border-2 border-black table-fixed" :id="`sop-container-${pageIndex}`">
                    <!-- Header only for first page -->
                    <thead v-if="pageIndex === 0">
                        <tr class="bg-[#D9D9D9]">
                            <th rowspan="2" class="border-2 py-0.5 border-black">NO</th>
                            <th rowspan="2" class="border-2 py-0.5 border-black">KEGIATAN</th>
                            <th :colspan="implementer.length || 1" class="border-2 py-0.5 px-1 border-black">PELAKSANA</th>
                            <th colspan="3" class="border-2 py-0.5 px-1 border-black">MUTU BAKU</th>
                            <th rowspan="2" class="border-2 py-0.5 px-1 border-black">KET</th>
                        </tr>
                        <tr class="bg-[#D9D9D9]">
                            <th v-for="impl in props.implementer" :key="impl.id" 
                                :ref="el => setImplementerHeaderRef(el, impl.id)"
                                class="border-2 py-0.5 px-2 border-black">
                                {{ impl.name.toUpperCase() }}
                            </th>
                            <th class="border-2 py-0.5 border-black">KELENGKAPAN</th>
                            <th class="border-2 py-0.5 border-black">WAKTU</th>
                            <th class="border-2 py-0.5 border-black">OUTPUT</th>
                        </tr>
                    </thead>
                    <colgroup>
                        <col class="w-[5%]"> <!-- NO -->
                        <col class="w-[20%]"> <!-- KEGIATAN -->
                        <col v-for="impl in props.implementer" :key="impl.id" 
                             :style="{ width: `${70 / props.implementer.length}%` }"> <!-- PELAKSANA -->
                        <col class="w-[19%]"> <!-- KELENGKAPAN -->
                        <col class="w-[11%]"> <!-- WAKTU -->
                        <col class="w-[15%]"> <!-- OUTPUT -->
                        <col class="w-[15%]"> <!-- KET -->
                    </colgroup>
                    <tbody>
                        <tr v-for="step in pageSteps" :key="step.id_step">
                            <td class="border-2 border-black py-0.5 text-center">{{ step.seq_number }}</td>
                            <td class="border-2 border-black py-0.5 px-1 text-justify break-words hyphens-auto" lang="id">{{ step.name }}</td>
                            <td v-for="impl in props.implementer" :key="impl.id"
                                class="border-2 border-black p-0 text-center align-middle relative"
                                :data-implementer-id="impl.id">
                                <div v-if="step.id_implementer === impl.id" 
                                     class="flex flex-col justify-around items-center px-2 py-5 min-h-[70px]">
                                    <component :is="getShapeComponent(step.type)" 
                                             :id="`sop-step-${step.seq_number}`"
                                             class="relative z-10" />
                                </div>
                            </td>
                            <td class="border-2 border-black py-0.5 px-1 text-justify break-words hyphens-auto" lang="id">{{ step.fittings }}</td>
                            <td class="border-2 border-black py-0.5 px-1 text-justify break-words hyphens-auto" lang="id">{{ `${step.time} ${getFullTimeUnit(step.time_unit)}` }}</td>
                            <td class="border-2 border-black py-0.5 px-1 text-justify break-words hyphens-auto" lang="id">{{ step.output }}</td>
                            <td class="border-2 border-black py-0.5 px-1 text-justify break-words hyphens-auto" lang="id">{{ step.description }}</td>
                        </tr>
                    </tbody>
                </table>

                <!-- Outgoing OPCs Area -->
                <div v-if="getOutgoingOPCForPage(pageIndex).length" class="relative w-full h-[70px] mt-6">
                    <template v-for="opc in getOutgoingOPCForPage(pageIndex)" :key="opc.id">
                        <OffPageConnector
                            v-show="opcMounted"
                            :id="opc.id"
                            :letter="opc.letter"
                            :style="getOpcStyle(opc)"
                        />
                    </template>
                </div>

                <!-- SVG arrows layer -->
                <svg class="absolute inset-0 w-full h-full pointer-events-none z-20">
                    <arrow-connector 
                        v-for="(connection, index) in getConnectionsForPage(pageIndex)" 
                        :key="`${pageIndex}-${index}`"
                        :idarrow="`${pageIndex}-${index}`" 
                        :idcontainer="`${mainSopAreaId}-${pageIndex}`"
                        :connection="connection" 
                    />
                </svg>
            </div>
        </div>
    </div>
</template>

<style scoped>
@media print {
    .print-page {
        page-break-after: always;
    }
    
    .print-page:last-child {
        page-break-after: auto;
    }
}
</style>
