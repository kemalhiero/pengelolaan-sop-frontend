<!-- BpmnViewer.vue -->
<template>
    <div class="h-[500px] w-full border border-gray-300 relative" ref="container">
        <!-- Tambahkan indikator loading/error -->
        <div v-if="loading" class="absolute inset-0 flex items-center justify-center">Loading diagram...</div>
        <div v-if="error" class="absolute inset-0 flex items-center justify-center text-red-500">{{ error }}</div>
    </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';
import BpmnJS from 'bpmn-js';

const props = defineProps({
    xml: {
        type: String,
        required: true
    }
});

const container = ref(null);
let bpmnViewer = null;
const loading = ref(false);
const error = ref(null);

onMounted(() => {
    try {
        console.log('Mounting BpmnViewer');
        // Inisialisasi viewer BPMN
        bpmnViewer = new BpmnJS({
            container: container.value
        });

        // Import diagram awal
        if (props.xml) {
            console.log('Initial XML available:', props.xml.substring(0, 100) + '...');
            loadBpmnDiagram(props.xml);
        } else {
            console.warn('No XML provided on mount');
        }
    } catch (e) {
        console.error('Error initializing BPMN viewer:', e);
        error.value = `Error initializing: ${e.message}`;
    }
});

// Watch untuk perubahan XML
watch(() => props.xml, (newXml) => {
    console.log('XML changed, loading new diagram');
    if (newXml && bpmnViewer) {
        loadBpmnDiagram(newXml);
    }
});

const loadBpmnDiagram = async (xml) => {
    loading.value = true;
    error.value = null;

    try {
        console.log('Loading BPMN diagram');
        const result = await bpmnViewer.importXML(xml);
        console.log('BPMN diagram loaded successfully', result);

        // Fit diagram to viewport
        bpmnViewer.get('canvas').zoom('fit-viewport');
    } catch (err) {
        console.error('Error loading BPMN diagram:', err);
        error.value = `Failed to load diagram: ${err.message}`;
    } finally {
        loading.value = false;
    }
};

onBeforeUnmount(() => {
    if (bpmnViewer) {
        bpmnViewer.destroy();
    }
});
</script>
