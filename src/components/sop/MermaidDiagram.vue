<template>
  <div ref="mermaidContainer" v-html="diagramHtml"></div>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue';
import mermaid from 'mermaid';

// Props
const props = defineProps({
  diagram: {
    type: String,
    required: true,
  },
});

// Refs
const mermaidContainer = ref(null);
const diagramHtml = ref(props.diagram);

const renderMermaid = () => {
  mermaid.initialize({ startOnLoad: true });
  mermaid.contentLoaded();
  mermaid.init(undefined, mermaidContainer.value);
};

// Lifecycle hook: render Mermaid diagram on mount
onMounted(() => {
  renderMermaid();
});


// Watcher: re-render Mermaid diagram if diagram prop changes
watch(() => props.diagram, () => {
  diagramHtml.value = props.diagram;
  renderMermaid();
});
</script>