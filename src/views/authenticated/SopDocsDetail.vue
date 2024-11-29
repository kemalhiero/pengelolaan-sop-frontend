<script setup>
import CirclePlusIcon from '@/assets/icons/CirclePlusIcon.vue';
import DataTable from '@/components/DataTable.vue';
import Error from '@/components/Error.vue';
import PulseLoading from '@/components/PulseLoading.vue';
import { ref } from 'vue';

const data = [
  { number: 'T/020/UN16.17.02/OT.01.00/2022', version: 1, tanggal_revisi: '12/9/2024', tanggal_efektif: '1/1/2025', status: 0 },
  { number: 'T/020/UN16.17.02/OT.01.00/2022', version: 1, tanggal_revisi: '12/9/2024', tanggal_efektif: '1/1/2025', status: 1 },
  { number: 'T/022/UN16.17.02/OT.01.00/2023', version: 1, tanggal_revisi: '12/9/2024', tanggal_efektif: '1/1/2025', status: 2 },
];

</script>

<template>
  <main class="p-4 md:ml-64 h-auto pt-20 px-10">

    <h2 class="text-4xl text-center my-8 font-bold">SOP Pendaftaran Kerja Praktik</h2>

    <div class="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-5">
      <div class="bg-gray-200 p-5 rounded-xl shadow-md">
        <h4 class="mb-2.5 text-lg">Organisasi</h4>
        <h5 class="text-lg font-bold">
          Laboratory Enterprise Application
        </h5>
      </div>
      <div class="bg-gray-200 p-5 rounded-xl shadow-md">
        <h4 class="mb-2.5 text-lg">Tanggal Pembuatan</h4>
        <h5 class="text-xl font-bold">
          18 Agustus 2023
        </h5>
      </div>
      <div class="bg-gray-200 p-5 rounded-xl shadow-md">
        <h4 class="mb-2.5 text-lg">Status</h4>
        <h5 class="text-xl font-bold">
          Belum Berlaku
        </h5>
      </div>
    </div>

    <div v-if="data" class="my-8">
        <DataTable v-if="data.length > 0" 
            :data="data"
            :columns="[
                { field: 'number', label: 'Nomor', sortable: true },
                { field: 'version', label: 'Versi', sortable: true },
                { field: 'tanggal_revisi', label: 'Tanggal Revisi', sortable: true },
                { field: 'tanggal_efektif', label: 'Tanggal Efektif', sortable: true },
            ]"
            :status-columns="[
                { field: 'status', label: 'Status' }
            ]"
            :searchable="['number', 'version', 'tanggal_revisi', 'tanggal_efektif']"
            table-type="detail"
            :badge-text="['Tidak Berlaku', 'Berlaku', 'Belum Berlaku']"
        />
        <PulseLoading v-else-if="data.length == 0" />
    </div>
    <Error @click="" v-else/>

    <div class="flex justify-center mb-8">
        <router-link :to="{ name: 'SopProposeVersion' }">
            <button title="buat sop dengan versi terbaru"
                class="text-white bg-[#2557D6] hover:bg-[#2557D6]/90 focus:ring-4 focus:ring-[#2557D6]/50 focus:outline-none font-medium rounded-lg text-sm py-2 px-3 text-center inline-flex items-center">
                <CirclePlusIcon class="w-5 mr-3 fill-current" />
                Perbarui versi SOP
            </button>
        </router-link>
    </div>

  </main>
</template>
