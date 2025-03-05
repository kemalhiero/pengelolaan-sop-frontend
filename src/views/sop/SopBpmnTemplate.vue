<template>
  <div class="bpmn-container">
    <BpmnViewer :xml="bpmnXml" />
  </div>
</template>

<style scoped>
.bpmn-container {
  position: relative;
  border: 1px solid #ccc;
  margin: 20px 0;
}
</style>

<script setup>
import { computed, onMounted } from 'vue';
import BpmnViewer from '@/components/diagram/bpmn/BpmnViewer.vue';
import { convertToBpmnXml } from '@/utils/bpmnGenerator';

const props = defineProps({
  steps: {
    type: Array,
    required: true
  },
  implementer: {
    type: Array,
    required: true
  },
  name: {
    type: String,
    default: ''
  }
});

// Mengkonversi data ke BPMN XML
const bpmnXml = computed(() => {
  const xml = convertToBpmnXml(props.steps, props.implementer);
  console.log('Generated XML:', xml.substring(0, 200) + '...');
  return xml;
});

// Memastikan data sudah terisi dengan benar
onMounted(() => {
  console.log('SopBpmnTemplate mounted', { 
    stepsCount: props.steps.length,
    implementerCount: props.implementer.length 
  });
});
</script>
