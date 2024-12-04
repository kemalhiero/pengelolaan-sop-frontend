<script setup>
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router'
import { getOneSop } from '@/api/sopApi';
import getStatus from '@/utils/getStatus';

import CirclePlusIcon from '@/assets/icons/CirclePlusIcon.vue';
import UpRightFromSquareIcon from '@/assets/icons/UpRightFromSquareIcon.vue';
import XMarkCloseIcon from '@/assets/icons/XMarkCloseIcon.vue';
import PulseLoading from '@/components/PulseLoading.vue';
import DataTable from '@/components/DataTable.vue';
import Error from '@/components/Error.vue';

const route = useRoute();
const showDetailModal = ref(false);

const data = [
  { id: 1, number: 'T/020/UN16.17.02/OT.01.00/2022', version: 1, tanggal_revisi: '12/9/2023', tanggal_efektif: '1/1/2024', status: 0 },
  { id: 2, number: 'T/021/UN16.17.02/OT.01.00/2022', version: 2, tanggal_revisi: '12/9/2024', tanggal_efektif: '1/1/2025', status: 1 },
  { id: 3, number: 'T/022/UN16.17.02/OT.01.00/2023', version: 3, tanggal_revisi: '-', tanggal_efektif: '-', status: 2 },
];

const sopData = ref();
const fetchData = async () => {
    try {
        const response = await getOneSop(route.params.id);
        sopData.value = response.data;
    } catch (error) {
        console.error('Fetch error:', error);
    }
};

onMounted(() => {
  fetchData();
  console.log(sopData.value);
  
});

</script>

<template>
  <main class="p-4 md:ml-64 h-auto pt-20 px-10">

    <h2 class="text-4xl text-center my-8 font-bold">SOP Pendaftaran Kerja Praktik</h2>

    <div v-if="sopData" class="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-5">
      <div class="bg-gray-200 p-5 rounded-xl shadow-md">
        <h4 class="mb-2.5 text-lg">Organisasi</h4>
        <h5 class="text-lg font-bold">
          {{ sopData.organization }}
        </h5>
      </div>
      <div class="bg-gray-200 p-5 rounded-xl shadow-md">
        <h4 class="mb-2.5 text-lg">Tanggal Pembuatan</h4>
        <h5 class="text-xl font-bold">
          {{ sopData.creation_date }}
        </h5>
      </div>
      <div class="bg-gray-200 p-5 rounded-xl shadow-md">
        <h4 class="mb-2.5 text-lg">Status</h4>
        <h5 class="text-xl font-bold">
          {{ getStatus(sopData.is_active) }}
        </h5>
      </div>
    </div>
    <PulseLoading v-else />

    <div v-if="data" class="my-8">
        <DataTable v-if="data.length > 0" 
            :data="data"
            :columns="[
                { field: 'number', label: 'Nomor POS', sortable: true },
                { field: 'version', label: 'Versi', sortable: true },
                { field: 'tanggal_revisi', label: 'Tanggal Revisi', sortable: true },
                { field: 'tanggal_efektif', label: 'Tanggal Efektif', sortable: true },
            ]"
            :status-columns="[
                { field: 'status', label: 'Status' }
            ]"
            :searchable="['number', 'version', 'tanggal_revisi', 'tanggal_efektif']"
            table-type="detail"
            @click="showDetailModal = true"
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

  <div v-show="showDetailModal" class="fixed inset-0 z-50 flex items-center justify-center w-full h-full">

    <div class="fixed inset-0 bg-gray-800 bg-opacity-30" @click="showDetailModal = false"></div>

    <div class="relative w-full max-w-2xl max-h-full">
        <!-- Modal content -->
        <div class="relative bg-white rounded-lg shadow">
            <!-- Modal header -->
            <div class="flex items-center justify-between p-4 md:p-5 border-b rounded-t">
                <h3 class="text-xl font-medium text-gray-900">
                    Detail versi SOP
                </h3>
                <button type="button"
                    class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center"
                    @click="showDetailModal = false">
                    <XMarkCloseIcon class="w-3 h-3" />
                    <span class="sr-only">Tutup modal</span>
                </button>
            </div>
            <!-- Modal body -->
            <div class="p-4 md:p-5 space-y-4 max-h-[620px] overflow-y-auto">
              <div class="grid gap-4 mb-4 grid-cols-2">
                  <div class="col-span-2">
                      <label for="description" class="block mb-2 text-sm font-medium text-gray-900">Peringatan</label>
                      <textarea id="description" rows="3" class="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500" readonly>Jika POS AP ini tidak dilaksanakan, mengakibatkan terhambatnya proses kerja praktik mahasiswa.</textarea>                    
                  </div>
                  <div class="col-span-2">
                      <label for="name" class="block mb-2 text-sm font-medium text-gray-900">Seksi</label>
                      <input type="text" name="name" id="name" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5" value="Semua seksi di lingkungan labor" readonly>
                  </div>
                  <div class="col-span-2">
                      <label for="description" class="block mb-2 text-sm font-medium text-gray-900">Deskripsi</label>
                      <textarea id="description" rows="4" class="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500">Lorem ipsum dolor sit amet consectetur adipisicing elit. Doloribus animi deserunt cum laborum voluptate praesentium.</textarea>                    
                  </div>
                  <div class="col-span-2">
                    <label for="description" class="block mb-2 text-sm font-medium text-gray-900">Pelaksana</label>
                    <ul class="max-w-lg space-y-1 list-disc list-inside columns-3">
                        <li>Mahasiswa</li>
                        <li>Dosen</li>
                        <li>Perusahaan</li>
                    </ul>
                  </div>
                  <div class="col-span-2">
                      <label for="name" class="block mb-2 text-sm font-medium text-gray-900">Posisi Penanggung Jawab</label>
                      <input type="text" name="name" id="name" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5" value="Kepala Departemen" readonly>
                  </div>
              </div>
            </div>
            <!-- Modal footer -->
            <div class="flex items-center p-4 md:p-5 space-x-3 rtl:space-x-reverse border-t border-gray-200 rounded-b">
                <button type="button" class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center">
                  Lihat Versi Cetak
                  <UpRightFromSquareIcon class="w-4 ml-2 fill-current" />
                </button>
                <button type="button" class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center disabled:cursor-not-allowed disabled:bg-opacity-60">
                  Lihat Progres Terkini
                </button>
            </div>
        </div>
    </div>

  </div>
</template>
