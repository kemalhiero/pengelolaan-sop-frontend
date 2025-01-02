// Mengambil nilai dari .env
const baseURL = import.meta.env.VITE_API_BASE_URL;

// Fungsi GET
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

// Fungsi POST
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

// Fungsi PATCH
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

// Fungsi DELETE
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
