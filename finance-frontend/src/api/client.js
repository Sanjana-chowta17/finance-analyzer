import axios from 'axios'

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
})

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

client.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }

    return Promise.reject(err)
  }
)

export const authApi = {
  register: (data) => client.post('/auth/register', data),
  login: (data) => client.post('/auth/login', data),
}

export const transactionApi = {
  getAll: () => client.get('/transactions'),

  create: (data) => client.post('/transactions', data),

  delete: (id) => client.delete(`/transactions/${id}`),

  uploadCsv: (file) => {
    const formData = new FormData()

    formData.append('file', file)

    return client.post('/transactions/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },
}

export const insightApi = {
  generate: () => client.post('/insights/generate'),

  history: () => client.get('/insights'),

  chat: (question) =>
    client.post('/insights/chat', { question }),
}

/* =========================
   ACCOUNT API
   ========================= */

export const userApi = {
  // Get logged-in user's profile
  getProfile: () =>
    client.get('/users/me'),

  // Update name and email
  updateProfile: (data) =>
    client.put('/users/me', data),

  // Change password
  changePassword: (data) =>
    client.put('/users/me/password', data),
}

export default client