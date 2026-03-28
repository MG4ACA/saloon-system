import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '../services/api'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const token = ref(localStorage.getItem('token') || null)
  const refreshToken = ref(localStorage.getItem('refreshToken') || null)

  const isAuthenticated = computed(() => !!token.value && !!user.value)

  const setTokens = (accessToken, refreshTok) => {
    token.value = accessToken
    refreshToken.value = refreshTok
    localStorage.setItem('token', accessToken)
    localStorage.setItem('refreshToken', refreshTok)
    api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`
  }

  const setUser = (userData) => {
    user.value = userData
    localStorage.setItem('user', JSON.stringify(userData))
  }

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password })
      const { accessToken, refreshToken: refreshTok, user: userData } = response.data
      setTokens(accessToken, refreshTok)
      setUser(userData)
      return true
    } catch (error) {
      console.error('Login failed:', error)
      return false
    }
  }

  const logout = () => {
    user.value = null
    token.value = null
    refreshToken.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
    delete api.defaults.headers.common['Authorization']
  }

  const refreshAccessToken = async () => {
    try {
      const response = await api.post('/auth/refresh', { refreshToken: refreshToken.value })
      const { accessToken, refreshToken: refreshTok } = response.data
      setTokens(accessToken, refreshTok)
      return true
    } catch (error) {
      logout()
      return false
    }
  }

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
  }
})
