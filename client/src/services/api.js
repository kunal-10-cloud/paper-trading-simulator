import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5001/api',
});

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
export const getStockPrice = (symbol) => api.get(`/trade/price/${symbol}`);
export const getStockCandles = (symbol, range) => api.get(`/trade/candles/${symbol}?range=${range}`);
export const searchSymbol = (query) => api.get(`/trade/search/${query}`);
export const getIndices = () => api.get('/trade/indices');
export const getCompanyProfile = (symbol) => api.get(`/trade/profile/${symbol}`);
export const getFinancials = (symbol) => api.get(`/trade/financials/${symbol}`);
export const getCompanyNews = (symbol) => api.get(`/trade/news/${symbol}`);
export const getMarketNews = () => api.get('/trade/news/market');
export const getRecommendations = (symbol) => api.get(`/trade/recommendations/${symbol}`);

export const registerUser = (userData) => api.post('/auth/register', userData);
export const loginUser = (userData) => api.post('/auth/login', userData);
export const getMe = () => api.get(`/auth/me?t=${new Date().getTime()}`);
export const setStopLoss = (symbol, type, value) => api.post('/trade/stop-loss', { symbol, type, value });

export const updateProfile = (data) => api.put('/profile/update', data);
export const resetTpin = (data) => api.post('/profile/reset-tpin', data);
export const getTransactions = () => api.get('/trade/transactions');

export default api;
