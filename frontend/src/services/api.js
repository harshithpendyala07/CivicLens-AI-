import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 30000,
})

api.interceptors.response.use(
  res => res,
  err => {
    // Only redirect to login on 401 if it's NOT an authentication request
    if (err.response?.status === 401 && !err.config?.url?.includes('/auth/')) {
      localStorage.removeItem('civiclens_token')
      localStorage.removeItem('civiclens_user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default api
