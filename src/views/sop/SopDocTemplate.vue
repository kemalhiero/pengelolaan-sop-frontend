<script setup>
import StartEnd from '@/assets/flowchart/StartEnd.vue';
import Process from '@/assets/flowchart/Process.vue';
import Decision from '@/assets/flowchart/Decision.vue';
import OffPageConnector from '@/assets/flowchart/OffPageConnector.vue';

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
    organization: {
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

})
</script>

<template>
    <table class="w-11/12 mx-auto my-8">
        <tbody>
            <tr>
                <th rowspan="8" class="w-[47%]">
                    <img class="mx-auto h-36 my-4" src="/logo_unand_kecil.png"
                        alt="Logo Kementerian Pendidikan Kebudayaan, Riset dan Teknologi">
                    <h4>KEMENTERIAN PENDIDIKAN TINGGI, SAINS, DAN TEKNOLOGI</h4>
                    <h4>UNIVERSITAS ANDALAS </h4>
                    <h4>FAKULTAS TEKNOLOGI INFORMASI</h4>
                    <h4 class="font-[450]">DEPARTEMEN SISTEM INFORMASI</h4>
                </th>
            </tr>
            <tr>
                <td class="font-bold">NOMOR POS</td>
                <td>:</td>
                <td v-if="props.number">{{ props.number }}</td>
                <td v-else> - </td>
            </tr>
            <tr>
                <td class="font-bold">TANGGAL PEMBUATAN</td>
                <td>:</td>
                <td v-if="props.createdDate">{{ props.createdDate }}</td>
                <td v-else> - </td>
            </tr>
            <tr>
                <td class="font-bold">TANGGAL REVISI</td>
                <td>:</td>
                <td v-if="props.revisionDate">{{ props.revisionDate }}</td>
                <td v-else> - </td>
            </tr>
            <tr>
                <td class="font-bold">TANGGAL EFEKTIF</td>
                <td>:</td>
                <td v-if="props.effectiveDate">{{ props.effectiveDate }}</td>
                <td v-else> - </td>
            </tr>
            <tr>
                <td class="font-bold align-top">DISAHKAN OLEH</td>
                <td class="align-top">:</td>
                <td class="text-center font-bold">
                    Ketua Departemen,<br><br><br><br>{{ props.picName }}<br>
                    NIP. {{ props.picNumber }}</td>
            </tr>
            <tr>
                <td class="font-bold">NAMA POS</td>
                <td>:</td>
                <td v-if="props.name" class="font-bold">{{ props.name }}</td>
                <td v-else> - </td>
            </tr>
            <tr>
                <td class="font-bold align-top">SEKSI</td>
                <td>:</td>
                <td v-if="props.section">{{ props.section }}</td>
                <td v-else> - </td>
            </tr>
            <!-- ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ -->
            <tr>
                <td class="font-bold">DASAR HUKUM</td>
                <td colspan="3" class="font-bold">
                    KUALIFIKASI PELAKSANAAN
                </td>
            </tr>
            <tr>
                <td class="align-top">
                    <ol class="list-decimal list-outside ml-5">
                        <template v-if="props.lawBasis && props.lawBasis.length > 0">
                            <li v-for="(item, index) in props.lawBasis" :key="index">
                                {{ item }}
                            </li>
                        </template>
                        <p v-else> - </p>
                    </ol>
                </td>
                <td colspan="3" class="align-top">
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
                <td class="font-bold">KETERKAITAN DENGAN POS AP LAIN</td>
                <td colspan="3" class="font-bold">
                    PERALATAN / PERLENGKAPAN
                </td>
            </tr>
            <tr>
                <td class="align-top">
                    <ol class="list-decimal list-outside ml-5">
                        <template v-if="props.relatedSop && props.relatedSop.length > 0">
                            <li v-for="(item, index) in props.relatedSop" :key="index">
                                {{ item }}
                            </li>
                        </template>
                        <p v-else> - </p>
                    </ol>
                </td>
                <td colspan="3" class="align-top">
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
                <td class="font-bold">PERINGATAN</td>
                <td class="font-bold" colspan="3">PENCATATAN DAN PENDATAAN</td>
            </tr>
            <tr>
                <td v-if="props.warning" class="align-top">
                    {{ props.warning }}
                </td>
                <td v-else> - </td>
                <td colspan="3" class="align-top">
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

    <table class="w-11/12 mx-auto mb-10">
        <tbody>
            <tr class="bg-[#D9D9D9]">
                <th rowspan="2">NO</th>
                <th rowspan="2">KEGIATAN</th>
                <th colspan="3">PELAKSANA</th> <!-- jumlah colspan tergantung jumlah aktor -->
                <th colspan="3">MUTU BAKU</th>
                <th rowspan="2">KET</th>
            </tr>
            <tr class="bg-[#D9D9D9]">
                <th>MAHASISWA</th>
                <th>DEPARTEMEN</th>
                <th>PERUSAHAAN</th>
                <th>KELENGKAPAN</th>
                <th>WAKTU</th>
                <th>OUTPUT</th>
            </tr>
            <tr>
                <td>1</td>
                <td>Mengisi formulir permohonan KP</td>
                <td>
                    <StartEnd />
                </td>
                <td></td>
                <td></td>
                <td>Formulir permohonan KP, transkrip nilai, proposal KP</td>
                <td>5 menit</td>
                <td>Penyerahan kelengkapan ke pihak departemen</td>
                <td></td>
            </tr>
            <tr>
                <td>2</td>
                <td>Peninjauan permohonan KP</td>
                <td></td>
                <td>
                    <Decision />
                </td>
                <td></td>
                <td>Formulir permohonan KP, transkrip nilai, proposal KP</td>
                <td>1 hari</td>
                <td>Disposisi</td>
                <td></td>
            </tr>
            <tr>
                <td>3</td>
                <td>Surat permohonan KP</td>
                <td></td>
                <td></td>
                <td>
                    <Process />
                </td>
                <td>Disposisi</td>
                <td>15 menit</td>
                <td>Surat permohonan KP</td>
                <td>Lorem ipsum dolor sit amet, consectetur adipisicing.</td>
            </tr>
            <tr>
                <td>4</td>
                <td>Konfirmasi surat permohonan KP oleh perusahaan</td>
                <td></td>
                <td>
                    <OffPageConnector class="mx-auto" />
                </td>
                <td></td>
                <td>Disposisi</td>
                <td>3 Hari</td>
                <td>Surat balasan dari perusahaan</td>
                <td></td>
            </tr>
            <tr>
                <td>5</td>
                <td>Menerima surat konfirmasi permohonan KP </td>
                <td></td>
                <td></td>
                <td></td>
                <td>Surat balasan dari perusahaan</td>
                <td>5 Menit</td>
                <td>Disposisi</td>
                <td></td>
            </tr>
        </tbody>
    </table>

</template>

<style scoped>
th,
td {
    padding-top: 2px;
    padding-bottom: 2px;
    padding-left: 8px;
    padding-right: 8px;
    border: 2px solid black;
}
</style>
