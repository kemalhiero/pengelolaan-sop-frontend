<script setup>
import { onMounted, ref, nextTick, watch } from 'vue';

const props = defineProps({
  connection: {
    type: Object,
    required: true
  },
  idarrow: {
    type: String,
    required: true
  },
  idcontainer: {
    type: String,
    required: true
  }
});

const emit = defineEmits(['mounted']);

// State untuk menyimpan path data
const pathData = ref('');
const labelPosition = ref(null);

// Fungsi untuk mendapatkan posisi elemen dengan pengecekan null
const getElementPosition = (elementId) => {
    const element = document.getElementById(elementId);
    const container = document.querySelector(`#${props.idcontainer}`);

    if (!element || !container) {
        console.warn(`Element not found:`, {
            elementId,
            containerId: props.idcontainer,
            connection: props.connection
        });
        return null;
    }

    const rect = element.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();

    const position = {
      left: rect.left - containerRect.left,
      right: rect.right - containerRect.left,
      top: rect.top - containerRect.top,
      bottom: rect.bottom - containerRect.top,
      width: rect.width,
      height: rect.height
    };

    // console.info(`Position for ${elementId}:`, position);
    return position;
};

const calculatePath = async () => {
    await nextTick();

    requestAnimationFrame(() => {
        const fromPos = getElementPosition(props.connection.from);
        const toPos = getElementPosition(props.connection.to);

        if (!fromPos || !toPos) {
            pathData.value = '';
            return;
        }

        let start = {}, end = {}, path = '';

        if (props.connection.isOpcConnection) {
            if (props.connection.direction === 'down') {
                // Koneksi dari shape ke OPC bawah
                start = {
                    x: fromPos.left + fromPos.width / 2,
                    y: fromPos.bottom
                };
                end = {
                    x: toPos.left + toPos.width / 2,
                    y: toPos.top
                };
                path = `M ${start.x} ${start.y} 
                        L ${start.x} ${(start.y + end.y) / 2}
                        L ${end.x} ${(start.y + end.y) / 2}
                        L ${end.x} ${end.y}`;
            } else {
                // Koneksi dari OPC atas ke shape
                start = {
                    x: fromPos.left + fromPos.width / 2,
                    y: fromPos.bottom
                };
                end = {
                    x: toPos.left + toPos.width / 2,
                    y: toPos.top
                };
                path = `M ${start.x} ${start.y}
                        L ${start.x} ${(start.y + end.y) / 2}
                        L ${end.x} ${(start.y + end.y) / 2}
                        L ${end.x} ${end.y}`;
            }
        } else {
            // Koneksi normal
            // Tambahkan pengecekan apakah target adalah shape sebelumnya
            const fromNumber = parseInt(props.connection.from.split('-')[2]);
            const toNumber = parseInt(props.connection.to.split('-')[2]);
            const isGoingBack = fromNumber > toNumber;

            // Tentukan arah dan posisi relatif
            const isToTheRight = toPos.left > fromPos.right; //ke kanan lalu belok ke atas atau bawah
            const isToTheLeft = toPos.right < fromPos.left; //ke kiri lalu belok ke atas atau bawah

            const alignmentTolerance = 20;  // Definisikan variabel toleransi untuk pengecekan apakah shape sejajar (piksel)

            // Pengecekan apakah shape sejajar
            const isDirectlyBelow = toPos.top > fromPos.bottom &&
              Math.abs((fromPos.left + fromPos.width / 2) - (toPos.left + toPos.width / 2)) < alignmentTolerance;
            const isDirectlyAbove = toPos.bottom < fromPos.top &&
              Math.abs((fromPos.left + fromPos.width / 2) - (toPos.left + toPos.width / 2)) < alignmentTolerance;
            const isDirectlyRight = toPos.left > fromPos.right &&
              Math.abs((fromPos.top + fromPos.height / 2) - (toPos.top + toPos.height / 2)) < alignmentTolerance;
            const isDirectlyLeft = toPos.right < fromPos.left &&
              Math.abs((fromPos.top + fromPos.height / 2) - (toPos.top + toPos.height / 2)) < alignmentTolerance;

            if (isDirectlyBelow) {
              start = {
                x: fromPos.left + fromPos.width / 2,
                y: fromPos.bottom
              };
              end = {
                x: toPos.left + toPos.width / 2,
                y: toPos.top
              };
              path = `M ${start.x} ${start.y} L ${end.x} ${end.y}`;
            }
            else if (isDirectlyAbove) {
              start = {
                x: fromPos.left + fromPos.width / 2,
                y: fromPos.top
              };
              end = {
                x: toPos.left + toPos.width / 2,
                y: toPos.bottom
              };
              path = `M ${start.x} ${start.y} L ${end.x} ${end.y}`;
            }
            else if (isDirectlyRight) {
              start = {
                x: fromPos.right,
                y: fromPos.top + fromPos.height / 2
              };
              end = {
                x: toPos.left,
                y: toPos.top + toPos.height / 2
              };
              path = `M ${start.x} ${start.y} L ${end.x} ${end.y}`;
            }
            else if (isDirectlyLeft) {
              start = {
                x: fromPos.left,
                y: fromPos.top + fromPos.height / 2
              };
              end = {
                x: toPos.right,
                y: toPos.top + toPos.height / 2
              };
              path = `M ${start.x} ${start.y} L ${end.x} ${end.y}`;
            }
            else if (isToTheRight) {
              start = {
                x: fromPos.right,
                y: fromPos.top + fromPos.height / 2
              };
              end = {
                x: toPos.left + toPos.width / 2,
                y: props.idcontainer === "sop-container" 
                   ? (isGoingBack ? toPos.bottom : toPos.top)
                   : (toPos.top > fromPos.top ? toPos.top : toPos.bottom)   //dilakukan pengecekan apakah sop atau bpmn
              };
              path = `M ${start.x} ${start.y}
                      L ${end.x} ${start.y}
                      L ${end.x} ${end.y}`;
            }
            else if (isToTheLeft) {
              start = {
                x: fromPos.left,
                y: fromPos.top + fromPos.height / 2
              };
              end = {
                x: toPos.left + toPos.width / 2,
                y: isGoingBack ? toPos.bottom : toPos.top
              };
              path = `M ${start.x} ${start.y}
                      L ${end.x} ${start.y}
                      L ${end.x} ${end.y}`;
            }
        }

        // Sesuaikan posisi label
        if (props.connection.label) {
          const midX = (start.x + end.x) / 2;
          const midY = (start.y + end.y) / 2;
          const offset = 15;

          if (isDirectlyBelow || isDirectlyAbove) {
            labelPosition.value = {
              x: midX + offset,
              y: midY
            };
          } else {
            labelPosition.value = {
              x: midX,
              y: start.y - offset
            };
          }
        }

        pathData.value = path;
        emit('mounted');
    });
};

onMounted(() => {
  calculatePath();
});

// Tambahkan watch untuk connection
watch(() => props.connection, () => {
  calculatePath();
}, { deep: true });
</script>

<template>
  <g v-if="pathData">
    <!-- Definisi marker panah -->
    <defs>
      <marker :id="`arrowhead-${idarrow}`" markerWidth="10" markerHeight="8" refX="7" refY="4" orient="auto">
        <path d="M0,0 L8,4 L0,8 L2,4 Z" fill="black" />
      </marker>
    </defs>

    <!-- Path panah -->
    <path :d="pathData" fill="none" stroke="black" stroke-width="2" :marker-end="`url(#arrowhead-${idarrow})`" />

    <!-- Label -->
    <text v-if="labelPosition && props.connection.label" :x="labelPosition.x" :y="labelPosition.y"
      class="text-sm font-medium fill-black" text-anchor="middle" alignment-baseline="middle">
      {{ props.connection.label }}
    </text>
  </g>
</template>
