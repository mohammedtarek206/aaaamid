import axios from 'axios';

const getBaseURL = () => {
    if (typeof window !== 'undefined') {
        return '/api';
    }
    return process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
};

const api = axios.create({
    baseURL: getBaseURL(),
    withCredentials: true,
});

// Helper to get or create a persistent Device ID
const getDeviceId = () => {
    if (typeof window === 'undefined') return null;

    let deviceId = localStorage.getItem('device_id');
    if (!deviceId) {
        deviceId = crypto.randomUUID ? crypto.randomUUID() : `device-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem('device_id', deviceId);
    }
    return deviceId;
};

// Request interceptor for tokens & device ID
api.interceptors.request.use((config) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const deviceId = getDeviceId();

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    if (deviceId) {
        config.headers['x-device-id'] = deviceId;
    }

    return config;
});

export default api;
