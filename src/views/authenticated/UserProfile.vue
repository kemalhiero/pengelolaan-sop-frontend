<script setup>
import { ref, reactive, inject, onMounted, computed } from 'vue';
import { toast } from 'vue3-toastify';

import { useAuthStore } from '@/stores/auth';
import useToastPromise from '@/utils/toastPromiseHandler';
import { sendCode, updateEmail, updatePw, verifCode } from '@/api/authApi';
import { addProfilePhoto, addSignatureFile, deleteSignatureFile, deleteUserProfile, getUserProfile } from '@/api/userApi';

import EyeIcon from '@/assets/icons/EyeIcon.vue';
import EyeSlashIcon from '@/assets/icons/EyeSlashIcon.vue';
import LockedInputColumnIndicator from '@/components/indicator/LockedInputColumnIndicator.vue';
import DeleteDataModal from '@/components/modal/DeleteDataModal.vue';
import roleAbbreviation from '@/data/roleAbbrv.json';

const authStore = useAuthStore();
const layoutType = inject('layoutType');
layoutType.value = 'guest';

// const cdnUrl = import.meta.env.VITE_CDN_URL;
const showModal = ref({
    deleteSignature: false,
    profilePhoto: false,
    emailConfirmation: false,
});
const emailConfirmationCode = ref('');
const userProfile = ref({
    name: '',
    id_number: '',
    email: '',
    photo: '',
    gender: '',
    role: '',
    org: ''
});
const originalEmail = ref('');
const passwordChange = reactive({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
});
const profileImage = ref({
    file: null,
    preview: null
});
const signatureImage = ref({
    file: null,
    preview: null
});
const showPw = ref({
    current: false,
    new: false,
    confirm_new: false
});

const toggleCurrentPassword = () => { showPw.value.current = !showPw.value.current };
const toggleNewPassword = () => { showPw.value.new = !showPw.value.new };
const toggleConfirmPassword = () => { showPw.value.confirm_new = !showPw.value.confirm_new };
const showSignatureForm = computed(() => ['pj', 'kadep'].includes(authStore.userRole));

const fetchProfile = async () => {
    try {
        const result = await getUserProfile();
        userProfile.value = result.data;
        originalEmail.value = result.data.email;
        signatureImage.value.preview = result.data.signature;
        signatureImage.value.file = result.data.signature;
    } catch (error) {
        console.error('Fetch error:', error);
    }
};

const openPhotoModal = () => {
    showModal.value.profilePhoto = true
};

const closePhotoModal = () => {
    if (profileImage.value.preview) {
        URL.revokeObjectURL(profileImage.value.preview); // Hapus URL sementara
    }
    showModal.value.profilePhoto = false;
    profileImage.value.file = null;
    profileImage.value.preview = null;
};

const onProfilePhotoSelected = (event) => {
    const file = event.target.files[0];
    if (file) {
        const validImageTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!validImageTypes.includes(file.type)) {
            toast('File yang dipilih harus berupa gambar (jpg, png, webp)', {
                type: 'error',
                autoClose: 5000,
            });
            profileImage.value.file = null;
            profileImage.value.preview = null;
            return;
        }
        profileImage.value.file = file; // Simpan file asli
        profileImage.value.preview = URL.createObjectURL(file); // Buat URL sementara untuk pratinjau
    } else {
        profileImage.value.file = null;
        profileImage.value.preview = null;
    }
};

const uploadPhoto = () => {
    try {
        if (!profileImage.value.file) {
            toast('Pilih foto terlebih dahulu!', {
                type: 'warning',
                autoClose: 5000,
            });
            return;
        }

        useToastPromise(
            new Promise((resolve, reject) => {
                addProfilePhoto(profileImage.value.file)
                    .then(response => {
                        if (!response.success) {
                            throw response;
                        }
                        resolve();
                        fetchProfile(); // Refresh profile data after upload
                        closePhotoModal();
                        // authStore.setPhoto(`${cdnUrl}/${response.data}`); // Update photo in auth store
                    })
                    .catch(error => reject(error));
            }),
            {
                messages: {
                    success: 'Foto profil berhasil diunggah!'
                }
            }
        );

    } catch (error) {
        console.error('Fetch error:', error);
    }
};

const removeProfilePhoto = async () => {
    try {
        if (profileImage.value.file instanceof File) {
            profileImage.value.preview = null;
            profileImage.value.file = null;
        } else if (profileImage.value.file === null || userProfile.value.photo) {
            useToastPromise(
                new Promise((resolve, reject) => {
                    deleteUserProfile()
                        .then(response => {
                            if (!response.success) {
                                throw response;
                            }
                            userProfile.value.photo = null;
                            profileImage.value.preview = null;
                            profileImage.value.file = null;
                            // authStore.setPhoto(null); // Clear photo in auth store
                            closePhotoModal();
                            resolve();
                        })
                        .catch(error => reject(error));
                }),
                {
                    messages: {
                        success: 'Foto profil berhasil dihapus!',
                        pending: 'Sedang menghapus foto profil...'
                    }
                }
            );
        } else {
            console.log('ini jenis filenya: ', typeof profileImage.value.file);
            toast(`Pilih foto profil terbaru terlebih dahulu `, {
                type: "warning",
                autoClose: 7000,
            });
        }
    } catch (error) {
        console.error('Fetch error:', error);
    }
};

const changePassword = () => {
    try {
        if (passwordChange.newPassword !== passwordChange.confirmPassword) {
            alert('Konfirmasi password tidak sesuai')
            return
        }

        useToastPromise(
            new Promise((resolve, reject) => {
                updatePw(passwordChange)
                    .then(response => {
                        if (!response.success) {
                            throw response;
                        }
                        passwordChange.currentPassword = '';
                        passwordChange.newPassword = '';
                        passwordChange.confirmPassword = '';
                        resolve();
                    })
                    .catch(error => reject(error));
            }),
            {
                messages: {
                    success: 'Sandi anda berhasil diubah!'
                }
            }
        );
    } catch (error) {
        console.error('Fetch error:', error);
    }
};

const checkDataUpdate = () => {
    try {
        if (userProfile.value.email !== originalEmail.value) {
            // Send verification code to the new email
            useToastPromise(
                new Promise((resolve, reject) => {
                    sendCode({
                        newEmail: userProfile.value.email
                    }).then(response => {
                        if (!response.success) {
                            throw response;
                        }
                        resolve();
                        showModal.value.emailConfirmation = true;
                    })
                        .catch(error => reject(error));
                }),
                {
                    messages: {
                        success: 'Kode verifikasi telah dikirim ke email baru!',
                        pending: 'Sedang mengirim kode verifikasi...'
                    }
                }
            );

        } else {
            console.log('email tidak berubah!')
            // Update profile without verification
            // await updateUserProfile(userProfile.value);
        }
    } catch (error) {
        console.error('Error sending confirmation code:', error);
    }
};

const verifyCode = async () => {        //verifikasi kode dan perbarui email
    try {
        const isValid = await verifCode({ code: emailConfirmationCode.value });
        if (isValid.success) {
            // if (userProfile.value.role !== 'kadep') {
            useToastPromise(
                new Promise((resolve, reject) => {
                    updateEmail({
                        oldEmail: originalEmail.value,
                        newEmail: userProfile.value.email
                    }).then(response => {
                        if (!response.success) {
                            throw response;
                        }
                        resolve();
                        showModal.value.emailConfirmation = false;
                    })
                        .catch(error => reject(error));
                }),
                {
                    messages: {
                        success: 'Email berhasil diperbarui!',
                        pending: 'Sedang memperbarui email...'
                    }
                }
            );
            // }
        } else {
            toast(`Kode verifikasi tidak valid!<br> ${isValid.error}`, {
                type: 'error',
                autoClose: 5000,
                dangerouslyHTMLString: true
            });
        }
    } catch (error) {
        console.error('Error verifying code:', error);
    }
};

const onSignatureFileSelected = (event) => {
    const file = event.target.files[0];
    if (file) {
        signatureImage.value.file = file;
        signatureImage.value.preview = URL.createObjectURL(file);
    } else {
        signatureImage.value.file = null;
        signatureImage.value.preview = null;
    }
};

// Fungsi untuk mendapatkan nama file dari URL atau File object
const getFileName = (file) => {
    if (!file) return '';

    // Jika file adalah File object (file baru dipilih)
    if (file instanceof File) {
        return file.name;
    }

    // Jika file adalah string URL (dari API)
    if (typeof file === 'string') {
        // Mengambil bagian terakhir dari URL (nama file)
        const urlParts = file.split('/');
        const fileName = urlParts[urlParts.length - 1];

        // Menghapus ID yang ada di awal nama file (opsional)
        const cleanFileName = fileName.replace(/^\d+-/, '');

        return cleanFileName;
    }

    return '';
};

const uploadSignature = () => {
    try {
        if (signatureImage.value.file instanceof File) {
            useToastPromise(
                new Promise((resolve, reject) => {
                    addSignatureFile(signatureImage.value.file)
                        .then(response => {
                            if (!response.success) {
                                throw response;
                            }
                            resolve();
                        })
                        .catch(error => reject(error));
                }),
                {
                    messages: {
                        success: 'Tanda tangan berhasil diunggah!',
                        pending: 'Sedang mengunggah tanda tangan...'
                    }
                }
            );
        } else if (typeof signatureImage.value.file === 'string') {
            toast(`Pilih tanda tangan terbaru terlebih dahulu `, {
                type: "warning",
                autoClose: 7000,
            });
        } else {
            console.log('ini jenis filenya', typeof signatureImage.value.file)
            toast(`Jenis file ${typeof signatureImage.value.file} tidak sesuai!`, {
                type: "error",
                autoClose: 7000,
                dangerouslyHTMLString: true
            });
        }
    } catch (error) {
        console.error('Fetch error:', error);
    }
};

const removeSignature = async () => {
    try {
        if (signatureImage.value.file instanceof File) {
            signatureImage.value.preview = null;
            signatureImage.value.file = null;
        } else if (typeof signatureImage.value.file === 'string') {
            // Hapus tanda tangan dari server
            useToastPromise(
                new Promise((resolve, reject) => {
                    deleteSignatureFile()
                        .then(response => {
                            if (!response.success) {
                                throw response;
                            }
                            signatureImage.value.preview = null;
                            signatureImage.value.file = null;
                            resolve();
                        })
                        .catch(error => reject(error));
                }),
                {
                    messages: {
                        success: 'Tanda tangan berhasil dihapus!',
                        pending: 'Sedang menghapus tanda tangan...'
                    }
                }
            );

        } else {
            console.log('ini jenis filenya: ', typeof signatureImage.value.file)
            toast(`Pilih tanda tangan terbaru terlebih dahulu `, {
                type: "warning",
                autoClose: 7000,
            });
        }
    } catch (error) {
        console.error('Fetch error:', error);
    } finally {
        showModal.value.deleteSignature = false;
    }
};

onMounted(() => {
    fetchProfile();
});
</script>

<template>

    <div class="container mx-auto p-6">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

            <!-- Foto Profil -->
            <div class="lg:col-span-1 flex flex-col items-center my-auto">
                <div class="relative mb-4">
                    <img :src="userProfile.photo || '/user-avatar.jpg'" alt="Foto Profil"
                        class="w-48 lg:w-60 h-48 lg:h-60 rounded-full border-4 border-gray-300 shadow-lg object-cover" />
                    <button @click="openPhotoModal"
                        class="absolute bottom-0 lg:bottom-2 right-0 lg:right-2 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors">
                        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path
                                d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.379-8.379-2.828-2.828z" />
                        </svg>
                    </button>
                </div>
            </div>

            <!-- Informasi Pribadi -->
            <div class="lg:col-span-2 p-6">
                <h2 class="text-2xl font-bold text-gray-800 mb-6">Informasi Pribadi</h2>
                <form @submit.prevent="checkDataUpdate">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">

                        <div class="space-y-2">
                            <label class="block text-sm font-medium text-gray-700">Nama</label>
                            <div class="flex items-center border border-gray-300 rounded-lg shadow-sm">
                                <input type="text" disabled :value="userProfile.name"
                                    class="w-full pl-3 py-2 border-none bg-transparent" />
                                <LockedInputColumnIndicator />
                            </div>
                        </div>
                        <div class="space-y-2">
                            <label class="block text-sm font-medium text-gray-700">NIM/NIP</label>
                            <div class="flex items-center border border-gray-300 rounded-lg shadow-sm">
                                <input type="text" disabled :value="userProfile.id_number"
                                    class="w-full pl-3 py-2 border-none bg-transparent" />
                                <LockedInputColumnIndicator />
                            </div>
                        </div>
                        <div class="space-y-2">
                            <label class="block text-sm font-medium text-gray-700">Email</label>
                            <input type="email" v-model="userProfile.email" required
                                class="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500" />
                        </div>
                        <div class="space-y-2">
                            <label class="block text-sm font-medium text-gray-700">Gender</label>
                            <div class="flex items-center border border-gray-300 rounded-lg shadow-sm">
                                <input type="text" disabled :value="userProfile.gender"
                                    class="w-full pl-3 py-2 border-none bg-transparent" />
                                <LockedInputColumnIndicator />
                            </div>
                        </div>
                        <div class="space-y-2">
                            <label class="block text-sm font-medium text-gray-700">Role</label>
                            <div class="flex items-center border border-gray-300 rounded-lg shadow-sm">
                                <input type="text" disabled :value="roleAbbreviation[userProfile.role]"
                                    class="w-full pl-3 py-2 border-none bg-transparent" />
                                <LockedInputColumnIndicator />
                            </div>
                        </div>
                        <div class="space-y-2">
                            <label class="block text-sm font-medium text-gray-700">Organisasi</label>
                            <div class="flex items-center border border-gray-300 rounded-lg shadow-sm">
                                <input type="text" disabled :value="userProfile.org"
                                    class="w-full pl-3 py-2 border-none bg-transparent" />
                                <LockedInputColumnIndicator />
                            </div>
                        </div>
                    </div>
                    <div class="mt-6 flex justify-end">
                        <button type="submit" :disabled="userProfile.email == originalEmail"
                            class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:cursor-not-allowed disabled:bg-opacity-60">
                            Perbarui Data
                        </button>
                    </div>
                </form>
            </div>

            <div></div>

            <!-- Tanda Tangan -->
            <div class="lg:col-span-2 p-6" v-if="showSignatureForm">
                <h2 class="text-2xl font-bold text-gray-800 mb-1">Tanda Tangan</h2>
                <p class="text-sm mb-6">Unggah hasil pindai dari tanda tangan dan stempel jabatan anda. Pastikan
                    latarnya berwarna putih!</p>
                <form @submit.prevent="uploadSignature" class="space-y-4">
                    <div class="flex items-center">
                        <input type="file" @change="onSignatureFileSelected" accept="image/png, image/jpeg, image/webp"
                            ref="signatureInput" class="sr-only" />
                        <button type="button" @click="$refs.signatureInput.click()"
                            class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition">
                            Pilih Tanda Tangan
                        </button>
                        <span v-if="signatureImage.preview" class="ml-4 text-gray-600">{{
                            decodeURI(getFileName(signatureImage.file)) }}</span>
                    </div>
                    <div v-if="signatureImage.preview" class="flex justify-center">
                        <img :src="signatureImage.preview" alt="Pratinjau Tanda Tangan"
                            class="max-w-full max-h-32 rounded-md" />
                    </div>
                    <div class="flex justify-end space-x-4">
                        <button type="button" @click="showModal.deleteSignature = true" :disabled="!signatureImage.preview"
                            class="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition disabled:cursor-not-allowed disabled:bg-opacity-60">
                            Hapus
                        </button>
                        <button type="submit"
                            :disabled="!signatureImage.preview || typeof signatureImage.file == 'string'"
                            class="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition disabled:cursor-not-allowed disabled:bg-opacity-60">
                            Unggah
                        </button>
                    </div>
                </form>
            </div>

            <div v-if="showSignatureForm"></div>

            <!-- Ubah Password -->
            <div class="lg:col-span-2 p-6">
                <h2 class="text-2xl font-bold text-gray-800 mb-6">Ubah Password</h2>
                <form @submit.prevent="changePassword">
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div class="space-y-2">
                            <label class="block text-sm font-medium text-gray-700">Password Saat Ini</label>
                            <div class="relative">
                                <input :type="showPw.current ? 'text' : 'password'"
                                    v-model="passwordChange.currentPassword" required minlength="5"
                                    class="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500" />
                                <button type="button" @click="toggleCurrentPassword"
                                    class="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700">
                                    <EyeIcon v-if="showPw.current" class="h-5 w-5" />
                                    <EyeSlashIcon v-else class="h-5 w-5" />
                                </button>
                            </div>
                        </div>
                        <div class="space-y-2">
                            <label class="block text-sm font-medium text-gray-700">Password Baru</label>
                            <div class="relative">
                                <input :type="showPw.new ? 'text' : 'password'" v-model="passwordChange.newPassword"
                                    required minlength="5"
                                    class="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500" />
                                <button type="button" @click="toggleNewPassword"
                                    class="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700">
                                    <EyeIcon v-if="showPw.new" class="h-5 w-5" />
                                    <EyeSlashIcon v-else class="h-5 w-5" />
                                </button>
                            </div>
                        </div>
                        <div class="space-y-2">
                            <label class="block text-sm font-medium text-gray-700">Konfirmasi Password Baru</label>
                            <div class="relative">
                                <input :type="showPw.confirm_new ? 'text' : 'password'" minlength="5"
                                    v-model="passwordChange.confirmPassword" required
                                    class="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500" />
                                <button type="button" @click="toggleConfirmPassword"
                                    class="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700">
                                    <EyeIcon v-if="showPw.confirm_new" class="h-5 w-5" />
                                    <EyeSlashIcon v-else class="h-5 w-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                    <div class="mt-6 flex justify-end">
                        <button type="submit"
                            class="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                            Ubah Password
                        </button>
                    </div>
                </form>
            </div>

        </div>
    </div>

    <!-- Modal Foto Profil -->
    <div v-if="showModal.profilePhoto" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div class="fixed inset-0 bg-gray-800 bg-opacity-30" @click="closePhotoModal"></div>

        <div class="relative bg-white rounded-lg shadow-lg p-6 max-w-sm w-full">
            <h3 class="text-lg font-medium text-gray-800 mb-4 text-center">Kelola Foto Profil</h3>
            <div class="mb-4 text-center">
                <input type="file" @change="onProfilePhotoSelected" accept="image/png, image/jpeg, image/webp"
                    class="hidden" ref="fileInput" />
                <button @click="$refs.fileInput.click()"
                    class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition">
                    Pilih Foto
                </button>
            </div>
            <div v-if="profileImage.preview || userProfile.photo" class="mb-4 flex justify-center">
                <img :src="profileImage.preview || userProfile.photo" alt="Pratinjau Foto"
                    class="w-48 h-48 rounded-full object-cover shadow-md" />
            </div>
            <div class="flex justify-between space-x-2">
                <button @click="uploadPhoto" :disabled="!profileImage.file"
                    class="flex-1 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition disabled:opacity-50 disabled:cursor-not-allowed">
                    Unggah
                </button>
                <button @click="removeProfilePhoto" :disabled="!profileImage.preview && !userProfile.photo"
                    class="flex-1 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition disabled:opacity-50 disabled:cursor-not-allowed">
                    Hapus
                </button>
                <button @click="closePhotoModal"
                    class="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition">
                    Batal
                </button>
            </div>
        </div>
    </div>

    <!-- modal konfirmasi email -->
    <div v-show="showModal.emailConfirmation" class="fixed inset-0 z-50 flex items-center justify-center w-full h-full">

        <div class="fixed inset-0 bg-gray-800 bg-opacity-30"></div>

        <div class="relative w-full max-w-2xl max-h-full">
            <div class="relative bg-white rounded-lg shadow">

                <!-- Modal header -->
                <div class="flex items-center justify-between p-4 md:p-5 border-b rounded-t">
                    <h3 class="text-xl font-medium text-gray-900">
                        Masukkan kode yang telah dikirimkan ke email!
                    </h3>
                </div>

                <!-- Modal body -->
                <form @submit.prevent="verifyCode">
                    <div class="p-4 md:p-5 space-y-4 max-h-[620px] overflow-y-auto">
                        <input type="text" maxlength="6"
                            class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                            v-model="emailConfirmationCode" required>
                    </div>

                    <!-- Modal footer -->
                    <div
                        class="flex items-center p-4 md:p-5 space-x-3 rtl:space-x-reverse border-t border-gray-200 rounded-b">
                        <button type="submit" :disabled="emailConfirmationCode.length != 6"
                            class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center disabled:cursor-not-allowed disabled:bg-opacity-40">
                            Konfirmasi
                        </button>
                    </div>
                </form>

            </div>
        </div>

    </div>

    <DeleteDataModal :showModal="showModal.deleteSignature" :deleteData="removeSignature"
        @update:showModal="showModal.deleteSignature = $event"
        text="Anda yakin ingin menghapus file tanda tangan ini?" />

</template>
