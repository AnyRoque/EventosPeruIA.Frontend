import { computed, ref } from "vue";
export const categories = [
  "Todos",
  "Tecnología",
  "Música",
  "Gastronomía",
  "Arte y cultura",
];
export const events = ref([
  {
    id: 1,
    titulo: "Lima Tech Summit 2026",
    categoria: "Tecnología",
    lugar: "Centro de Convenciones de Lima",
    ciudad: "Lima",
    fecha: "2026-11-20T09:00",
    precio: 89,
    aforo: 200,
    cupos: 157,
    estado: "Publicado",
    imagen: "/images/technology.jpg",
    icono: "devices",
    descripcion:
      "Un encuentro para compartir ideas que transforman el futuro. Charlas, talleres y conversaciones con la comunidad tecnológica del Perú.",
  },
  {
    id: 2,
    titulo: "Festival Sonidos del Perú",
    categoria: "Música",
    lugar: "Parque de la Exposición",
    ciudad: "Lima",
    fecha: "2026-11-22T18:00",
    precio: 45,
    aforo: 500,
    cupos: 13,
    estado: "Publicado",
    imagen: "/images/music.jpg",
    icono: "graphic_eq",
    descripcion:
      "Una noche para descubrir nuevas bandas y cantar tus canciones favoritas. Vive la energía de la música en vivo junto a tus amigos.",
  },
  {
    id: 3,
    titulo: "Sabores que nos unen",
    categoria: "Gastronomía",
    lugar: "Parque de la Amistad",
    ciudad: "Lima",
    fecha: "2026-11-28T12:00",
    precio: 25,
    aforo: 300,
    cupos: 86,
    estado: "Publicado",
    imagen: "/images/food.jpg",
    icono: "restaurant",
    descripcion:
      "Recorre los sabores del Perú en una feria que celebra nuestra cocina. Descubre propuestas locales, demostraciones y recetas con historia.",
  },
  {
    id: 4,
    titulo: "Arte bajo las estrellas",
    categoria: "Arte y cultura",
    lugar: "Centro Cultural de Barranco",
    ciudad: "Lima",
    fecha: "2026-12-04T19:00",
    precio: 0,
    aforo: 100,
    cupos: 62,
    estado: "Publicado",
    imagen: "",
    icono: "palette",
    descripcion:
      "Una exposición abierta a nuevas miradas. Conoce artistas independientes y comparte una noche de arte, fotografía y conversación.",
  },
  {
    id: 5,
    titulo: "Ideas desde los Andes",
    categoria: "Tecnología",
    lugar: "Centro de Innovación",
    ciudad: "Cusco",
    fecha: "2026-12-12T10:00",
    precio: 35,
    aforo: 120,
    cupos: 90,
    estado: "Publicado",
    imagen: "/images/technology.jpg",
    icono: "lightbulb",
    descripcion:
      "Conecta con emprendedores y descubre proyectos que nacen en nuestra región. Un espacio para aprender y construir juntos.",
  },
  {
    id: 6,
    titulo: "Encuentro de creadores",
    categoria: "Arte y cultura",
    lugar: "Casa Cultural",
    ciudad: "Arequipa",
    fecha: "2026-12-18T16:00",
    precio: 20,
    aforo: 80,
    cupos: 80,
    estado: "Borrador",
    imagen: "",
    icono: "brush",
    descripcion: "Talleres y conversaciones para explorar tu lado creativo.",
  },
]);
export const publishedEvents = computed(() =>
  events.value.filter((e) => e.estado === "Publicado"),
);
export const notifications = ref([
  {
    id: 1,
    titulo: "Tu próximo encuentro te espera",
    texto:
      "Lima Tech Summit 2026 comienza el 20 de noviembre a las 09:00. Revisa todos los detalles.",
    fecha: "2026-11-05",
    evento: 1,
    icono: "notifications_active",
    leida: false,
    tono: "purple",
  },
  {
    id: 2,
    titulo: "Cambio de horario",
    texto:
      "Festival Sonidos del Perú ha actualizado su hora de inicio a las 18:00.",
    fecha: "2026-11-04",
    evento: 2,
    icono: "campaign",
    leida: false,
    tono: "cyan",
  },
  {
    id: 3,
    titulo: "Una nueva experiencia gastronómica",
    texto: "Ya puedes conocer la programación de Sabores que nos unen.",
    fecha: "2026-11-02",
    evento: 3,
    icono: "restaurant",
    leida: true,
    tono: "purple",
  },
  {
    id: 4,
    titulo: "Bienvenido a la comunidad",
    texto:
      "Tu próxima historia está por comenzar. Explora los eventos y encuentra tu siguiente plan.",
    fecha: "2026-11-01",
    evento: null,
    icono: "auto_awesome",
    leida: true,
    tono: "cyan",
  },
]);
export const unreadCount = computed(
  () => notifications.value.filter((n) => !n.leida).length,
);
export function formatDate(value) {
  return new Intl.DateTimeFormat("es-PE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}
export function formatPrice(value) {
  return Number(value) === 0
    ? "Gratis"
    : "S/ " + Number(value).toFixed(2).replace(".00", "");
}
