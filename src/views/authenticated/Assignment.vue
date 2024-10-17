<script setup>
    import { onMounted } from "vue";
    import { DataTable } from "simple-datatables";
    import IconSort from "@/components/icons/IconSort.vue";
    import IconEye from "@/components/icons/IconEye.vue";


    const data = [
        { nama: 'SOP Keuangan LEA', tanggal: '2024/25/09', organisasi: 'Labor', penugas: 'Adi Arga Arifnur', status: 'Selesai' },
        { nama: 'SOP Pendaftaran Kerja Praktik', tanggal: '2024/03/09', organisasi: 'Departemen', penugas: 'Husnil Kamil', status: 'Belum Selesai' },
    ]

    onMounted(() => {
        if (document.getElementById("assignment-table") && typeof DataTable !== 'undefined') {
            new DataTable(document.getElementById("assignment-table"), {
                searchable: true, 
                sortable: true,
            });
        }
    })
</script>

<template>

    <div class="text-center mt-16 mb-8 mx-12 lg:mx-40">
        <h1
            class="mb-4 text-3xl font-extrabold leading-none tracking-tight text-gray-900 md:text-4xl lg:text-5xl dark:text-white">
            Penugasan Pembuatan / Revisi SOP</h1>
        <p class="text-lg font-normal lg:text-xl sm:px-16 xl:px-48">
            Berikut merupakan daftar tugas yang diberikan oleh penanggung jawab organisasi di lingkungan Departemen Sistem Informasi Universitas Andalas.
        </p>
    </div>

    <div class="container mx-auto p-8 lg:px-32">    

        <table id="assignment-table" class="mx-auto">
            <thead>
                <tr>
                    <th>
                        <span class="flex items-center">
                            Nama
                            <IconSort/>
                        </span>
                    </th>
                    <th data-type="date" data-format="YYYY/DD/MM">
                        <span class="flex items-center">
                            Tanggal
                            <IconSort/>
                        </span>
                    </th>
                    <th>
                        <span class="flex items-center">
                            Organisasi
                            <IconSort/>
                        </span>
                    </th>
                    <th>
                        <span class="flex items-center">
                            Penugas
                            <IconSort/>
                        </span>
                    </th>
                    <th>
                        <span class="flex items-center">
                            Status
                            <IconSort/>
                        </span>
                    </th>
                    <th>
                        <span class="flex items-center">
                            Aksi
                        </span>
                    </th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(item, index) in data" :key="index">
                    <td class="font-medium text-gray-900 whitespace-nowrap dark:text-white">{{ item.nama }}</td>
                    <td>{{ item.tanggal }}</td>
                    <td>{{ item.organisasi }}</td>
                    <td>{{ item.penugas }}</td>
                    <td>{{ item.status }}</td>
                    <td>
                        <router-link to="/assignment/detail">
                            <button class="text-white bg-[#2557D6] hover:bg-[#2557D6]/90 focus:ring-4 focus:ring-[#2557D6]/50 focus:outline-none font-medium rounded-lg text-sm py-2 px-3 text-center inline-flex items-center dark:focus:ring-[#2557D6]/50 me-2 mb-2" title="Lihat detail tugas">
                                <IconEye class="w-5 mr-3 fill-current"/>
                                Lihat
                            </button>
                        </router-link>
                    </td>
                </tr>
            </tbody>
        </table>

    </div>

</template>
