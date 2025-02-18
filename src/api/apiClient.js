// Mengambil nilai dari .env
const baseURL = import.meta.env.VITE_API_BASE_URL;

/**
 * Mengirim permintaan GET ke endpoint yang ditentukan.
 *
 * @param {string} endpoint - Endpoint API untuk mengirim permintaan.
 * @param {string} [token=null] - Token otorisasi opsional.
 * @returns {Promise<Object>} Objek respons yang berisi status keberhasilan, kode status HTTP, data, dan pesan kesalahan jika ada.
 * @throws {Error} Jika terjadi kesalahan saat mengirim request.
 */
const getRequest = async (endpoint, token = null) => {
    try {
        const headers = {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
        };

        const fetchOptions = {
            method: 'GET',
            headers
        };

        const response = await fetch(`${baseURL}/api/${endpoint}`, fetchOptions);
        const result = await response.json();

        return {
            success: response.ok,
            status: response.status,
            data: result.data,
            error: !response.ok ? result : null
        };

    } catch (error) {
        console.error('Error during GET request:', error);
        return {
            success: false,
            status: error.status || 500,
            data: null,
            error: error.message
        };
    }
};

/**
 * Mengirim request POST ke endpoint yang ditentukan dengan data dan token yang diberikan.
 *
 * @param {string} endpoint - The API endpoint to send the request to.
 * @param {Object} [data=null] - The data to be sent in the body of the request.
 * @param {string} [token=null] - The authorization token to be included in the request headers.
 * @returns {Promise<Object>} The response object containing success status, HTTP status code, response data, and error information.
 */
const postRequest = async (endpoint, data = null, token = null) => {
    try {
        const headers = {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
        };

        const fetchOptions = {
            method: 'POST',
            headers,
            ...(data && { body: JSON.stringify(data) })
        };

        const response = await fetch(`${baseURL}/api/${endpoint}`, fetchOptions);
        const result = await response.json();

        return {
            success: response.ok,
            status: response.status,
            data: result.data,
            error: !response.ok ? result : null
        };
    } catch (error) {
        console.error('Error during POST request:', error);
        return {
            success: false,
            status: error.status || 500,
            data: null,
            error: error.message
        };
    }
};

/**
 * Mengirim permintaan PATCH ke endpoint yang ditentukan dengan data dan token yang diberikan.
 *
 * @param {string} endpoint - Endpoint API untuk mengirim permintaan.
 * @param {Object} [data=null] - Data yang akan dikirim dalam body permintaan.
 * @param {string} [token=null] - Token otorisasi yang akan disertakan dalam header permintaan.
 * @returns {Promise<Object>} Objek respons yang berisi status keberhasilan, kode status HTTP, data respons, dan informasi kesalahan.
 */
const patchRequest = async (endpoint, data, token = null) => {
    try {
        const headers = {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
        };

        const fetchOptions = {
            method: 'PATCH',
            headers,
            ...(data && { body: JSON.stringify(data) })
        };

        const response = await fetch(`${baseURL}/api/${endpoint}`, fetchOptions);
        const result = await response.json();

        return {
            success: response.ok,
            status: response.status,
            data: result.data,
            error: !response.ok ? result : null
        };
    } catch (error) {
        console.error('Error during PATCH request:', error);
        return {
            success: false,
            status: error.status || 500,
            data: null,
            error: error.message
        };
    }
};

/**
 * Sends a DELETE request to the specified endpoint.
 *
 * @param {string} endpoint - The API endpoint to send the DELETE request to.
 * @param {string|null} [token=null] - The optional authorization token to include in the request headers.
 * @returns {Promise<Object>} The response object containing success status, HTTP status code, response data, and error information.
 * @throws {Error} If there is an error during the request.
 */
const deleteRequest = async (endpoint, token = null) => {
    try {
        const headers = {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
        };

        const fetchOptions = {
            method: 'DELETE',
            headers
        };

        const response = await fetch(`${baseURL}/api/${endpoint}`, fetchOptions);
        const result = await response.json();

        return {
            success: response.ok,
            status: response.status,
            data: result.data,
            error: !response.ok ? result : null
        };
    } catch (error) {
        console.error('Error during DELETE request:', error);
        return {
            success: false,
            status: error.status || 500,
            data: null,
            error: error.message
        };
    }
};

export { getRequest, postRequest, patchRequest, deleteRequest };
