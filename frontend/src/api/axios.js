import axios from 'axios';

const api = axios.create({
    // When deploying to Railway, we will swap this for the live URL
    baseURL: 'http://localhost:8000/api/', 
});

// The Interceptor: Automatically attaches the token to every request
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;