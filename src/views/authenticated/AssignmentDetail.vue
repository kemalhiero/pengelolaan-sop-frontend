<script setup>
import { ref } from 'vue';
import CheckIcon from '@/components/icons/CheckIcon.vue';
import NumberOneCircleIcon from '@/components/icons/NumberOneCircleIcon.vue';
import NumberTwoCircleIcon from '@/components/icons/NumberTwoCircleIcon.vue';
import NumberThreeCircleIcon from '@/components/icons/NumberThreeCircleIcon.vue';
import CircleArrowRight from '@/components/icons/CircleArrowRight.vue';
import CircleArrowLeft from '@/components/icons/CircleArrowLeft.vue';
import CirclePlusIcon from '@/components/icons/CirclePlusIcon.vue';
import TrashCanIcon from '@/components/icons/TrashCanIcon.vue';

// State untuk mengatur langkah
const currentStep = ref(1);  // Langkah sekarang
const maxSteps = ref(3);     // Jumlah total langkah

// Fungsi untuk ke langkah berikutnya
const nextStep = () => {
    if (currentStep.value < maxSteps.value) {
        currentStep.value++;
    }
};

// Fungsi untuk ke langkah sebelumnya
const prevStep = () => {
    if (currentStep.value > 1) {
        currentStep.value--;
    }
};

// tahap kedua
// Define an array of steps with default empty values
const steps = ref([
  {
    kegiatan: '',
    mahasiswa: '',
    pelaksana: '',
    tipePelaksana: '',
    perusahaan: '',
    kelengkapan: '',
    mutuBakuWaktu: '',
    output: '',
    keterangan: ''
  }
])

// Function to add a new step (empty object)
const addStep = () => {
  steps.value.push({
    kegiatan: '',
    mahasiswa: '',
    pelaksana: '',
    tipePelaksana: '',
    perusahaan: '',
    kelengkapan: '',
    mutuBakuWaktu: '',
    output: '',
    keterangan: ''
  })
}

// Function to remove a step by index
const removeStep = (index) => {
  steps.value.splice(index, 1)
}

</script>

<template>
    <h2 class="text-4xl text-center my-12 font-bold">Penyusunan Dokumen SOP</h2>

    <!-- stepper -->
    <ol class="flex items-center justify-center w-full text-sm font-medium text-center text-gray-500 sm:text-base max-w-2xl mx-auto">
        <li class="flex md:w-full items-center text-blue-600 sm:after:content-[''] after:w-full after:h-1 after:border-b after:border-gray-400 after:border-1 after:hidden sm:after:inline-block after:mx-6 xl:after:mx-10 hover:cursor-pointer"
            @click="currentStep = 1" title="Informasi mengenai sop yang ditentukan oleh penanggung jawab">
            <span class="flex items-center after:content-['/'] sm:after:hidden after:mx-2 after:text-gray-400">
                <CheckIcon v-if="currentStep > 1"/>
                <NumberOneCircleIcon class="mr-2" v-else-if="currentStep == 1" />
                Informasi
                <span class="hidden sm:inline-flex sm:ms-2">SOP</span>
            </span>
        </li>
        <li class="flex md:w-full items-center after:content-[''] after:w-full after:h-1 after:border-b after:border-gray-400 after:border-1 after:hidden sm:after:inline-block after:mx-6 xl:after:mx-10 hover:cursor-pointer"
            :class="{ 'text-blue-600': currentStep === 2 }"
            @click="currentStep = 2">
            <span class="flex items-center after:content-['/'] sm:after:hidden after:mx-2 after:text-gray-400">
                <span class="me-2" v-if="currentStep < 2">2</span>
                <CheckIcon class="fill-blue-600" v-else-if="currentStep > 2"/>
                <NumberTwoCircleIcon class="mr-2 fill-blue-700" v-else="currentStep == 2" />
                Tahapan <span class="hidden sm:inline-flex sm:ms-2">SOP</span>
            </span>
        </li>
        <li class="flex items-center hover:cursor-pointer"
            :class="{ 'text-blue-600': currentStep === 3 }"
            @click="currentStep = 3">
            <span class="me-2" v-if="currentStep < 3">3</span>
            <NumberThreeCircleIcon class="mr-2 fill-blue-600" v-else-if="currentStep == 3" />
            Konfirmasi
        </li>
    </ol>

    <!-- tampilan data -->
    <div class="my-8 px-6 md:px-0">

        <!-- form tahap pertama -->
        <div v-if="currentStep == 1" class="max-w-2xl mx-auto">
            <div class="mb-4">
                <label for="sop-number" class="block mb-2 text-sm font-medium ">
                    Nama
                </label>
                <input type="text" id="sop-number"
                    class="bg-gray-50 border border-gray-300 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 "
                    value="Pendaftaran Kerja Praktik" readonly />
            </div>
            <div class="grid gap-4 sm:grid-cols-2 sm:gap-5 text-black mb-4">
                <div>
                    <label for="sop-number" class="block mb-2 text-sm font-medium ">
                        Nomor
                    </label>
                    <input type="text" id="sop-number"
                        class="bg-gray-50 border border-gray-300 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 "
                        value="T/001/UN16.17.02/OT.01.00/2024" readonly />
                </div>
                <div>
                    <label for="sop-date" class="block mb-2 text-sm font-medium ">
                        Tanggal
                    </label>
                    <input type="text" id="sop-date"
                        class="bg-gray-50 border border-gray-300 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                        value="11/10/2024" readonly />
                </div>
                <div>
                    <label for="sop-org" class="block mb-2 text-sm font-medium ">
                        Organisasi
                    </label>
                    <input type="text" id="sop-org"
                        class="bg-gray-50 border border-gray-300 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                        value="Departemen Sistem Informasi" readonly />
                </div>
                <div>
                    <label for="sop-pic" class="block mb-2 text-sm font-medium ">
                        Penanggung Jawab
                    </label>
                    <input type="text" id="sop-pic"
                        class="bg-gray-50 border border-gray-300 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                        value="Husnil Kamil" readonly />
                </div>
            </div>
            <div class="mb-5">
                <label for="sop-description" class="block mb-2 text-sm font-medium ">
                    Deskripsi
                </label>
                <textarea id="sop-description"
                    class="bg-gray-50 border border-gray-300 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 h-48">Lorem ipsum dolor sit amet consectetur adipisicing elit. Assumenda incidunt dolores veniam molestias doloribus voluptatem itaque fugiat commodi quibusdam voluptate eveniet quo eligendi, laudantium cupiditate obcaecati quaerat praesentium a labore reiciendis, aut cumque! Exercitationem ea quaerat iure quae dolorem, temporibus perferendis aperiam ducimus nemo dolor harum reiciendis atque? Vitae, ipsum.</textarea>
            </div>
            <div class="grid gap-4 sm:grid-cols-2 sm:gap-6 text-black">
                <div class="mb-5">
                    <h2 class="mb-2 text-sm font-semibold text-gray-900 dark:text-white">Pelaksana:</h2>
                    <ul class="max-w-md space-y-1 list-disc list-inside text-sm">
                        <li>Mahasiswa</li>
                        <li>Departemen</li>
                        <li>Perusahaan</li>
                    </ul>
                </div>
                <div class="mb-5">
                    <h2 class="mb-2 text-sm font-semibold text-gray-900 dark:text-white">User yang ditugaskan:</h2>
                    <ul class="max-w-md space-y-1 list-disc list-inside text-sm">
                        <li>Kemal</li>
                        <li>Kamal</li>
                        <li>Kamil</li>
                    </ul>
                </div>
            </div>

        </div>

        <!-- form tahap kedua -->
        <div v-else-if="currentStep == 2" class="max-w-screen-xl mx-auto px-3 md:px-0">
            <div class="relative overflow-x-auto sm:rounded-lg">
                <table class="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead class="text-xs text-gray-900 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                        <th scope="col" class="px-2 py-3">No</th>
                        <th scope="col" class="px-2 py-3">Kegiatan</th>
                        <th scope="col" class="px-2 py-3">Tipe Kegiatan</th>
                        <th scope="col" class="px-2 py-3">Pelaksana</th>
                        <th scope="col" class="px-2 py-3">Kelengkapan</th>
                        <th scope="col" class="px-2 py-3">Waktu</th>
                        <th scope="col" class="px-2 py-3">Output</th>
                        <th scope="col" class="px-2 py-3">Keterangan</th>
                        <th scope="col" class="px-2 py-3">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(step, index) in steps" :key="index"
                        class="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                            <th scope="row" class="px-2 py-3 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                {{ index + 1 }}
                            </th>
                            <td class="px-2 py-3">
                                <input v-model="step.kegiatan" class="w-full p-2 border border-gray-300 rounded-md" />
                            </td>
                            <td class="px-2 py-3">
                                <select v-model="step.tipePelaksana" class="w-full p-2 border border-gray-300 rounded-md">
                                    <option value="Mahasiswa">Start/End</option>
                                    <option value="Departemen">Task</option>
                                    <option value="Perusahaan">Decision</option>
                                </select>
                            </td>
                            <td class="px-2 py-3">
                                <select v-model="step.pelaksana" class="w-full p-2 border border-gray-300 rounded-md">
                                    <option value="Mahasiswa">Mahasiswa</option>
                                    <option value="Departemen">Departemen</option>
                                    <option value="Perusahaan">Perusahaan</option>
                                </select>
                            </td>
                            <td class="px-2 py-3">
                                <input v-model="step.kelengkapan" class="w-full p-2 border border-gray-300 rounded-md" />
                            </td>
                            <td class="px-2 py-3">
                                <input v-model="step.mutuBakuWaktu" class="w-full p-2 border border-gray-300 rounded-md" />
                            </td>
                            <td class="px-2 py-3">
                                <input v-model="step.output" class="w-full p-2 border border-gray-300 rounded-md" />
                            </td>
                            <td class="px-2 py-3">
                                <input v-model="step.keterangan" class="w-full p-2 border border-gray-300 rounded-md" />
                            </td>
                            <td class="px-2 py-3">
                                <button @click="removeStep(index)" :title="`Hapus tahapan ${index + 1}`"
                                class="px-3 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 inline-flex">
                                <TrashCanIcon class="fill-current w-4"/>
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
    
                <!-- Tombol Tambah -->
                <div class="flex justify-center mt-4">
                    <button @click="addStep"
                        class="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 inline-flex">
                        <CirclePlusIcon class="fill-current w-6 mr-2"/>
                        Tambah Tahapan
                    </button>
                </div>
            </div>
        </div>

        <!-- form tahap ketiga -->
        <div v-else-if="currentStep == 3" class="max-w-screen-sm mx-auto">
            <p>yoo ini tahap ketiga 333333</p>
            <p>disini tampilkan pratinjau dari hasil perancangan dokumen sop</p>
        </div>

    </div>

    <div class="flex justify-between mb-8 px-6 max-w-2xl mx-auto">
        <!-- Tombol "Sebelumnya" -->
        <button type="button" :disabled="currentStep == 1"
            class="w-5/12 text-white bg-gray-500 hover:bg-gray-600 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-base px-5 py-2.5 text-center inline-flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            @click="prevStep">
            <CircleArrowLeft class="fill-current w-5 mr-2 mt-1" />
            Sebelumnya
        </button>

        <!-- Tombol "Lanjut" -->
        <button type="button"
            class="w-5/12 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-base px-5 py-2.5 text-center inline-flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            @click="nextStep">
            <p v-if="currentStep == 3">Kirim</p>
            <p v-else>Lanjut</p>
            <CircleArrowRight class="fill-current w-5 ml-2 mt-1" />
        </button>
    </div>

</template>