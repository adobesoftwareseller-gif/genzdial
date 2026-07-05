import axios from 'axios';

// Resolve API base URL
const ENV_URL = import.meta.env.VITE_API_URL;
const DEFAULT_DEV_URL = 'http://localhost:5000/api';
const DEFAULT_PROD_URL = '/api';

const API_BASE = (
    ENV_URL ||
    (import.meta.env.DEV ? DEFAULT_DEV_URL : DEFAULT_PROD_URL)
).replace(/\/+$/, '');

export const API_URL = API_BASE;
export const SERVER_ORIGIN = API_BASE.replace(/\/api$/, '') || window.location.origin;

const api = axios.create({ baseURL: API_BASE });

// Automatic Header Setup
// Admin ya User dono ke liye token handle karega
const setAuthHeaders = () => {
    const adminToken = localStorage.getItem('admin_token');
    const userToken = localStorage.getItem('token'); // Aapke user token ka naam 'token' assume kiya hai
    
    if (adminToken) {
        api.defaults.headers.common['Authorization'] = `Bearer ${adminToken}`;
    }
    if (userToken) {
        api.defaults.headers.common['userauthorization'] = `Bearer ${userToken}`;
    }
};

// Call this whenever tokens are updated
setAuthHeaders();

export const assetUrl = (u) => {
    if (!u) return '';
    if (/^(https?:|data:|blob:)/i.test(u)) return u;
    return `${SERVER_ORIGIN}${u.startsWith('/') ? '' : '/'}${u}`;
};

// API Calls
export const fetchProducts = (params = {}) =>
    api.get('/products', { params }).then((r) => r.data);

export const fetchProduct = (id) =>
    api.get(`/products/${id}`).then((r) => r.data);

export const verifyPayment = (paymentData) =>
    api.post('/orders/verify-payment', paymentData).then((r) => r.data);

export default api;