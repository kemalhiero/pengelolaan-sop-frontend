<script setup>
import { computed, ref } from 'vue';

import StartEnd from '@/assets/flowchart/StartEnd.vue';
import Process from '@/assets/flowchart/Process.vue';
import Decision from '@/assets/flowchart/Decision.vue';
import OffPageConnector from '@/assets/flowchart/OffPageConnector.vue';

import ArrowConnector from '@/assets/flowchart/ArrowConnector.vue';

const props = defineProps({
    // sop info
    name: {
        type: String,
        required: true
    },
    number: {
        type: String,
        required: true
    },
    createdDate: {
        type: String,
        required: true
    },
    revisionDate: {
        type: String
    },
    effectiveDate: {
        type: String
    },
    picName: {
        type: String,
        required: true
    },
    picNumber: {
        type: String,
        required: true
    },
    section: {
        type: String,
        required: true
    },
    lawBasis: {
        type: Array,
        required: true
    },
    implementQualification: {
        type: Array,
        required: true
    },
    relatedSop: {
        type: Array
    },
    equipment: {
        type: Array,
        required: true
    },
    warning: {
        type: String,
        required: true
    },
    recordData: {
        type: Array,
        required: true
    },

    // sop step
    implementer: {
        type: Array,
        required: true
    },
    steps: {
        type: Array,
        required: true,
        default: () => []
    }

});

// Fungsi untuk mendapatkan komponen shape berdasarkan tipe
const getShapeComponent = (type) => {
    const shapeMap = {
        'start-end': StartEnd,
        'process': Process,
        'decision': Decision,
        'connector': OffPageConnector
    };
    return shapeMap[type] || Process;
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
                    from: `step-${step.sequential_number}`,
                    to: `step-${props.steps.find(s => s.id === step.id_next_step_if_yes)?.sequential_number}`,
                    label: 'Ya',
                    condition: 'yes'
                });
            }
            
            // Tambahkan koneksi untuk kondisi 'No'
            if (step.id_next_step_if_no) {
                allConnections.push({
                    from: `step-${step.sequential_number}`,
                    to: `step-${props.steps.find(s => s.id === step.id_next_step_if_no)?.sequential_number}`,
                    label: 'Tidak',
                    condition: 'no'
                });
            }
        } else {
            // Untuk step non-decision, gunakan sequential berikutnya
            const nextStep = props.steps.find(s => s.sequential_number === step.sequential_number + 1);
            if (nextStep) {
                allConnections.push({
                    from: `step-${step.sequential_number}`,
                    to: `step-${nextStep.sequential_number}`
                });
            }
        }
    });

    return allConnections;
});

</script>

<template>
  <!-- Tambahkan wrapper dengan position relative -->
  <div class="relative">
    <!-- Table pertama -->
    <table class="w-11/12 mx-auto my-8 border-collapse border-2 border-black">
        <tbody>
            <tr>
                <th rowspan="8" class="w-[47%] border-2 py-0.5 px-2 border-black">
                    <img class="mx-auto h-36 my-4" src="/logo_unand_kecil.png"
                        alt="Logo Kementerian Pendidikan Kebudayaan, Riset dan Teknologi">
                    <h4>KEMENTERIAN PENDIDIKAN TINGGI, SAINS, DAN TEKNOLOGI</h4>
                    <h4>UNIVERSITAS ANDALAS </h4>
                    <h4>FAKULTAS TEKNOLOGI INFORMASI</h4>
                    <h4 class="font-[450]">DEPARTEMEN SISTEM INFORMASI</h4>
                </th>
            </tr>
            <tr>
                <td class="font-bold border-2 py-0.5 px-2 border-black">NOMOR POS</td>
                <td class="border-2 py-0.5 px-2 border-black">:</td>
                <td class="border-2 py-0.5 px-2 border-black" v-if="props.number">{{ props.number }}</td>
                <td class="border-2 py-0.5 px-2 border-black" v-else> - </td>
            </tr>
            <tr>
                <td class="font-bold border-2 py-0.5 px-2 border-black">TANGGAL PEMBUATAN</td>
                <td class="border-2 py-0.5 px-2 border-black">:</td>
                <td class="border-2 py-0.5 px-2 border-black" v-if="props.createdDate">{{ props.createdDate }}</td>
                <td class="border-2 py-0.5 px-2 border-black" v-else> - </td>
            </tr>
            <tr>
                <td class="font-bold border-2 py-0.5 px-2 border-black">TANGGAL REVISI</td>
                <td class="border-2 py-0.5 px-2 border-black">:</td>
                <td class="border-2 py-0.5 px-2 border-black" v-if="props.revisionDate">{{ props.revisionDate }}</td>
                <td class="border-2 py-0.5 px-2 border-black" v-else> - </td>
            </tr>
            <tr>
                <td class="font-bold border-2 py-0.5 px-2 border-black">TANGGAL EFEKTIF</td>
                <td class="border-2 py-0.5 px-2 border-black">:</td>
                <td class="border-2 py-0.5 px-2 border-black" v-if="props.effectiveDate">{{ props.effectiveDate }}</td>
                <td class="border-2 py-0.5 px-2 border-black" v-else> - </td>
            </tr>
            <tr>
                <td class="font-bold align-top border-2 py-0.5 px-2 border-black">DISAHKAN OLEH</td>
                <td class="align-top border-2 py-0.5 px-2 border-black">:</td>
                <td class="text-center font-bold border-2 py-0.5 px-2 border-black">
                    Ketua Departemen,<br><br><br><br>{{ props.picName }}<br>
                    NIP. {{ props.picNumber }}</td>
            </tr>
            <tr>
                <td class="font-bold border-2 py-0.5 px-2 border-black">NAMA POS</td>
                <td class="border-2 py-0.5 px-2 border-black">:</td>
                <td class="font-bold border-2 py-0.5 px-2 border-black" v-if="props.name">{{ props.name }}</td>
                <td class="border-2 py-0.5 px-2 border-black" v-else> - </td>
            </tr>
            <tr>
                <td class="font-bold align-top border-2 py-0.5 px-2 border-black">SEKSI</td>
                <td class="border-2 py-0.5 px-2 border-black">:</td>
                <td class="border-2 py-0.5 px-2 border-black" v-if="props.section">{{ props.section }}</td>
                <td class="border-2 py-0.5 px-2 border-black" v-else> - </td>
            </tr>
            <!-- ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ -->
            <tr>
                <td class="font-bold border-2 py-0.5 px-2 border-black">DASAR HUKUM</td>
                <td colspan="3" class="font-bold border-2 py-0.5 px-2 border-black">
                    KUALIFIKASI PELAKSANAAN
                </td>
            </tr>
            <tr>
                <td class="align-top border-2 py-0.5 px-2 border-black">
                    <ol class="list-decimal list-outside ml-5">
                        <template v-if="props.lawBasis && props.lawBasis.length > 0">
                            <li v-for="(item, index) in props.lawBasis" :key="index">
                                {{ item }}
                            </li>
                        </template>
                        <p v-else> - </p>
                    </ol>
                </td>
                <td colspan="3" class="align-top border-2 py-0.5 px-2 border-black">
                    <ol class="list-decimal list-outside ml-5">
                        <template v-if="props.implementQualification && props.implementQualification.length > 0">
                            <li v-for="(item, index) in props.implementQualification" :key="index">
                                {{ item }}
                            </li>
                        </template>
                        <p v-else> - </p>
                    </ol>
                </td>
            </tr>
            <tr>
                <td class="font-bold border-2 py-0.5 px-2 border-black">KETERKAITAN DENGAN POS AP LAIN</td>
                <td colspan="3" class="font-bold border-2 py-0.5 px-2 border-black">
                    PERALATAN / PERLENGKAPAN
                </td>
            </tr>
            <tr>
                <td class="align-top border-2 py-0.5 px-2 border-black">
                    <ol class="list-decimal list-outside ml-5">
                        <template v-if="props.relatedSop && props.relatedSop.length > 0">
                            <li v-for="(item, index) in props.relatedSop" :key="index">
                                {{ item }}
                            </li>
                        </template>
                        <p v-else> - </p>
                    </ol>
                </td>
                <td colspan="3" class="align-top border-2 py-0.5 px-2 border-black">
                    <ol class="list-decimal list-outside ml-5 columns-3">
                        <template v-if="props.equipment && props.equipment.length > 0">
                            <li v-for="(item, index) in props.equipment" :key="index">
                                {{ item }}
                            </li>
                        </template>
                        <p v-else> - </p>
                    </ol>
                </td>
            </tr>
            <tr>
                <td class="font-bold border-2 py-0.5 px-2 border-black">PERINGATAN</td>
                <td class="font-bold border-2 py-0.5 px-2 border-black" colspan="3">PENCATATAN DAN PENDATAAN</td>
            </tr>
            <tr>
                <td v-if="props.warning" class="align-top border-2 py-0.5 px-2 border-black">
                    {{ props.warning }}
                </td>
                <td class="border-2 py-0.5 px-2 border-black" v-else> - </td>
                <td colspan="3" class="align-top border-2 py-0.5 px-2 border-black">
                    <ol class="list-decimal list-outside ml-5 columns-3">
                        <template v-if="props.recordData && props.recordData.length > 0">
                            <li v-for="(item, index) in props.recordData" :key="index">
                                {{ item }}
                            </li>
                        </template>
                        <p v-else> - </p>
                    </ol>
                </td>
            </tr>
        </tbody>
    </table>

    <!-- Tabel Kedua -->
    <div class="relative w-11/12 mx-auto mb-10 min-h-[200px]" id="sop-container">
      <table class="w-full border-collapse border-2 border-black">
        <tbody>
            <tr class="bg-[#D9D9D9]">
                <th rowspan="2" class="border-2 py-0.5 px-2 border-black">NO</th>
                <th rowspan="2" class="border-2 py-0.5 px-2 border-black">KEGIATAN</th>
                <th :colspan="implementer.length" class="border-2 py-0.5 px-2 border-black">PELAKSANA</th>
                <th colspan="3" class="border-2 py-0.5 px-2 border-black">MUTU BAKU</th>
                <th rowspan="2" class="border-2 py-0.5 px-2 border-black">KET</th>
            </tr>
            <tr class="bg-[#D9D9D9]">
                <th v-for="impl in props.implementer" class="border-2 py-0.5 px-2 border-black">{{ impl.toUpperCase() }}</th>
                <th class="border-2 py-0.5 px-2 border-black">KELENGKAPAN</th>
                <th class="border-2 py-0.5 px-2 border-black">WAKTU</th>
                <th class="border-2 py-0.5 px-2 border-black">OUTPUT</th>
            </tr>

            <tr v-for="step in steps" :key="step.id"> 
                <td class="border-2 border-black py-0.5 px-2">{{ step.sequential_number }}</td>
                <td class="border-2 border-black py-0.5 px-2">{{ step.activity }}</td>
                <td v-for="impl in props.implementer" :key="impl" class="border-2 border-black p-5"> <!-- Tambahkan padding di sini -->
                    <div v-if="step.implementer === impl" :id="`step-${step.sequential_number}`">
                        <component :is="getShapeComponent(step.type)" class="relative z-10 flex justify-center items-center" />
                    </div>
                </td>
                <td class="border-2 border-black py-0.5 px-2">{{ step.fittings }}</td>
                <td class="border-2 border-black py-0.5 px-2">{{ step.time }}</td>
                <td class="border-2 border-black py-0.5 px-2">{{ step.output }}</td>
                <td class="border-2 border-black py-0.5 px-2">{{ step.description }}</td>
            </tr>
        </tbody>
      </table>

      <!-- Perbaiki SVG container -->
      <svg class="absolute inset-0 w-full h-full pointer-events-none z-0">
        <arrow-connector
          v-for="connection in connections" 
          :key="`${connection.from}-${connection.to}`"
          :connection="connection"
          @mounted="handleArrowMounted"
        />
      </svg>
    </div>
  </div>
</template>
