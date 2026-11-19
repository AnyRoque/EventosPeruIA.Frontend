import { API_HOST } from '@/boot/axios'

// Funciones de apoyo para mostrar los datos de la API

export function fechaLarga(valor) {
  return new Date(valor).toLocaleDateString('es-PE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export function fechaCorta(valor) {
  return new Date(valor).toLocaleDateString('es-PE', { day: '2-digit', month: 'short' })
}

export function hora(valor) {
  return new Date(valor).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })
}

// Ícono y color de cada categoría (los eventos de prueba no tienen imagen)
const estilos = {
  Concierto: { icono: 'music_note', fondo: 'linear-gradient(135deg, #c8102e, #7b2cbf)' },
  Taller: { icono: 'palette', fondo: 'linear-gradient(135deg, #f4a261, #e76f51)' },
  Feria: { icono: 'storefront', fondo: 'linear-gradient(135deg, #2a9d8f, #264653)' },
  Charla: { icono: 'record_voice_over', fondo: 'linear-gradient(135deg, #1b263b, #415a77)' },
}

export function estiloCategoria(categoria) {
  return (
    estilos[categoria] ?? { icono: 'event', fondo: 'linear-gradient(135deg, #6c757d, #343a40)' }
  )
}

export const departamentos = [
  'Amazonas',
  'Áncash',
  'Apurímac',
  'Arequipa',
  'Ayacucho',
  'Cajamarca',
  'Callao',
  'Cusco',
  'Huancavelica',
  'Huánuco',
  'Ica',
  'Junín',
  'La Libertad',
  'Lambayeque',
  'Lima',
  'Loreto',
  'Madre de Dios',
  'Moquegua',
  'Pasco',
  'Piura',
  'Puno',
  'San Martín',
  'Tacna',
  'Tumbes',
  'Ucayali',
]

// La API devuelve la ruta de la imagen ("/imagenes/eventos/archivo.jpg"): se le añade el host

export function urlImagen(ruta) {
  if (!ruta) return null
  return ruta.startsWith('http') ? ruta : `${API_HOST}${ruta}`
}

export function soles(monto) {
  return `S/ ${Number(monto ?? 0).toLocaleString('es-PE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

export function fechaHora(valor) {
  return new Date(valor).toLocaleString('es-PE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// Descarga un archivo (PDF, Excel) que la API devuelve con el token
export async function descargar(api, url, nombre, params) {
  const respuesta = await api.get(url, { params, responseType: 'blob' })
  const enlace = document.createElement('a')
  enlace.href = URL.createObjectURL(respuesta.data)
  const cabecera = respuesta.headers['content-disposition'] || ''
  const coincide = /filename\*?=(?:UTF-8'')?"?([^";]+)"?/i.exec(cabecera)
  enlace.download = coincide ? decodeURIComponent(coincide[1]) : nombre
  enlace.click()
  URL.revokeObjectURL(enlace.href)
}

// Color del chip según el estado (eventos, entradas, usuarios)
export function colorEstado(estado) {
  const colores = {
    Publicado: 'positive',
    Activo: 'positive',
    Activa: 'positive',
    Visible: 'positive',
    Valida: 'positive',
    Pagada: 'positive',
    Borrador: 'grey-7',
    Utilizada: 'blue-grey',
    Finalizado: 'blue-grey',
    Cancelado: 'negative',
    Anulada: 'negative',
    Suspendido: 'orange-9',
    Oculta: 'orange-9',
    Inactiva: 'grey-7',
  }
  return colores[estado] ?? 'grey-7'
}
