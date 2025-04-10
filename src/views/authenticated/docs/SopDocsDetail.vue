<script setup>
import { computed, inject, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router'
import { getOneSop } from '@/api/sopApi';
import { getOrg } from '@/api/orgApi';
import { switchStatusIsActive } from '@/utils/getStatus';
import statusTexts from '@/data/statusTexts.json';
import { useAuthStore } from '@/stores/auth';

import CirclePlusIcon from '@/assets/icons/CirclePlusIcon.vue';
import DataTable from '@/components/DataTable.vue';
import Error from '@/components/Error.vue';
import TableSkeleton from '@/components/TableSkeleton.vue';
import EmptyState from '@/components/EmptyState.vue';
import PageTitle from '@/components/authenticated/PageTitle.vue';
import XMarkCloseIcon from '@/assets/icons/XMarkCloseIcon.vue';
import PenToSquareIcon from '@/assets/icons/PenToSquareIcon.vue';
import TrashCanIcon from '@/assets/icons/TrashCanIcon.vue';
import DeleteDataModal from '@/components/modal/DeleteDataModal.vue';

const layoutType = inject('layoutType');
layoutType.value = 'admin';

const route = useRoute();
const router = useRouter();
const sopData = ref({});
const isLoading = ref(true);
const dataOrganization = ref([]);
const hasError = ref(false);
const authStore = useAuthStore();
const showModal = ref({
  edit: false,
  delete: false,
});

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

const fetchOrg = async () => {
    try {
        const result = await getOrg();
        dataOrganization.value = result.data;
    } catch (error) {
        console.error('Fetch error:', error);
    }
};

const isUpdateDisabled = computed(() => {
  // Periksa apakah ada status 2, 3, 4, 5, 6, atau 7 di dalam array versi SOP
  return sopData.value.version?.some(version => [2, 3, 4, 5, 6, 7].includes(version.status)) || false;
});

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

const redirectToProposeVersion = () => {
  if (isUpdateDisabled.value === false) {
    router.push({
      name: 'SopProposeVersion',
      params: { id: sopData.value.id },
    }).catch((err) => {
      console.error('Navigation error:', err);
    });
  }
};

const deleteData = async (id) => {
    // Implementasi penghapusan data
    console.log('Menghapus data dengan ID:', id);
};

onMounted(async () => {
  await fetchOrg();
  await fetchData();
});

</script>

<template>
  <main class="p-4 md:ml-64 h-auto pt-20 px-10">

    <template v-if="sopData">
      <div class="flex justify-center items-center">
        <PageTitle :judul="`SOP ${sopData.name}`" class="my-8" />
        <div class="space-x-2 ml-3 flex justify-center items-center" v-if="sopData.version">
            <button title="Edit data penugasan" @click="showModal.edit = true"
                class="p-2 text-white w-8 h-8 bg-yellow-400 rounded-full hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:ring-opacity-50">
                <PenToSquareIcon class="fill-current" />
            </button>
            <button title="Hapus" @click="showModal.delete = true" v-if="sopData.version.length <= 1"
                class="p-2 text-white w-8 h-8 bg-red-600 rounded-full hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 flex items-center">
                <TrashCanIcon class="fill-current" />
            </button>
        </div>
      </div>

      <div class="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-5">
        <div class="bg-gray-200 p-5 rounded-xl shadow-md">
          <h4 class="mb-2.5 text-lg">Organisasi</h4>
          <h5 class="text-lg font-bold" v-if="sopData.organization">
            {{ sopData.organization.name }}
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
          :badge-text="statusTexts.sopDetail" 
          :detail-column="true"
          @click="handleRowClick"
        />
      </div>
    </template>
    <Error v-else @click="fetchData"/>

    <div class="flex justify-center mb-8">
        <button :disabled="isUpdateDisabled" @click="redirectToProposeVersion"
          :title="isUpdateDisabled ? 'Tidak dapat memperbarui versi SOP karena ada versi yang sedang diproses' : 'Buat sop dengan versi terbaru'"
          class="text-white bg-[#2557D6] hover:bg-[#2557D6]/90 focus:ring-4 focus:ring-[#2557D6]/50 focus:outline-none font-medium rounded-lg text-sm py-2 px-3 text-center inline-flex items-center disabled:opacity-50 disabled:cursor-not-allowed">
            <CirclePlusIcon class="w-5 mr-3 fill-current" />
            Perbarui versi SOP
        </button>
    </div>

  </main>

  <!-- modal edit -->
  <div class="fixed inset-0 z-50 flex items-center justify-center w-full h-full" v-show="showModal.edit">
    <div class="fixed inset-0 bg-gray-800 bg-opacity-30" @click="showModal.edit = false"></div>
    <div class="relative w-full max-w-2xl max-h-full">
        <div class="relative bg-white rounded-lg shadow">
            <div class="flex items-center justify-between p-4 md:p-5 border-b rounded-t">
                <h3 class="text-xl font-medium text-gray-900">
                    Perbarui Data SOP
                </h3>
                <button type="button"
                    class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center"
                    @click="showModal.edit = false">
                    <XMarkCloseIcon class="w-3 h-3" />
                    <span class="sr-only">Tutup modal</span>
                </button>
            </div>
            <div class="p-4 md:p-5 space-y-4 max-h-[620px] overflow-y-auto">
                <div class="grid gap-4 mb-4 grid-cols-2">
                    <div class="col-span-2">
                        <label for="name" class="block mb-2 text-sm font-medium text-gray-900">Nama</label>
                        <input type="text" id="name"
                            class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                            placeholder="belum ada data" v-model="sopData.name" required />
                    </div>
                    <div class="col-span-2 sm:col-span-1">
                        <label for="org" class="block mb-2 text-sm font-medium text-gray-900">
                            Organisasi
                        </label>
                        <select id="org" required :disabled="authStore.userRole !== 'kadep'" v-if="sopData.organization" v-model="sopData.organization.id"
                            class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5">
                            <option selected disabled value="">Pilih organisasi</option>
                            <option v-for="(item, index) in dataOrganization" :value="item.id" :key="`org-${index}`">
                                {{ item.name }}
                            </option>
                        </select>
                    </div>
                    <div class="col-span-2 sm:col-span-1">
                        <label for="org" class="block mb-2 text-sm font-medium text-gray-900">
                            Status
                        </label>
                        <select id="org" required :disabled="sopData.is_active === 2" v-model="sopData.is_active"
                            class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5">
                            <option selected disabled value="">Pilih Status</option>
                            <option value="0">Tidak Berlaku (kadaluarsa)</option>
                            <option value="1">Berlaku</option>
                            <option value="2">Belum berlaku (masih disusun)</option>
                        </select>
                    </div>
                </div>
            </div>
            <div class="flex items-center p-4 md:p-5 space-x-3 rtl:space-x-reverse border-t border-gray-200 rounded-b">
                <button type="button"
                    class="text-white bg-yellow-400 hover:bg-yellow-500 focus:ring-4 focus:outline-none focus:ring-yellow-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center">
                    Perbarui
                </button>
            </div>
        </div>
    </div>
  </div>

  <!-- modal hapus -->
  <DeleteDataModal 
    :showModal="showModal.delete" 
    :deleteData="deleteData" 
    :selectedId="sopData.id"
    @update:showModal="showModal.delete = $event" 
    text="Anda yakin ingin menghapus SOP ini?" 
  />

</template>
