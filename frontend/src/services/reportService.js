import api from './api';

const reportService = {
  getSales:     (params) => api.get('/reports/sales',     { params }),
  getEmployees: (params) => api.get('/reports/employees', { params }),
  getServices:  (params) => api.get('/reports/services',  { params }),
};

export default reportService;
