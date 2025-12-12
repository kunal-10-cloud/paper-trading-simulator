import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5001/api',
});

// Add interceptor for JWT here later
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const buyStock = (data) => api.post('/trade/buy', data);
export const sellStock = (data) => api.post('/trade/sell', data);
export const getPortfolio = () => api.get('/trade/portfolio');
export const getTransactions = () => api.get('/trade/transactions');
export const searchSymbol = (query) => api.get(`/trade/search/${query}`);
export const getStockPrice = (symbol) => api.get(`/trade/price/${symbol}`);
export const registerUser = (data) => api.post('/auth/register', data);
export const loginUser = (data) => api.post('/auth/login', data);

export default api;
