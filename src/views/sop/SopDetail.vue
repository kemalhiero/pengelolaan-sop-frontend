<script setup>
import { inject, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useSopData } from '@/composables/useSopData';

import SopDocTemplate from '@/components/sop/SopDocTemplate.vue';
import SopBpmnTemplate from '@/components/sop/SopBpmnTemplate.vue';
import IconDownload from '@/assets/icons/DownloadIcon.vue';

const layoutType = inject('layoutType');
layoutType.value = 'guest';

const route = useRoute();
const authStore = useAuthStore();

const { sopData, signer, fetchSopVersion, fetchInfoSop, fetchSopStep, fetchSigner } = useSopData(route.params.id);

const activeTab = ref('document');
const cdnUrl = import.meta.env.VITE_CDN_URL; // URL untuk CDN

onMounted(async () => {
    await fetchSopVersion();
    await fetchInfoSop();
    await fetchSopStep();
    await fetchSigner(sopData.value.signer_id);
});
</script>

<template>
    <div class="container mx-auto">
        <h2 class="text-4xl text-center my-12 font-bold">SOP Pendaftaran Kerja Praktik</h2>

        <!-- Tab Buttons -->
        <div class="flex justify-center mb-6">
            <div class="inline-flex rounded-md shadow-sm" role="group">
            <button 
                @click="activeTab = 'document'" 
                type="button" 
                class="px-4 py-2 text-sm font-medium bg-white border-2 rounded-l-lg hover:bg-gray-200 focus:z-10 focus:ring-2 focus:ring-blue-700"
                :class="activeTab === 'document' ? 'text-blue-700 border-blue-700' : 'text-gray-900 border-gray-200 hover:text-blue-700'"
            >
                Dokumen SOP
            </button>
            <button 
                @click="activeTab = 'bpmn'" 
                type="button" 
                class="px-4 py-2 text-sm font-medium bg-white border-2 rounded-r-lg hover:bg-gray-200 focus:z-10 focus:ring-2 focus:ring-blue-700"
                :class="activeTab === 'bpmn' ? 'text-blue-700 border-blue-700' : 'text-gray-900 border-gray-200 hover:text-blue-700'"
            >
                Diagram BPMN
            </button>
            </div>
        </div>

        <!-- SOP Document Tab -->
        <div v-if="activeTab === 'document'">
            <SopDocTemplate 
                :name="sopData.name" :number="sopData.number"
                :pic-name="signer.name" :pic-number="signer.id_number"
                created-date="-" :revision-date="sopData.revision_date" :effective-date="sopData.effective_date"
                :section="sopData.section" :warning="sopData.warning"
                :law-basis="sopData.legalBasis.map(item => item.legal)"
                :implement-qualification="sopData.implementQualification.map(item => item.qualification)" 
                :related-sop="sopData.relatedSop.map(item => item.related_sop)"
                :equipment="sopData.equipment.map(item => item.equipment)" 
                :record-data="sopData.record.map(item => item.data_record)"
                :implementer="sopData.implementer" :steps="sopData.steps" 
                :signature="`${cdnUrl}/${sopData.signature_url}`"
            /> 
        </div>

        <!-- BPMN Diagram Tab -->
        <div v-else-if="activeTab === 'bpmn'">
            <SopBpmnTemplate
                v-if="sopData.steps && sopData.steps.length > 0 && sopData.implementer && sopData.implementer.length > 0"
                :name="sopData.name" 
                :steps="sopData.steps || []" 
                :implementer="sopData.implementer || []" 
            />
            <div v-else class="my-4 p-4 bg-gray-100 rounded text-center">
                Belum ada tahapan yang diinputkan oleh penyusun!
            </div>
        </div>

        <div class="flex flex-col lg:flex-row max-w-screen-lg mx-auto my-12 space-y-6 lg:space-y-0 lg:space-x-8">
            <!-- Bagian Kiri: Tombol -->
            <div class="w-full lg:w-1/3 p-6 flex flex-col space-y-4">
                <h2 class="text-lg font-semibold mb-4">Simpan Dokumen</h2>
                <button
                    class="text-white bg-[#2557D6] hover:bg-[#2557D6]/90 focus:ring-4 focus:ring-[#2557D6]/50 focus:outline-none font-medium rounded-lg text-base py-3 px-6 flex items-center justify-center">
                    <IconDownload class="w-5 mr-3 fill-current" />
                    Unduh SOP
                </button>
                <button
                    class="text-white bg-[#2557D6] hover:bg-[#2557D6]/90 focus:ring-4 focus:ring-[#2557D6]/50 focus:outline-none font-medium rounded-lg text-base py-3 px-6 flex items-center justify-center">
                    <IconDownload class="w-5 mr-3 fill-current" />
                    Unduh BPMN
                </button>
            </div>

            <!-- Garis Pemisah -->
            <div class="hidden lg:block w-0.5 rounded-3xl bg-gray-400"></div>

            <!-- Bagian Kanan: Form dengan Overlay Login -->
            <div class="w-full lg:w-2/3 relative">
                <!-- Form Container -->
                <form class="w-full bg-white p-6 space-y-5" :class="{ 'blur-sm pointer-events-none': !authStore.isAuthenticated }" >
                    <h2 class="text-lg font-semibold mb-4">Form Umpan Balik</h2>
                    <div>
                        <label for="judul" class="block mb-2 text-sm font-medium">Judul</label>
                        <input type="text" id="judul" 
                            class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" 
                            placeholder="Contoh: Saran Proses Pengajuan KP" required />
                    </div>
                    <div>
                        <label for="message" class="block mb-2 text-sm font-medium">Kritik/Saran</label>
                        <textarea id="message" rows="4" 
                            class="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500" 
                            placeholder="Ketikkan kritik atau saran Anda..."></textarea>
                    </div>
                    <button type="submit" 
                        class="w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5">
                        Submit
                    </button>
                </form>

                <!-- Overlay Login -->
                <div 
                    v-if="!authStore.isAuthenticated"
                    class="absolute inset-0 flex items-center justify-center bg-gray-700/20 rounded-xl"
                >
                    <div class="bg-white p-6 rounded-lg shadow-lg text-center">
                        <h3 class="text-lg font-semibold mb-4">Silakan Login</h3>
                        <p class="text-gray-600 mb-4">Anda harus login terlebih dahulu untuk memberikan umpan balik</p>
                        <RouterLink to="/login">
                            <button class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-6 py-2.5">
                                Login
                            </button>
                        </RouterLink>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

