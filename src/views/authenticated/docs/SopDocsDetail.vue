<script setup>
import { inject, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router'
import { getOneSop } from '@/api/sopApi';
import { switchStatusIsActive } from '@/utils/getStatus';

import CirclePlusIcon from '@/assets/icons/CirclePlusIcon.vue';
import XMarkCloseIcon from '@/assets/icons/XMarkCloseIcon.vue';
import DataTable from '@/components/DataTable.vue';
import Error from '@/components/Error.vue';
import TableSkeleton from '@/components/TableSkeleton.vue';
import EmptyState from '@/components/EmptyState.vue';

const layoutType = inject('layoutType');
layoutType.value = 'admin';

const route = useRoute();
const router = useRouter();
const sopData = ref({});
const isLoading = ref(true);
const hasError = ref(false);

const fetchData = async () => {
  try {
    isLoading.value = true;
    hasError.value = false;
    
    const result = await getOneSop(route.params.id);
    if (!result.success) {
        hasError.value = true;
        console.error('API Error:', result.error);
        return;
    }

    if(result?.data) {
      sopData.value = result.data;
    }
  } catch (error) {
    console.error('Fetch error:', error);
    hasError.value = true;
  } finally {
    isLoading.value = false;
  }
};

const handleRowClick = (id) => {
  router.push({
    name: 'SopDraftDetail',
    params: { id },
  }).catch((err) => {
    if (err.name !== 'NavigationDuplicated') {
      console.error('Navigation error:', err);
    }
  });
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
            {{ switchStatusIsActive(sopData.is_active) }}
          </h5>
        </div>
      </div>

      <div class="my-8">
        <TableSkeleton 
            v-if="isLoading"
            :columns="5"
            :rows="5"
        />
        <Error v-else-if="hasError" @click="fetchData" />
        <EmptyState 
            v-else-if="!hasError && sopData.version.length === 0"
            title="Tidak ada data versi sop!"
            message="Belum ada data versi sop yang tersedia saat ini"
            @click="fetchData"
        />
        <DataTable v-else
          :data="sopData.version" 
          :columns="[
            { field: 'number', label: 'Nomor POS', sortable: true, searchable: true },
            { field: 'version', label: 'Versi', sortable: true, searchable: true },
            { field: 'revision_date', label: 'Tanggal Revisi', sortable: true, searchable: true },
            { field: 'effective_date', label: 'Tanggal Efektif', sortable: true, searchable: true },
          ]" 
          :status-columns="[
            { field: 'status', label: 'Status' }
          ]" 
          :badge-text="[
            'Batal', 
            'Diterima', 
            'Sedang disusun/direview',
          ]" 
          :detail-column="true"
          @click="handleRowClick"
        />
      </div>
    </template>
    <Error v-else @click="fetchData"/>

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

</template>
