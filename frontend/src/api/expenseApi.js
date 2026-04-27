import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5001/api',
});

// Attach token to every request
API.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem('finsight_user'));
  if (user?.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  return config;
});

// Auth API
export const registerUser = (data) => API.post('/auth/register', data);
export const loginUser = (data) => API.post('/auth/login', data);
export const getMe = () => API.get('/auth/me');

// Transactions API (replaces Expenses)
export const fetchTransactions = (month, type) =>
  API.get('/transactions', { params: { ...(month && { month }), ...(type && { type }) } });
export const createTransaction = (data) => API.post('/transactions', data);
export const deleteTransaction = (id) => API.delete(`/transactions/${id}`);

// Budget API
export const fetchBudget = (month) => API.get('/budgets', { params: { month } });
export const saveBudget = (data) => API.post('/budgets', data);

// Subscription API
export const fetchSubscriptions = () => API.get('/subscriptions');
export const createSubscription = (data) => API.post('/subscriptions', data);
export const updateSubscription = (id, data) => API.put(`/subscriptions/${id}`, data);
export const deleteSubscription = (id) => API.delete(`/subscriptions/${id}`);

// Analytics API
export const fetchTrends = () => API.get('/analytics/trends');
export const fetchHeatmap = (month) => API.get('/analytics/heatmap', { params: { month } });

// Portfolio API
export const fetchPortfolio = () => API.get('/portfolio');
export const fetchPortfolioHistory = () => API.get('/portfolio/history');
export const addPortfolioTransaction = (data) => API.post('/portfolio', data);

// Legacy aliases for backward compat
export const fetchExpenses = fetchTransactions;
export const createExpense = createTransaction;
export const deleteExpense = deleteTransaction;
