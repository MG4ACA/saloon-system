import api from './api';

const serviceService = {
  // Categories
  getCategories: () => api.get('/categories'),
  createCategory: (data) => api.post('/categories', data),
  updateCategory: (id, data) => api.put(`/categories/${id}`, data),
  setCategoryStatus: (id, isActive) => api.patch(`/categories/${id}/status`, { isActive }),

  // Services
  getServices: (params) => api.get('/services', { params }),
  getService: (id) => api.get(`/services/${id}`),
  createService: (data) => api.post('/services', data),
  updateService: (id, data) => api.put(`/services/${id}`, data),
  setServiceStatus: (id, isActive) => api.patch(`/services/${id}/status`, { isActive }),

  // Packages
  getPackages: () => api.get('/packages'),
  createPackage: (data) => api.post('/packages', data),
  updatePackage: (id, data) => api.put(`/packages/${id}`, data),
  setPackageStatus: (id, isActive) => api.patch(`/packages/${id}/status`, { isActive }),
};

export default serviceService;
