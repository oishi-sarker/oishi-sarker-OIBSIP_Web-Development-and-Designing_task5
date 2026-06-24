import api from './client.js';

export const authApi = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  verifyEmail: (token) => api.post('/auth/verify-email', { token }),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, newPassword) => api.post('/auth/reset-password', { token, newPassword }),
  getMe: () => api.get('/auth/me'),
};

export const pizzaApi = {
  list: (params = {}) => api.get('/pizzas', { params }),
  get: (id) => api.get(`/pizzas/${id}`),
  create: (data) => api.post('/pizzas', data),
  update: (id, data) => api.put(`/pizzas/${id}`, data),
  remove: (id) => api.delete(`/pizzas/${id}`),
};

export const inventoryApi = {
  list: () => api.get('/inventory'),
  getByCategory: (category) => api.get(`/inventory/category/${category}`),
  addItem: (category, data) => api.post(`/inventory/${category}/items`, data),
  updateItem: (category, itemId, data) => api.put(`/inventory/${category}/items/${itemId}`, data),
  restockItem: (category, itemId, quantity) => api.post(`/inventory/${category}/items/${itemId}/restock`, { quantity }),
  deleteItem: (category, itemId) => api.delete(`/inventory/${category}/items/${itemId}`),
};

export const orderApi = {
  create: (data) => api.post('/orders', data),
  myOrders: () => api.get('/orders/my'),
  get: (id) => api.get(`/orders/${id}`),
  all: (params = {}) => api.get('/orders', { params }),
  updateStatus: (id, status, note = '') => api.put(`/orders/${id}/status`, { status, note }),
};

export const paymentApi = {
  createRazorpayOrder: (orderId) => api.post('/payments/razorpay/create-order', { orderId }),
  verifyPayment: (data) => api.post('/payments/razorpay/verify', data),
};
