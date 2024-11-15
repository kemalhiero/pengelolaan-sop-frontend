<script setup>
import StartEnd from '@/assets/flowchart/StartEnd.vue';
import Process from '@/assets/flowchart/Process.vue';
import Decision from '@/assets/flowchart/Decision.vue';
import OffPageConnector from '@/assets/flowchart/OffPageConnector.vue';
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
                <td>T/__/UN16.17.02/OT.01.00/2023</td>
            </tr>
            <tr>
                <td class="font-bold">TANGGAL PEMBUATAN</td>
                <td>:</td>
                <td>18 Agustus 2023</td>
            </tr>
            <tr>
                <td class="font-bold">TANGGAL REVISI</td>
                <td>:</td>
                <td></td>
            </tr>
            <tr>
                <td class="font-bold">TANGGAL EFEKTIF</td>
                <td>:</td>
                <td>23 Januari 2023</td>
            </tr>
            <tr>
                <td class="font-bold align-top">DISAHKAN OLEH</td>
                <td class="align-top">:</td>
                <td class="text-center font-bold">Ketua Departemen,<br><br><br><br>Husnil Kamil, MT<br>NIP. 198201182008121002</td>
            </tr>
            <tr>
                <td class="font-bold">NAMA POS</td>
                <td>:</td>
                <td class="font-bold">Prosedur Pendaftaran Kerja Praktik</td>
            </tr>
            <tr>
                <td class="font-bold align-top">SEKSI</td>
                <td>:</td>
                <td>Semua Seksi di Lingkungan Departemen Sistem Informasi</td>
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
                        <li>
                            Peraturan Pemerintah Nomor 95 Tahun 2021 tentang Perguruan Tinggi Negeri Badan Hukum Universitas Andalas
                        </li>
                        <li>
                            Peraturan Rektor Universitas Andalas Nomor 8 Tahun 2022 tentang Organisasi dan Tata Kerja Organ Pengelola Universitas Andalas
                        </li>
                    </ol>
                </td>
                <td colspan="3" class="align-top">
                    <ol class="list-decimal list-outside ml-5">
                        <li>Memiliki Kemampuan pengolahan data sederhana</li>
                        <li>Mengetahui tugas dan fungsi POS AP</li>
                        <li>Menguasai operasional komputer</li>
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
                        <li>POS AP Pelaksanaan KP</li>
                        <li>POS AP Pembatalan KP</li>
                    </ol> 
                </td>
                <td colspan="3" class="align-top">
                    <ol class="list-decimal list-outside ml-5 columns-3">
                        <li>Komputer</li>
                        <li>Printer</li>
                        <li>Hardisk External / Flasdisk</li>
                        <li>Dokumen OTK</li>
                    </ol>
                </td>
            </tr>
            <tr>
                <td class="font-bold">PERINGATAN</td>
                <td class="font-bold" colspan="3">PENCATATAN DAN PENDATAAN</td>
            </tr>
            <tr>
                <td class="align-top">
                    Jika POS AP ini tidak dilaksanakan, mengakibatkan terhambatnya proses
                    kerja praktik mahasiswa.
                </td>
                <td colspan="3" class="align-top">
                    <ol class="list-decimal list-outside ml-5 columns-3">
                        <li>Dokumen</li>
                        <li>Pengarsipan</li>
                        <li>Surat/disposisi;</li>
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
                    <StartEnd/>
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
                    <Decision/>
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
                <td> <Process/> </td>
                <td>Disposisi</td>
                <td>15 menit</td>
                <td>Surat permohonan KP</td>
                <td>Lorem ipsum dolor sit amet, consectetur adipisicing.</td>
            </tr>
            <tr>
                <td>4</td>
                <td>Konfirmasi surat permohonan KP oleh perusahaan</td>
                <td></td>
                <td> <OffPageConnector class="mx-auto"/> </td>
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
