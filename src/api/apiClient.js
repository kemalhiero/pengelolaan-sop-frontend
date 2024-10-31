// Mengambil nilai dari .env
const baseURL = import.meta.env.VITE_API_BASE_URL;

// Fungsi GET
const getRequest = async (endpoint) => {
    try {
        const response = await fetch(`${baseURL}/api/${endpoint}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`GET request error: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error during GET request:', error);
        throw error;
    }
};

// Fungsi POST
const postRequest = async (endpoint, data) => {
    try {
        const response = await fetch(`${baseURL}/api/${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data), // POST harus punya body
        });

        if (!response.ok) {
            throw new Error(`POST request error: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error during POST request:', error);
        throw error;
    }
};

// Fungsi PATCH
const patchRequest = async (endpoint, data) => {
    try {
        const response = await fetch(`${baseURL}/api/${endpoint}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data), // PATCH juga harus punya body
        });

        if (!response.ok) {
            throw new Error(`PATCH request error: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error during PATCH request:', error);
        throw error;
    }
};

// Fungsi DELETE
const deleteRequest = async (endpoint) => {
    try {
        const response = await fetch(`${baseURL}/api/${endpoint}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`DELETE request error: ${response.status}`);
        }

        return { message: 'Successfully deleted' };
    } catch (error) {
        console.error('Error during DELETE request:', error);
        throw error;
    }
};

export { getRequest, postRequest, patchRequest, deleteRequest }
