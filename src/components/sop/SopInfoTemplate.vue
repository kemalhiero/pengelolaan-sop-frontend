<script setup>
const props = defineProps({
    // sop info
    name: {
        type: String,
        required: true
    },
    number: {
        type: String
    },
    version: {
        type: Number,
        default: 1
    },
    createdDate: {
        type: String
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
    picRole: {
        type: String,
        default: 'Penanggung Jawab'
    },
    section: {
        type: String,
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
        type: Array,
        default: []
    },
    equipment: {
        type: Array,
        default: []
    },
    warning: {
        type: String,
        default: '-'
    },
    recordData: {
        type: Array,
        default: []
    },
    signature: {
        type: String,
        default: ''
    }
});
</script>

<template>
    <div class="flex justify-center">
        <div class="px-4 lg:px-0 print:px-0 overflow-x-auto">
            <div class="print-page print-break-after-page w-[calc(297mm-3cm)] min-w-[calc(297mm-3cm)] max-w-[calc(297mm-3cm)] box-border">
                <table class="w-full border-collapse border-2 border-black text-sm">
                    <tbody>
                        <tr>
                            <th rowspan="8" class="w-[47%] border-2 py-0.5 px-2 border-black">
                                <img class="mx-auto h-36 my-4" src="/logo_unand_kecil.png" alt="Logo Kementerian Pendidikan Kebudayaan, Riset dan Teknologi">
                                <h4>KEMENTERIAN PENDIDIKAN TINGGI, SAINS, DAN TEKNOLOGI</h4>
                                <h4>UNIVERSITAS ANDALAS</h4>
                                <h4>FAKULTAS TEKNOLOGI INFORMASI</h4>
                                <h4 class="font-[450]">DEPARTEMEN SISTEM INFORMASI</h4>
                            </th>
                        </tr>
                        <tr>
                            <td class="font-bold border-2 py-0.5 px-2 border-black whitespace-nowrap">NOMOR POS</td>
                            <td class="border-2 py-0.5 px-2 border-black">:</td>
                            <td class="border-2 py-0.5 px-2 border-black">{{ props.number || ' - ' }}</td>
                        </tr>
                        <tr>
                            <td class="font-bold border-2 py-0.5 px-2 border-black whitespace-nowrap">TANGGAL PEMBUATAN</td>
                            <td class="border-2 py-0.5 px-2 border-black">:</td>
                            <td class="border-2 py-0.5 px-2 border-black">{{ props.createdDate || ' - ' }}</td>
                        </tr>
                        <tr>
                            <td class="font-bold border-2 py-0.5 px-2 border-black whitespace-nowrap">TANGGAL REVISI</td>
                            <td class="border-2 py-0.5 px-2 border-black">:</td>
                            <td class="border-2 py-0.5 px-2 border-black">
                                {{ (props.revisionDate && props.version > 1) ? props.revisionDate : ' - ' }}
                            </td>
                        </tr>
                        <tr>
                            <td class="font-bold border-2 py-0.5 px-2 border-black whitespace-nowrap">TANGGAL EFEKTIF</td>
                            <td class="border-2 py-0.5 px-2 border-black">:</td>
                            <td class="border-2 py-0.5 px-2 border-black">{{ props.effectiveDate || ' - ' }}</td>
                        </tr>
                        <tr>
                            <td class="font-bold align-top border-2 py-0.5 px-2 border-black whitespace-nowrap">DISAHKAN OLEH</td>
                            <td class="align-top border-2 py-0.5 px-2 border-black">:</td>
                            <td class="text-center font-bold border-2 py-0.5 px-2 border-black">
                                <p>{{ props.picRole }},</p>
                                <div class="flex justify-center h-24">
                                    <img :src="signature" alt="Tanda Tangan" class="max-w-full" v-if="props.signature" />
                                </div>
                                <p>{{ props.picName }}</p>
                                <p>NIP. {{ props.picNumber }}</p>
                            </td>
                        </tr>
                        <tr>
                            <td class="font-bold align-top border-2 py-0.5 px-2 border-black whitespace-nowrap">NAMA POS</td>
                            <td class="border-2 py-0.5 px-2 border-black">:</td>
                            <td class="font-bold border-2 py-0.5 px-2 border-black">{{ props.name || ' - ' }}</td>
                        </tr>
                        <tr>
                            <td class="font-bold align-top border-2 py-0.5 px-2 border-black">SEKSI</td>
                            <td class="border-2 py-0.5 px-2 border-black">:</td>
                            <td class="border-2 py-0.5 px-2 border-black">{{ props.section || ' - ' }}</td>
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
                                    <template
                                        v-if="props.implementQualification && props.implementQualification.length > 0">
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
                                            {{ item.name }}
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
                            <td class="font-bold border-2 py-0.5 px-2 border-black" colspan="3">PENCATATAN DAN PENDATAAN
                            </td>
                        </tr>
                        <tr>
                            <td v-if="props.warning" class="align-top border-2 py-0.5 px-2 border-black">
                                {{ props.warning }}
                            </td>
                            <td class="border-2 py-0.5 px-2 border-black" v-else> - </td>
                            <td colspan="3" class="align-top border-2 py-0.5 px-2 border-black">
                                <ol class="list-decimal list-outside ml-5 columns-2">
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
            </div>
        </div>
    </div>
</template>

<style scoped>
.print-page {
    margin: 0mm auto; /* Margin atas-bawah/kiri-kanan */
}
.print-page * {
    -webkit-print-color-adjust: exact; /* Untuk mencetak warna */
    print-color-adjust: exact; /* Standard property for compatibility */
}
</style>
