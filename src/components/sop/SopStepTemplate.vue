<script setup>
import { computed, onMounted, ref, nextTick, watch, inject } from 'vue';

import FlowchartProcess from '@/components/sop/shape/flowchart/Process.vue';
import FlowchartStartEnd from '@/components/sop/shape/flowchart/StartEnd.vue';
import FlowchartDecision from '@/components/sop/shape/flowchart/Decision.vue';
import FlowchartOffPageConnector from '@/components/sop/shape/flowchart/OffPageConnector.vue';
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
    },
    arrowConfig: { type: Object, default: () => ({}) },
    labelConfig: { type: Object, default: () => ({}) },
    // BARU: Prop untuk mode edit
    editMode: {
        type: Boolean,
        default: false
    }
});

const emit = defineEmits(['manual-edit', 'label-edit']);

const sopConfig = inject('sopConfig');
const { flowchartLabelConfig } = inject('labelConfigs');

const handleManualEdit = (config) => {
    emit('manual-edit', config);
};

const handleLabelEdit = (config) => {
    emit('label-edit', config);
};

// Definisikan nilai default yang jelas
const DEFAULT_FIRST_PAGE_STEPS = 6;
const DEFAULT_NEXT_PAGE_STEPS = 5;
const DEFAULT_WIDTH_KEGIATAN = 23;
const DEFAULT_WIDTH_KELENGKAPAN = 19;
const DEFAULT_WIDTH_WAKTU = 11;
const DEFAULT_WIDTH_OUTPUT = 18;
const DEFAULT_WIDTH_KETERANGAN = 28;

const BASE_STEPS_PER_PAGE = computed(() => {
    return sopConfig.value?.firstPageSteps || DEFAULT_FIRST_PAGE_STEPS;
});
const STEPS_WITH_BOTH_OPC = computed(() => {
    return sopConfig.value?.nextPageSteps || DEFAULT_NEXT_PAGE_STEPS;
});
const connectorChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const mainSopAreaId = 'main-sop-area'; // ID untuk container utama

// lebar kolom dalam persentase
const columnWidth = computed(() => ({
    activity: sopConfig.value?.widthKegiatan || DEFAULT_WIDTH_KEGIATAN,
    completeness: sopConfig.value?.widthKelengkapan || DEFAULT_WIDTH_KELENGKAPAN,
    time: sopConfig.value?.widthWaktu || DEFAULT_WIDTH_WAKTU,
    output: sopConfig.value?.widthOutput || DEFAULT_WIDTH_OUTPUT,
    notes: sopConfig.value?.widthKeterangan || DEFAULT_WIDTH_KETERANGAN
}));

// --- Refs for column positioning ---
const implementerHeaderRefs = ref({});
const opcMounted = ref(false);
const redrawKey = ref(Date.now());
const arrowsReady = ref(false);

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
        'terminator': FlowchartStartEnd,
        'task': FlowchartProcess,
        'decision': FlowchartDecision,
        'connector': FlowchartOffPageConnector
    };
    return shapeMap[type] || FlowchartProcess;
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

// --- STATE BARU UNTUK MELACAK KONFIGURASI PANAH ---
const arrowConfigs = ref({});

const handlePathUpdate = (payload) => {
    if (payload && payload.connectionId) {
        // PERBAIKAN: Debug payload yang diterima
        // console.log(`[SopStepTemplate] Receiving path update for connection ${payload.connectionId}:`, payload);
        
        // PERBAIKAN: Selalu update dengan payload terbaru dari ArrowConnector
        arrowConfigs.value[payload.connectionId] = { ...payload };
    }
};
// -------------------------------------------

const connections = computed(() => {
    const allConnections = [];
    const implementerIds = orderedImplementer.value.map(impl => impl.id);
    const firstImplementerId = implementerIds[0];
    const lastImplementerId = implementerIds[implementerIds.length - 1];

    // PERBAIKAN: Dapatkan custom labels dari database
    const customLabels = flowchartLabelConfig.value?.custom_labels || {};

    props.steps.forEach((step) => {
        const sourceId = `sop-step-${step.seq_number}`;
        const sourcePage = getPageNumber(step.seq_number);

        const normalizeType = t => t === 'terminator' ? 'flowchart-terminator' : t === 'task' ? 'flowchart-task' : t;
        let sourceStepType = normalizeType(step.type);

        const createConnectionEntries = (targetStepId, defaultLabel = null, condition = null) => {
            if (!targetStepId) return;
            const targetStep = props.steps.find(s => s.id_step === targetStepId);
            if (!targetStep) return;

            // PERBAIKAN: Gunakan custom label dari database, bukan dari step object
            let finalLabel = defaultLabel;
            if (condition) {
                const stepKey = `step-${step.seq_number}-${condition}`;
                const customLabel = customLabels[stepKey];
                if (customLabel) {
                    finalLabel = customLabel;
                }
            }

            let targetStepType = normalizeType(targetStep.type);

            const targetElementId = `sop-step-${targetStep.seq_number}`;
            const targetPage = getPageNumber(targetStep.seq_number);
            
            const uniqueId = `conn-${step.seq_number}-to-${targetStep.seq_number}-${condition || 'next'}`;
            const baseConnectorId = `step-${step.seq_number}-to-step-${targetStep.seq_number}`;

            if (sourcePage !== targetPage) {
                const flowDirection = sourcePage < targetPage ? 'down' : 'up';

                allConnections.push({ 
                    id: `${uniqueId}-out`,
                    from: sourceId, 
                    to: `opc-out-${baseConnectorId}`,
                    label: finalLabel, 
                    condition,
                    sourceType: sourceStepType,
                    targetType: 'connector',
                    isOpcConnectionSegment: true,
                    flowDirection,
                    sourcePage,
                    targetPage: sourcePage
                });
                
                allConnections.push({ 
                    id: `${uniqueId}-in`,
                    from: `opc-in-${baseConnectorId}`,
                    to: targetElementId,
                    sourceType: 'connector',
                    targetType: targetStepType,
                    isOpcConnectionSegment: true,
                    flowDirection,
                    sourcePage: targetPage,
                    targetPage
                });
            } else {
                allConnections.push({ 
                    id: uniqueId,
                    from: sourceId, 
                    to: targetElementId, 
                    label: finalLabel, 
                    condition,
                    sourceType: sourceStepType,
                    targetType: targetStepType,
                    sourcePage,
                    targetPage,
                    isTargetFirstStep: targetStep.seq_number === 1,
                    isTargetFirstColumn: targetStep.id_implementer === firstImplementerId,
                    isTargetLastColumn: targetStep.id_implementer === lastImplementerId,
                });
            }
        };

        if (step.type === 'decision') {
            createConnectionEntries(step.id_next_step_if_yes, 'Ya', 'yes');
            createConnectionEntries(step.id_next_step_if_no, 'Tidak', 'no');
        } else {
            const nextStepInSequence = props.steps.find(s => s.seq_number === step.seq_number + 1);
            if (nextStepInSequence) {
                createConnectionEntries(nextStepInSequence.id_step);
            }
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
            const targetStepData = props.steps.find(s => s.id_step === targetStepId);
            if (!targetStepData) return;
            const targetPage = getPageNumber(targetStepData.seq_number);

            if (sourcePage !== targetPage) {
                const connectorLetter = connectorChars[currentConnectorPairIndex % connectorChars.length];
                const baseConnectorId = `step-${step.seq_number}-to-step-${targetStepData.seq_number}`;
                const direction = sourcePage < targetPage ? 'down' : 'up';
                
                // Outgoing OPC
                connectors.push({
                    id: `opc-out-${baseConnectorId}`,
                    stepSeq: step.seq_number, // Sequence number of the source step
                    implementerId: step.id_implementer, // Implementer of the source step
                    type: 'outgoing',
                    letter: connectorLetter,
                    sourcePage, // Page where this OPC originates
                    targetPage, // Page where the corresponding incoming OPC will be
                    targetStepSeq: targetStepData.seq_number, // Keep track of target for connection
                    direction
                });
                
                // Incoming OPC
                connectors.push({
                    id: `opc-in-${baseConnectorId}`,
                    stepSeq: targetStepData.seq_number, // Sequence number of the target step
                    implementerId: targetStepData.id_implementer, // Implementer of the target step
                    type: 'incoming',
                    letter: connectorLetter,
                    sourcePage, // Page where the corresponding outgoing OPC is
                    targetPage, // Page where this OPC lands
                    sourceStepSeq: step.seq_number, // Keep track of source for connection
                    direction
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
    return connectors;
});

const usedSides = computed(() => {
    const used = {}; // Format: { [shapeId]: { in: { [side]: connId[] }, out: { [side]: connId[] } } }

    connections.value.forEach(conn => {
        const pathInfo = arrowConfigs.value[conn.id];
        if (!pathInfo || !pathInfo.sSide || !pathInfo.eSide) return;

        // Inisialisasi jika belum ada
        if (!used[conn.from]) used[conn.from] = { in: {}, out: {} };
        if (!used[conn.to]) used[conn.to] = { in: {}, out: {} };

        // Lacak sisi KELUAR dari sumber
        if (!used[conn.from].out[pathInfo.sSide]) used[conn.from].out[pathInfo.sSide] = [];
        if (!used[conn.from].out[pathInfo.sSide].includes(conn.id)) {
            used[conn.from].out[pathInfo.sSide].push(conn.id);
        }

        // Lacak sisi MASUK ke tujuan
        if (!used[conn.to].in[pathInfo.eSide]) used[conn.to].in[pathInfo.eSide] = [];
        if (!used[conn.to].in[pathInfo.eSide].includes(conn.id)) {
            used[conn.to].in[pathInfo.eSide].push(conn.id);
        }
    });
    return used;
});

// Helper: filter OPC by area (top/bottom) and direction
const getOPCForPageArea = (pageIndex, opcType, area) => {
    // opcType: 'incoming' or 'outgoing'
    // area: 'top' or 'bottom'
    const connectors = allOffPageConnectors.value || [];

    return connectors.filter(opc => {
        if (opc.type !== opcType) return false;

        if (opcType === 'incoming') {
            // This OPC should appear on its targetPage
            if (opc.targetPage !== pageIndex) return false;

            if (opc.direction === 'down') {
                // Incoming 'down' OPCs are always at the top of the target page
                // BUT, not on page 0's top
                if (area === 'top') return pageIndex !== 0; 
                return false; // 'down' incoming are never at the bottom
            } else { // opc.direction === 'up'
                // Incoming 'up' OPCs are always at the bottom of the target page
                if (area === 'bottom') return true;
                return false; // 'up' incoming are never at the top
            }
        } else { // opcType === 'outgoing'
            // This OPC should appear on its sourcePage
            if (opc.sourcePage !== pageIndex) return false;

            if (opc.direction === 'down') {
                // Outgoing 'down' OPCs are always at the bottom of the source page
                if (area === 'bottom') return true;
                return false; // 'down' outgoing are never at the top
            } else { // opc.direction === 'up'
                // Outgoing 'up' OPCs are always at the top of the source page
                // BUT, not on page 0's top
                if (area === 'top') return pageIndex !== 0;
                return false; // 'up' outgoing are never at the bottom
            }
        }
    });
};

const getStepsPerPage = (pageIndex) => {
    const totalSteps = props.steps.length;
    if (pageIndex === 0) {
        return BASE_STEPS_PER_PAGE.value;
    }
    // For subsequent pages, it's always STEPS_WITH_BOTH_OPC unless it's the last bit
    const stepsOnPreviousPages = BASE_STEPS_PER_PAGE.value + (pageIndex - 1) * STEPS_WITH_BOTH_OPC.value;
    const stepsLeft = totalSteps - stepsOnPreviousPages;

    if (stepsLeft <= 0) return 0;
    return Math.min(stepsLeft, STEPS_WITH_BOTH_OPC.value);
};

const allPages = computed(() => {
    const pages = [];
    let currentIndex = 0;
    let pageCounter = 0;

    while (currentIndex < props.steps.length) {
        const maxStepsOnPage = getStepsPerPage(pageCounter);
        if (maxStepsOnPage <= 0 && props.steps.length > 0 && currentIndex < props.steps.length) {
            // console.warn(`Max steps for page ${pageCounter} is 0, but steps remain. Breaking to avoid infinite loop. currentIndex: ${currentIndex}, totalSteps: ${props.steps.length}`);
            break; 
        }
        if (maxStepsOnPage === 0 && currentIndex >= props.steps.length) { // All steps processed
            break;
        }
        const pageSteps = props.steps.slice(currentIndex, currentIndex + maxStepsOnPage);
        pages.push(pageSteps);
        currentIndex += maxStepsOnPage;
        pageCounter++;
        if (pageCounter > props.steps.length * 2) { // Safety break for very large number of pages / potential error
            // console.warn("Exceeded maximum expected pages, breaking loop.");
            break;
        }
    }
    return pages;
});

const pageObstacles = computed(() => {
    const obstaclesByPage = {};
    allPages.value.forEach((pageSteps, pageIndex) => {
        // 1. Tambahkan semua step di halaman ini sebagai obstacle
        const stepObstacles = pageSteps.map(step => ({
            id: `sop-step-${step.seq_number}`
        }));

        // 2. Tambahkan semua OPC di bagian atas dan bawah halaman ini sebagai obstacle
        const topOpcs = getStyledOpcGroups(pageIndex, 'top');
        const bottomOpcs = getStyledOpcGroups(pageIndex, 'bottom');
        const opcObstacles = [...topOpcs, ...bottomOpcs].map(opc => ({
            id: opc.id
        }));

        obstaclesByPage[pageIndex] = [...stepObstacles, ...opcObstacles];
    });
    return obstaclesByPage;
});

const getConnectionsForPage = (pageIndex) => {
    return connections.value.filter(conn => conn.sourcePage === pageIndex);
};

const getStyledOpcGroups = (pageIndex, area) => {
    const incomingOpcs = getOPCForPageArea(pageIndex, 'incoming', area);
    const outgoingOpcs = getOPCForPageArea(pageIndex, 'outgoing', area);
    const allOpcsForArea = [...incomingOpcs, ...outgoingOpcs];

    if (!allOpcsForArea.length) return [];

    const styledOpcs = [];
    
    const opcsByImplementer = allOpcsForArea.reduce((acc, opc) => {
        const key = opc.implementerId || 'unknown_implementer'; 
        acc[key] = acc[key] || [];
        acc[key].push(opc);
        return acc;
    }, {});

    for (const implementerIdStr in opcsByImplementer) {
        const opcsInThisColumn = opcsByImplementer[implementerIdStr];
        // Sort OPCs: by type (e.g., incoming first), then by letter for consistent ordering
        opcsInThisColumn.sort((a, b) => {
            if (a.type !== b.type) {
                return a.type.localeCompare(b.type); // 'incoming' before 'outgoing'
            }
            return a.letter.localeCompare(b.letter); // Then by letter
        });

        opcsInThisColumn.forEach((opc, idx) => {
            styledOpcs.push({
                ...opc,
                style: getOpcStyle(
                    opc,
                    idx, 
                    opcsInThisColumn.length, // Total OPCs (incoming + outgoing) in this column & area
                    area 
                )
            });
        });
    }
    // Final sort for rendering consistency across columns and types
    return styledOpcs.sort((a,b) => {
        const idxA_col = orderedImplementer.value.findIndex(impl => impl.id === a.implementerId);
        const idxB_col = orderedImplementer.value.findIndex(impl => impl.id === b.implementerId);
        if (idxA_col !== idxB_col) {
            return idxA_col - idxB_col; // Sort by column order
        }
        if (a.type !== b.type) { // Then by type
            return a.type.localeCompare(b.type);
        }
        return a.letter.localeCompare(b.letter); // Then by letter
    });
};

const getOpcStyle = (opc, indexInColumn = 0, totalInColumn = 1, areaOnPage = 'top') => {
    if (!opcMounted.value) return { visibility: 'hidden' };

    const headerRef = implementerHeaderRefs.value[opc.implementerId];
     if (!headerRef) {
        // console.warn(`Implementer header ref not found for ID: ${opc.implementerId}. OPC:`, opc);
        return { visibility: 'hidden' };
    }
    const rect = headerRef.getBoundingClientRect(); // rect of the implementer column header
    
    // OPC's own page (sourcePage for outgoing, targetPage for incoming)
    const opcPageNumber = opc.type === 'incoming' ? opc.targetPage : opc.sourcePage;
    const containerDiv = document.querySelector(`#${mainSopAreaId}-${opcPageNumber}`);

    if (!containerDiv) {
        // console.warn(`Container DIV #${mainSopAreaId}-${opcPageNumber} not found. OPC:`, opc);
        return { visibility: 'hidden' };
    }

    const containerRect = containerDiv.getBoundingClientRect(); // rect of the page container
    const opcWidth = 50; 
    const opcGap = 7; // The actual visual gap between OPCs
    const opcSpacing = opcWidth + opcGap; // Distance from start of one OPC to start of next

    let leftPosition;
    // Calculate the center X of the implementer column relative to the containerDiv
    const columnCenterX = (rect.left - containerRect.left) + (rect.width / 2);

    if (totalInColumn > 1) {
        // Total width occupied by all OPCs in this group, including gaps between them
        const totalGroupWidth = (totalInColumn * opcWidth) + ((totalInColumn - 1) * opcGap);
        // Calculate the starting left position for the first OPC in the group
        // so that the entire group is centered within the column
        const groupStartLeft = columnCenterX - (totalGroupWidth / 2);
        // Calculate the left position for the current OPC within the group
        leftPosition = groupStartLeft + (indexInColumn * opcSpacing);
    } else {
        // Single OPC, center it in the column
        leftPosition = columnCenterX - (opcWidth / 2);
    }
    
    let styleProps = {
        position: 'absolute',
        left: `${leftPosition}px`,
        zIndex: 10, 
        visibility: 'visible',
        width: `${opcWidth}px`, 
    };

    if (areaOnPage === 'top') {
        styleProps.top = `0px`;
    } else { // areaOnPage === 'bottom'
        styleProps.bottom = `0px`;
    }

    return styleProps;
};

// Fungsi untuk recalculate posisi OPC
const recalculateOPCPositions = async () => {
    await nextTick();
    opcMounted.value = false;
    await nextTick();
    opcMounted.value = true;
};

const orderedImplementer = computed(() => {
    // Ambil urutan id_implementer sesuai kemunculan pertama di steps
    const seen = new Set();
    const order = [];
    props.steps.forEach(step => {
        if (step.id_implementer && !seen.has(step.id_implementer)) {
            seen.add(step.id_implementer);
            order.push(step.id_implementer);
        }
    });
    // Tambahkan implementer yang belum muncul di steps (agar tetap muncul semua)
    props.implementer.forEach(impl => {
        if (!seen.has(impl.id)) {
            order.push(impl.id);
        }
    });
    // Kembalikan array implementer sesuai urutan
    return order.map(id => props.implementer.find(impl => impl.id === id));
});

watch(props.steps, async () => {
    arrowsReady.value = false; // 1. Sembunyikan panah lama
    arrowConfigs.value = {}; // 2. Reset state sisi yang digunakan
    await recalculateOPCPositions();
    redrawKey.value = Date.now(); // 3. Picu kalkulasi ulang
    
    // 4. Tunggu sebentar agar semua kalkulasi selesai, lalu tampilkan panah baru
    setTimeout(() => {
        arrowsReady.value = true;
    }, 100);
}, { deep: true });

watch(sopConfig, async () => {
    arrowsReady.value = false;
    arrowConfigs.value = {};
    await recalculateOPCPositions();
    redrawKey.value = Date.now();

    await nextTick(); // Tunggu DOM update
    arrowsReady.value = true;
}, { deep: true });

// Mounting lifecycle hook
onMounted(async () => {
    await nextTick();
    opcMounted.value = true;

    await nextTick(); // Tunggu DOM update
    arrowsReady.value = true;
});

const arrowConnectorRefs = ref({});

const setArrowConnectorRef = (el, connectionId) => {
    if (el) {
        arrowConnectorRefs.value[connectionId] = el;
    } else {
        delete arrowConnectorRefs.value[connectionId];
    }
};

// PERBAIKAN: Force recalculation yang menggunakan label dari database
const forceRecalculation = () => {
    console.log('[SopStepTemplate] Force recalculation triggered');
    
    // Reset semua state yang berhubungan dengan panah
    arrowConfigs.value = {};
    arrowsReady.value = false;
    redrawKey.value = Date.now();
    
    // Tunggu sebentar untuk memastikan DOM terupdate
    setTimeout(() => {
        arrowsReady.value = true;
        console.log('[SopStepTemplate] Arrows ready after force recalculation');
    }, 200);
};

// PERBAIKAN: Reset arrows yang lebih clean
const resetArrowsToLastSaved = () => {
    console.log('[SopStepTemplate] Reset arrows to last saved');
    console.log('[SopStepTemplate] Current props.arrowConfig:', props.arrowConfig);
    
    // Hanya reset arrowConfigs internal
    arrowConfigs.value = {};
    redrawKey.value = Date.now();
    
    setTimeout(() => {
        arrowsReady.value = true;
        console.log('[SopStepTemplate] Arrows ready after reset');
    }, 100);
};

// BARU: Expose functions
defineExpose({
    resetArrowsToLastSaved,
    forceRecalculation
});

// PERBAIKAN: Watch untuk props.arrowConfig dengan debug
watch(() => props.arrowConfig, (newConfig, oldConfig) => {
    console.log('[SopStepTemplate] Props arrowConfig changed from:', oldConfig, 'to:', newConfig);
    if (Object.keys(newConfig).length === 0 && Object.keys(arrowConfigs.value).length > 0) {
        console.log('[SopStepTemplate] Props config is empty but internal config exists, forcing recalculation');
        forceRecalculation();
    }
}, { deep: true });
</script>

<template>
    <div class="flex flex-col gap-8 overflow-x-auto">
        <div class="px-4 lg:px-0 print:px-0 mx-auto">
            <div v-for="(pageSteps, pageIndex) in allPages" :key="pageIndex" class="print-page w-[calc(297mm-3cm)] min-w-[calc(297mm-3cm)] print:min-w-[calc(297mm-4cm)]">
                <div :id="`${mainSopAreaId}-${pageIndex}`" class="relative">

                    <!-- Area for OPCs at the TOP of the page -->
                    <div class="relative w-full h-[70px] mb-4" v-if="getStyledOpcGroups(pageIndex, 'top').length > 0">
                        <template v-for="styledOpc in getStyledOpcGroups(pageIndex, 'top')" :key="styledOpc.id">
                            <FlowchartOffPageConnector
                                v-show="opcMounted"
                                :id="styledOpc.id"
                                :letter="styledOpc.letter"
                                :style="styledOpc.style"
                            />
                        </template>
                    </div>

                    <!-- Table content -->
                    <table class="w-full border-collapse border-2 border-black table-fixed text-sm" :id="`sop-container-${pageIndex}`">
                        <!-- Header only for first page -->
                        <thead v-if="pageIndex === 0">
                            <tr class="!bg-[#D9D9D9]">
                                <th rowspan="2" class="border-2 py-0.5 border-black">NO</th>
                                <th rowspan="2" class="border-2 py-0.5 border-black">KEGIATAN</th>
                                <th :colspan="orderedImplementer.length || 1" class="border-2 py-0.5 px-1 border-black">PELAKSANA</th>
                                <th colspan="3" class="border-2 py-0.5 px-1 border-black">MUTU BAKU</th>
                                <th rowspan="2" class="border-2 py-0.5 px-1 border-black">KET</th>
                            </tr>
                            <tr class="!bg-[#D9D9D9]">
                                <th v-for="(impl, idx) in orderedImplementer" :key="`impl-${idx}`" 
                                    :ref="el => setImplementerHeaderRef(el, impl?.id)"
                                    class="border-2 py-0.5 px-1 border-black">
                                    {{ impl?.name.toUpperCase() }}
                                </th>
                                <th class="border-2 py-0.5 border-black">KELENGKAPAN</th>
                                <th class="border-2 py-0.5 border-black">WAKTU</th>
                                <th class="border-2 py-0.5 border-black">OUTPUT</th>
                            </tr>
                        </thead>
                        <colgroup>
                            <col class="w-[5%]"> <!-- NO -->
                            <col :style="{ width: columnWidth.activity + '%' }"> <!-- KEGIATAN -->
                            <col v-for="(impl, idx) in orderedImplementer" :key="`impl-${idx}`" 
                                 :style="{ width: `${70 / (orderedImplementer.length || 1)}%` }"> <!-- PELAKSANA -->
                            <col :style="{ width: columnWidth.completeness + '%' }"> <!-- KELENGKAPAN -->
                            <col :style="{ width: columnWidth.time + '%' }"> <!-- WAKTU -->
                            <col :style="{ width: columnWidth.output + '%' }"> <!-- OUTPUT -->
                            <col :style="{ width: columnWidth.notes + '%' }"> <!-- KET -->
                        </colgroup>
                        <tbody>
                            <tr v-for="step in pageSteps" :key="step.id_step">
                                <td class="border-2 border-black py-0.5 text-center">{{ step.seq_number }}</td>
                                <td class="border-2 border-black py-0.5 px-1 text-justify break-words hyphens-auto" lang="id">{{ step.name }}</td>
                                <td v-for="(impl, idx) in orderedImplementer" :key="`impl-${idx}`" :data-implementer-id="impl?.id"
                                    class="border-2 border-black p-0 text-center align-middle relative">
                                    <div v-if="step.id_implementer === impl?.id" 
                                         class="flex flex-col justify-around items-center px-2 py-5 min-h-[70px]">
                                        <component 
                                            :is="getShapeComponent(step.type)" 
                                            :id="`sop-step-${step.seq_number}`"
                                            class="relative z-10" 
                                        />
                                    </div>
                                </td>
                                <td class="border-2 border-black py-0.5 px-1 text-justify break-words hyphens-auto" lang="id">{{ step.fittings }}</td>
                                <td class="border-2 border-black py-0.5 px-1 text-justify break-words hyphens-auto" lang="id">{{ `${step.time} ${getFullTimeUnit(step.time_unit)}` }}</td>
                                <td class="border-2 border-black py-0.5 px-1 text-justify break-words hyphens-auto" lang="id">{{ step.output }}</td>
                                <td class="border-2 border-black py-0.5 px-1 text-justify break-words hyphens-auto" lang="id">{{ step.description }}</td>
                            </tr>
                        </tbody>
                    </table>

                    <!-- Area for OPCs at the BOTTOM of the page -->
                    <div class="relative w-full h-[70px] mt-4" v-if="getStyledOpcGroups(pageIndex, 'bottom').length > 0">
                        <template v-for="styledOpc in getStyledOpcGroups(pageIndex, 'bottom')" :key="styledOpc.id">
                            <FlowchartOffPageConnector
                                v-show="opcMounted"
                                :id="styledOpc.id"
                                :letter="styledOpc.letter"
                                :style="styledOpc.style"
                            />
                        </template>
                    </div>

                    <!-- SVG arrows layer -->
                    <svg v-if="arrowsReady" class="absolute inset-0 w-full h-full z-20"
                         :class="editMode ? 'pointer-events-auto' : 'pointer-events-none'">
                            <arrow-connector 
                                v-for="(connection, connIndex) in getConnectionsForPage(pageIndex)" 
                                :key="`conn-${pageIndex}-${connIndex}-${redrawKey}`"
                                :ref="el => setArrowConnectorRef(el, connection.id)"
                                :idarrow="`arrow-${pageIndex}-${connIndex}`" 
                                :idcontainer="`${mainSopAreaId}-${pageIndex}`"
                                :connection="connection"
                                :redraw-key="redrawKey"
                                :obstacles="pageObstacles[pageIndex] || []"
                                :used-sides="usedSides"
                                :manual-config="arrowConfig[connection.id]"
                                :manual-label-position="labelConfig.positions && labelConfig.positions[connection.id]"
                                :edit-mode="editMode"
                                @path-updated="handlePathUpdate"
                                @manual-edit="handleManualEdit"
                                @label-edit="handleLabelEdit"
                            />
                    </svg>
                </div>
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
