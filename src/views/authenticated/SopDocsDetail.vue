<script setup>
import { inject, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router'
import { getOneSop } from '@/api/sopApi';
import getStatus from '@/utils/getStatus';

import CirclePlusIcon from '@/assets/icons/CirclePlusIcon.vue';
import UpRightFromSquareIcon from '@/assets/icons/UpRightFromSquareIcon.vue';
import XMarkCloseIcon from '@/assets/icons/XMarkCloseIcon.vue';
import PulseLoading from '@/components/PulseLoading.vue';
import DataTable from '@/components/DataTable.vue';
import Error from '@/components/Error.vue';

const layoutType = inject('layoutType');
layoutType.value = 'admin';

const route = useRoute();
const showDetailModal = ref(false);

const sopData = ref();
const fetchData = async () => {
  try {
    const response = await getOneSop(route.params.id);
    sopData.value = response.data;
  } catch (error) {
    console.error('Fetch error:', error);
  }
};

const selectedVersion = ref(null);
const handleRowClick = (id) => {
  // Cari versi SOP yang sesuai dengan id_sop_detail
  const selectedData = sopData.value.version.find(
    (version) => version.id === id
  );
  selectedVersion.value = selectedData;
  showDetailModal.value = true;
};
const closeModal = () => {
  showDetailModal.value = false;
  selectedVersion.value = null;
};

onMounted(() => {
  fetchData();
});

</script>

<template>
  <main class="p-4 md:ml-64 h-auto pt-20 px-10">

    <template v-if="sopData">
      <h2 class="text-4xl text-center my-8 font-bold">SOP {{ sopData.name }}</h2>

      <div class="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-5">
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

      <div v-if="sopData.version" class="my-8">
        <DataTable 
          v-if="sopData.version.length > 0" 
          :data="sopData.version" 
          :columns="[
            { field: 'number', label: 'Nomor POS', sortable: true },
            { field: 'version', label: 'Versi', sortable: true },
            { field: 'revision_date', label: 'Tanggal Revisi', sortable: true },
            { field: 'effective_date', label: 'Tanggal Efektif', sortable: true },
          ]" 
          :searchable="['number', 'version', 'revision_date', 'effective_date']" 
          :status-columns="[
            { field: 'status', label: 'Status' }
          ]" 
          table-type="detail" 
          @click="handleRowClick"
          :badge-text="['Batal', 'Diterima', 'Sedang Proses']" 
        />
        <PulseLoading v-else-if="sopData.version.length == 0" />
      </div>
    </template>
    <PulseLoading v-else />

    <div class="flex justify-center mb-8">
      <router-link :to="`/app/propose-version/${route.params.id}`">
        <button title="buat sop dengan versi terbaru"
          class="text-white bg-[#2557D6] hover:bg-[#2557D6]/90 focus:ring-4 focus:ring-[#2557D6]/50 focus:outline-none font-medium rounded-lg text-sm py-2 px-3 text-center inline-flex items-center">
          <CirclePlusIcon class="w-5 mr-3 fill-current" />
          Perbarui versi SOP
        </button>
      </router-link>
    </div>

  </main>

  <div v-show="showDetailModal" class="fixed inset-0 z-50 flex items-center justify-center w-full h-full">

    <div class="fixed inset-0 bg-gray-800 bg-opacity-30" @click="closeModal"></div>

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
            @click="closeModal">
            <XMarkCloseIcon class="w-3 h-3" />
            <span class="sr-only">Tutup modal</span>
          </button>
        </div>
        
        <!-- Modal body -->
        <div class="p-4 md:p-5 space-y-4 max-h-[620px] overflow-y-auto">
          <div class="grid gap-4 mb-4 grid-cols-2" v-if="selectedVersion">
            <div class="col-span-2">
              <label for="warning" class="block mb-2 text-sm font-medium text-gray-900">Peringatan</label>
              <textarea 
                id="warning" 
                rows="3"
                class="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                readonly
                v-model="selectedVersion.warning"
                placeholder="belum ada data"
              ></textarea>
            </div>
            <div class="col-span-2">
              <label for="section" class="block mb-2 text-sm font-medium text-gray-900">Seksi</label>
              <input 
                type="text" 
                id="section"
                class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                v-model="selectedVersion.section"
                placeholder="belum ada data"
                readonly
              >
            </div>
            <div class="col-span-2">
              <label for="description" class="block mb-2 text-sm font-medium text-gray-900">Deskripsi</label>
              <textarea 
                id="description" 
                rows="4"
                class="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                readonly
                v-model="selectedVersion.description"
                placeholder="belum ada data"
              ></textarea>
            </div>
            <div class="col-span-2">
              <label class="block mb-2 text-sm font-medium text-gray-900">Penyusun</label>
              <ul class="max-w-2xl space-y-1 list-disc list-inside columns-2">
                <li v-if="selectedVersion.users.length > 0" v-for="drafter in selectedVersion.users" :key="drafter" class="text-sm">
                  {{ drafter.identity_number }} - {{ drafter.name }}
                </li>
                <li v-else class="italic text-gray-400 text-sm"> belum ada data </li>
              </ul>
            </div>
            <div class="col-span-2">
              <label for="position" class="block mb-2 text-sm font-medium text-gray-900">Posisi Penanggung Jawab</label>
              <input 
                type="text" 
                id="position"
                class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                v-model="selectedVersion.pic_position"
                placeholder="belum ada data"
                readonly
              >
            </div>
          </div>
        </div>
        <!-- Modal footer -->
        <div class="flex items-center p-4 md:p-5 space-x-3 rtl:space-x-reverse border-t border-gray-200 rounded-b">
          <button type="button"
            class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center">
            Lihat Versi Lengkap
            <UpRightFromSquareIcon class="w-4 ml-2 fill-current" />
          </button>
          <button type="button"
            class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center disabled:cursor-not-allowed disabled:bg-opacity-60">
            Lihat Progres Terkini
          </button>
        </div>
      </div>
    </div>

  </div>
</template>
