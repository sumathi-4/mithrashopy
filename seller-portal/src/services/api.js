import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to dynamically inject the authorization token from localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('vendorToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// API methods
export const vendorLogin = (data) => api.post('/api/vendors/login', data)
export const vendorRegister = (data) => api.post('/api/vendors/register', data)
export const getVendorAnalytics = () => api.get('/api/vendors/analytics')
export const getVendorProducts = () => api.get('/api/vendors/products')
export const createVendorProduct = (data) => api.post('/api/vendors/products', data)
export const updateVendorProduct = (id, data) => api.put(`/api/vendors/products/${id}`, data)
export const deleteVendorProduct = (id) => api.delete(`/api/vendors/products/${id}`)
export const getVendorOrders = () => api.get('/api/vendors/orders')
export const updateOrderStatus = (id, status) => api.put(`/api/vendors/orders/${encodeURIComponent(id)}/status`, { status })
export const changeVendorPassword = (data) => api.put('/api/vendors/change-password', data)
export const updateVendorProfile = (data) => api.put('/api/vendors/profile', data)
export const getNotifications = () => api.get('/api/vendors/notifications')
export const markNotificationRead = (id) => api.put(`/api/vendors/notifications/${id}/read`)
export const markAllNotificationsRead = () => api.put('/api/vendors/notifications/read-all')

// Public API for the landing page
export const getPublicStats = () => api.get('/api/vendors/public-stats')

export default api
