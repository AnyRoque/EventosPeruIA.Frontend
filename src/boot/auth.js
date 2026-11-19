import { defineBoot } from '#q-app'
import { useAuthStore } from '@/stores/auth-store'

// Rutas protegidas: qué rol se necesita para entrar a cada sección
const reglas = [
  { prefijo: '/admin', rol: 'Administrador' },
  { prefijo: '/organizador', rol: 'Organizador' },
  { prefijo: '/mis-entradas', rol: null },
  { prefijo: '/notificaciones', rol: null },
  { prefijo: '/perfil', rol: null },
]

export default defineBoot(({ router }) => {
  router.beforeEach((to) => {
    const auth = useAuthStore()
    auth.revisarVencimiento()

    const regla = reglas.find((r) => to.path.startsWith(r.prefijo))
    if (!regla) return true

    if (!auth.haySesion) return { path: '/login', query: { redirect: to.fullPath } }
    if (regla.rol && !auth.tieneRol(regla.rol)) return '/acceso-denegado'
    return true
  })
})
