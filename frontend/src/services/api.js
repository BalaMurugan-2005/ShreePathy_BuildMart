// src/services/api.js
import axios from 'axios'

let API_BASE = import.meta.env.VITE_API_URL || '/api'
if (API_BASE.startsWith('http') && !API_BASE.endsWith('/api')) {
  // Automatically append /api if the user forgot it in their environment variable!
  API_BASE = API_BASE.replace(/\/$/, '') + '/api'
}

const api = axios.create({ baseURL: API_BASE })

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config
    if (err.response?.status === 401 && !original._retry) {
      original._retry = true
      const refresh = localStorage.getItem('refresh_token')
      if (refresh) {
        try {
          const res = await axios.post(`${API_BASE}/login/refresh/`, { refresh })
          localStorage.setItem('access_token', res.data.access)
          api.defaults.headers.common['Authorization'] = `Bearer ${res.data.access}`
          return api(original)
        } catch {
          localStorage.clear()
          window.location.href = '/login'
        }
      }
    }
    return Promise.reject(err)
  }
)

export const authAPI = {
  register: (data) => api.post('/register/', data),
  login: (data) => api.post('/login/', data),
}

export const profileAPI = {
  get: () => api.get('/profile/'),
  update: (data) => api.put('/profile/', data),
  changePassword: (data) => api.post('/profile/change-password/', data),
}

export const materialsAPI = {
  getAll: (params) => api.get('/materials/', { params }),
  getOne: (id) => api.get(`/materials/${id}/`),
  create: (data) => api.post('/materials/', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id, data) => api.patch(`/materials/${id}/`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete: (id) => api.delete(`/materials/${id}/`),
  getReviews: (materialId) => api.get(`/materials/${materialId}/reviews/`),
  addReview: (materialId, data) => api.post(`/materials/${materialId}/reviews/`, data),
}

export const reviewsAPI = {
  reply: (reviewId, reply) => api.patch(`/reviews/${reviewId}/reply/`, { reply }),
}

export const ordersAPI = {
  getAll: (params) => api.get('/orders/', { params }),
  getOne: (id) => api.get(`/orders/${id}/`),
  create: (data) => api.post('/orders/', data),
  updateStatus: (id, status, reason) => api.put(`/orders/${id}/status/`, { status, reason }),
  cancel: (id, reason) => api.post(`/orders/${id}/cancel/`, { reason }),
  requestReturn: (id, reason) => api.post(`/orders/${id}/return/`, { reason }),
}

export const couponAPI = {
  validate: (code, order_amount) => api.post('/coupons/validate/', { code, order_amount }),
}

export const notificationsAPI = {
  getAll: () => api.get('/notifications/'),
  markRead: (id) => api.post(`/notifications/${id}/read/`),
  markAllRead: () => api.post('/notifications/read-all/'),
}

export const wishlistAPI = {
  getAll: () => api.get('/wishlist/'),
  add: (material_id) => api.post('/wishlist/', { material_id }),
  remove: (id) => api.delete(`/wishlist/${id}/`),
}

export const analyticsAPI = {
  get: () => api.get('/analytics/'),
}

export const supplierAPI = {
  getMaterials: () => api.get('/supplier/materials/'),
  getOrders: () => api.get('/supplier/orders/'),
  getAnalytics: () => api.get('/supplier/analytics/'),
  getProfile: () => api.get('/supplier/profile/'),
  updateProfile: (data) => api.patch('/supplier/profile/', data),
  getCustomers: () => api.get('/supplier/customers/'),
}

export const messagingAPI = {
  getConversations: () => api.get('/messages/'),
  getThread: (partnerId) => api.get(`/messages/${partnerId}/`),
  sendMessage: (partnerId, text) => api.post(`/messages/${partnerId}/`, { text }),
}

export const supportAPI = {
  getTickets: () => api.get('/support/'),
  createTicket: (data) => api.post('/support/', data),
}

export const withdrawalAPI = {
  getAll: () => api.get('/withdrawals/'),
  create: (data) => api.post('/withdrawals/', data),
}

export const adminAPI = {
  getUsers: () => api.get('/admin/users/'),
  getOrders: () => api.get('/admin/orders/'),
  getSuppliers: () => api.get('/admin/suppliers/'),
  getCoupons: () => api.get('/admin/coupons/'),
  createCoupon: (data) => api.post('/admin/coupons/', data),
}

export const deliveryAPI = {
  getDeliveries: () => api.get('/delivery/'),
  updateStatus: (id, status) => api.put(`/delivery/${id}/status/`, { status }),
}

export default api
