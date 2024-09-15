<template>
    
    <div class="container mx-auto p-8">    
        
        <!-- <h2 class="text-4xl text-center my-6 font-bold dark:text-white">SOP Terpopuler</h2> -->

        <table id="default-table" class="mx-auto">
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
                    <td>
                        <button title="Lihat dokumen">
                            <IconEye class="w-6 mx-4"/>
                        </button>
                        <button title="Unduh dokumen SOP">
                            <IconDownload class="w-6 mx-4"  />
                        </button>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>

</template>

<script setup>

    import { onMounted } from "vue";
    import { DataTable } from "simple-datatables";
    // const dataTable = DataTable("#default-table");
    import IconDownload from "./icons/IconDownload.vue";
    import IconSort from "./icons/IconSort.vue";
    import IconEye from "./icons/IconEye.vue";


    const data = [
        { nama: 'Flowbite', tanggal: '2021/25/09', organisasi: 'Departemen' },
        { nama: 'Vue', tanggal: '2024/25/09', organisasi: 'Labor' },
        { nama: 'React', tanggal: '2024/02/09', organisasi: 'Labor' },
        { nama: 'Vite', tanggal: '2024/01/09', organisasi: 'Departemen' },
        { nama: 'Angular', tanggal: '2024/03/09', organisasi: 'Departemen' },
    ]

    onMounted(() => {
        if (document.getElementById("default-table") && typeof DataTable !== 'undefined') {
            new DataTable(document.getElementById("default-table"), {
                searchable: false, 
                sortable: true,
            });
        }
    })

</script>