import { toast } from 'vue3-toastify';

/**
 * Fungsi utilitas untuk menangani promise dengan notifikasi toast
 * @param {Promise} promiseCallback - Promise yang akan dieksekusi dan dimonitor
 * @param {Object} options - Opsi tambahan
 * @param {Object} options.messages - Pesan yang akan ditampilkan dalam toast
 * @param {string} options.messages.pending - Pesan saat promise sedang berjalan
 * @param {string} options.messages.success - Pesan saat promise berhasil
 * @param {string} options.messages.error - Pesan saat promise gagal
 * @param {Object} options.icons - Icon untuk toast
 * @param {string} options.icons.pending - Icon untuk status pending (default: 🔄)
 * @param {string} options.icons.success - Icon untuk status success (default: ✅)
 * @param {string} options.icons.error - Icon untuk status error (default: ❌)
 * @param {Object} options.toastOptions - Opsi tambahan untuk toast
 * @returns {Promise} - Promise asli yang dibungkus dengan toast
 */
const toastPromise = (promiseCallback, options = {}) => {
    const {
        messages = {},
        icons = {},
        toastOptions = {}
    } = options;

    // Pesan default
    const defaultMessages = {
        pending: 'Sedang memproses data...',
        success: 'Operasi berhasil!',
        error: 'Terjadi kesalahan'
    };

    // Icon default
    const defaultIcons = {
        pending: '🔄',
        success: '✅',
        error: '❌'
    };

    // Opsi toast default
    const defaultToastOptions = {
        closeButton: true,
        autoClose: 5000
    };

    return toast.promise(
        promiseCallback,
        {
            pending: {
                render() {
                    return messages.pending || defaultMessages.pending;
                },
                icon: icons.pending || defaultIcons.pending
            },
            success: {
                render({ data }) {
                    // Jika data adalah string, tampilkan langsung
                    if (typeof data === 'string') {
                        return messages.success
                            ? typeof messages.success === 'function'
                                ? messages.success(data)
                                : messages.success
                            : data;
                    }
                    // Jika data adalah object
                    const successMessage = data?.message || messages.success || defaultMessages.success;
                    return successMessage;
                },
                icon: icons.success || defaultIcons.success
            },
            error: {
                render({ data }) {
                    // Jika data adalah string, tampilkan langsung
                    if (typeof data === 'string') {
                        return `Gagal: ${data}`;
                    }
                    // Jika data adalah object error
                    const errorMessage = data?.error?.message || data?.message || messages.error || defaultMessages.error;
                    return `Gagal: ${errorMessage}`;
                },
                icon: icons.error || defaultIcons.error
            }
        },
        {
            ...defaultToastOptions,
            ...toastOptions
        }
    );
};

export default toastPromise;
