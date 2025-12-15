// API Service Layer with automatic token injection
export const apiRequest = async (url, options = {}) => {
    const token = localStorage.getItem('token');

    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    // Add Authorization header if token exists
    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    const config = {
        ...options,
        headers,
    };

    try {
        const response = await fetch(url, config);

        // Check if response is ok
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `HTTP Error: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('API Request Error:', error);
        throw error;
    }
};

// GET request
export const apiGet = (url, options = {}) => {
    return apiRequest(url, {
        method: 'GET',
        ...options,
    });
};

// POST request
export const apiPost = (url, data, options = {}) => {
    return apiRequest(url, {
        method: 'POST',
        body: JSON.stringify(data),
        ...options,
    });
};

// PUT request
export const apiPut = (url, data, options = {}) => {
    return apiRequest(url, {
        method: 'PUT',
        body: JSON.stringify(data),
        ...options,
    });
};

// DELETE request
export const apiDelete = (url, options = {}) => {
    return apiRequest(url, {
        method: 'DELETE',
        ...options,
    });
};
