// Opciones del menú según el rol del usuario (las mismas en escritorio y en el menú ☰ del celular)
export function menuPorRol(auth) {
  const secciones = [
    {
      titulo: 'Explorar',
      items: [
        { label: 'Inicio', icon: 'home', to: '/' },
        { label: 'Eventos', icon: 'search', to: '/eventos' },
      ],
    },
  ]

  if (auth.haySesion) {
    secciones.push({
      titulo: 'Mi cuenta',
      items: [
        { label: 'Mis entradas', icon: 'confirmation_number', to: '/mis-entradas' },
        { label: 'Notificaciones', icon: 'notifications', to: '/notificaciones' },
        { label: 'Mi perfil', icon: 'person', to: '/perfil' },
      ],
    })
  }

  if (auth.esOrganizador) {
    secciones.push({
      titulo: 'Organizador',
      icon: 'storefront',
      items: [
        { label: 'Mis eventos', icon: 'event_note', to: '/organizador/eventos' },
        { label: 'Crear evento', icon: 'add_circle', to: '/organizador/eventos/nuevo' },
        { label: 'Check-in', icon: 'qr_code_scanner', to: '/organizador/checkin' },
        { label: 'Reportes de ventas', icon: 'bar_chart', to: '/organizador/reportes' },
      ],
    })
  }

  if (auth.esAdmin) {
    secciones.push({
      titulo: 'Administración',
      icon: 'admin_panel_settings',
      items: [
        { label: 'Moderación', icon: 'gavel', to: '/admin/moderacion' },
        { label: 'Categorías', icon: 'category', to: '/admin/categorias' },
      ],
    })
  }

  return secciones
}
