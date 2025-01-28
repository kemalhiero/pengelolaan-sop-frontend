const baseURL = import.meta.env.VITE_API_BASE_URL;

/**
 * Upload file ke backend
 * @param {string} endpoint - Endpoint API
 * @param {File} file - File yang akan diupload
 * @param {string} token - Token autentikasi (opsional)
 * @returns {Promise<{success: boolean, status: number, data: any, error: any}>}
 */
const uploadFile = async (endpoint, file, token = null) => {
    try {
        const headers = {
            ...(token && { 'Authorization': `Bearer ${token}` }),
        };

        const formData = new FormData();
        formData.append('file', file);

        const fetchOptions = {
            method: 'POST',
            headers,
            body: formData,
        };

        const response = await fetch(`${baseURL}/api/${endpoint}`, fetchOptions);
        const result = await response.json();

        return {
            success: response.ok,
            status: response.status,
            data: result.data,
            error: !response.ok ? result : null,
        };
    } catch (error) {
        console.error('Error during file upload:', error);
        return {
            success: false,
            status: error.status || 500,
            data: null,
            error: error.message,
        };
    }
};


export { uploadFile };
