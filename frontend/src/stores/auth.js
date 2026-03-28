import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import api from '../services/api';

export const useAuthStore = defineStore('auth', () => {
  // Restore persisted state from localStorage on init
  const storedUser = localStorage.getItem('user');
  const user = ref(storedUser ? JSON.parse(storedUser) : null);
  const token = ref(localStorage.getItem('token') || null);
  const refreshToken = ref(localStorage.getItem('refreshToken') || null);

  // Restore Authorization header if token exists on page reload
  if (token.value) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token.value}`;
  }

  const isAuthenticated = computed(() => !!token.value && !!user.value);

  const setTokens = (accessToken, refreshTok) => {
    token.value = accessToken;
    refreshToken.value = refreshTok;
    localStorage.setItem('token', accessToken);
    localStorage.setItem('refreshToken', refreshTok);
    api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
  };

  const setUser = (userData) => {
    user.value = userData;
    localStorage.setItem('user', JSON.stringify(userData));
  };

  // Returns { success: true } or { success: false, message: '...' }
  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { accessToken, refreshToken: refreshTok, user: userData } = response.data;
      setTokens(accessToken, refreshTok);
      setUser(userData);
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.error || 'Login failed. Please try again.';
      return { success: false, message };
    }
  };

  const logout = () => {
    user.value = null;
    token.value = null;
    refreshToken.value = null;
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    delete api.defaults.headers.common['Authorization'];
  };

  const refreshAccessToken = async () => {
    try {
      const response = await api.post('/auth/refresh', { refreshToken: refreshToken.value });
      const { accessToken, refreshToken: refreshTok } = response.data;
      setTokens(accessToken, refreshTok);
      return true;
    } catch (error) {
      logout();
      return false;
    }
  };

  return {
    user,
    token,
    refreshToken,
    isAuthenticated,
    login,
    logout,
    setUser,
    setTokens,
    refreshAccessToken,
  };
});
