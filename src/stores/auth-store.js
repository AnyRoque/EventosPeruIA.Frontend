import { defineStore, acceptHMRUpdate } from 'pinia'
import { api } from '@/boot/axios'

// Fecha de vencimiento (exp) que viene dentro del token JWT
function venceEn(token) {
  try {
    const datos = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')))
    return datos.exp ? datos.exp * 1000 : null
  } catch {
    return null
  }
}

// Sesión del usuario (US-02). Se guarda en localStorage para no perderla al recargar.
export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('token'),
    usuario: JSON.parse(localStorage.getItem('usuario') || 'null'),
  }),

  getters: {
    haySesion: (state) => !!state.token,
    nombre: (state) => (state.usuario ? `${state.usuario.nombre} ${state.usuario.apellido}` : ''),
    iniciales: (state) =>
      state.usuario ? `${state.usuario.nombre[0]}${state.usuario.apellido[0]}`.toUpperCase() : '',
    roles: (state) => state.usuario?.roles ?? [],
    esAsistente() {
      return this.roles.includes('Asistente')
    },
    esOrganizador() {
      return this.roles.includes('Organizador')
    },
    esAdmin() {
      return this.roles.includes('Administrador')
    },
  },

  actions: {
    tieneRol(rol) {
      return this.roles.includes(rol)
    },

    guardarSesion(datos) {
      this.token = datos.token
      this.usuario = datos
      localStorage.setItem('token', this.token)
      localStorage.setItem('usuario', JSON.stringify(this.usuario))
    },

    async login(correo, password) {
      const { data } = await api.post('/Usuario/login', { correo, password })
      this.guardarSesion(data.datos)
      return data.mensaje
    },

    // US-02: el asistente activa su perfil de organizador y recibe un token nuevo con ese rol
    async activarOrganizador(nombreOrganizador) {
      const { data } = await api.post('/Usuario/activar-organizador', { nombreOrganizador })
      this.guardarSesion(data.datos)
      return data.mensaje
    },

    // Si el token ya venció, se cierra la sesión sin esperar el 401 de la API
    revisarVencimiento() {
      const vence = this.token ? venceEn(this.token) : null
      if (vence && vence < Date.now()) this.logout()
    },

    logout() {
      this.token = null
      this.usuario = null
      localStorage.removeItem('token')
      localStorage.removeItem('usuario')
    },
  },
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useAuthStore, import.meta.hot))
}
