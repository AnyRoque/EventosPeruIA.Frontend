import { defineBoot } from '#q-app'
import axios from 'axios'
import { Notify } from 'quasar'

// Dirección del backend EventosPeruIA (Visual Studio)
export const API_HOST = 'http://localhost:5166'

const api = axios.create({
  baseURL: `${API_HOST}/api`,
  timeout: 60000
})

// Si hay sesión iniciada, cada petición lleva el token JWT en la cabecera Authorization
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Mensaje de error de la API: { mensaje, errores } o un texto genérico
export function mensajeError(error) {
  const data = error.response?.data
  if (data?.errores) return Object.values(data.errores).flat().join(' ')
  if (data?.mensaje) return data.mensaje
  if (error.response?.status === 403) return 'No tienes permiso para realizar esta acción.'
  return 'No se pudo conectar con el servidor. ¿Está encendida la API?'
}

export default defineBoot(({ app, router }) => {
  app.config.globalProperties.$api = api

  // 401: no hay sesión o el token venció → se cierra la sesión y se pide iniciar de nuevo
  // 403 por rol: la API responde «No tienes permiso…» → página de acceso denegado
  api.interceptors.response.use(
    (respuesta) => respuesta,
    (error) => {
      const estado = error.response?.status
      const esLogin = error.config?.url?.includes('/Usuario/login')

      if (estado === 401 && !esLogin) {
        localStorage.removeItem('token')
        localStorage.removeItem('usuario')
        Notify.create({ type: 'warning', message: 'Tu sesión terminó. Vuelve a iniciar sesión.' })
        router.push({ path: '/login', query: { redirect: router.currentRoute.value.fullPath } })
      } else if (estado === 403) {
        const mensaje = error.response?.data?.mensaje
        if (!mensaje || mensaje.startsWith('No tienes permiso')) router.push('/acceso-denegado')
      }
      return Promise.reject(error)
    },
  )
})

export { api }
