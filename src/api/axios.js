import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5166/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

api.interceptors.response.use((response) => {
  if (response.data?.esExitoso === false) {
    return Promise.reject(new Error(response.data.mensaje || 'La solicitud no pudo completarse.'))
  }

  return response
})

export function getErrorMessage(error) {
  return error.response?.data?.mensaje || error.message || 'Ocurrió un error inesperado.'
}

export default api
