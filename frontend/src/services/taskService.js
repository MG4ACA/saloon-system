import api from './api';

const taskService = {
  // Tasks
  getTasks: (params) => api.get('/tasks', { params }),
  getTaskSummary: () => api.get('/tasks/summary'),
  getTask: (id) => api.get(`/tasks/${id}`),
  createTask: (data) => api.post('/tasks', data),
  updateTask: (id, data) => api.patch(`/tasks/${id}`, data),
  updateTaskStatus: (id, status) => api.patch(`/tasks/${id}/status`, { status }),

  // Customers
  lookupCustomer: (phone) => api.get('/customers/lookup', { params: { phone } }),
  createCustomer: (data) => api.post('/customers', data),
};

export default taskService;
