import api from './api';

const commissionService = {
  getSummary: (year, month) => api.get('/commissions/summary', { params: { year, month } }),
  getCommissions: (params) => api.get('/commissions', { params }),
};

export default commissionService;
