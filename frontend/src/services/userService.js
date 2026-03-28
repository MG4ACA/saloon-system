import api from './api';

const userService = {
  // Register a new user (admin calls /api/auth/register)
  register: (data) => api.post('/auth/register', data),

  // Get all users (admin only)
  getAll: () => api.get('/users'),

  // Get user by ID (admin only)
  getById: (id) => api.get(`/users/${id}`),

  // Update user name or role (admin only)
  updateUser: (id, data) => api.put(`/users/${id}`, data),

  // Enable or disable a user (admin only)
  updateStatus: (id, isActive) => api.patch(`/users/${id}/status`, { isActive }),

  // Get dashboard stats (active employee count)
  getStats: () => api.get('/users/stats'),
};

export default userService;
