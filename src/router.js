import { createRouter, createWebHashHistory } from "vue-router";
import LoginView from "./views/LoginView.vue";
import RegistroView from "./views/RegistroView.vue";
import InicioView from "./views/InicioView.vue";
import ExplorarView from "./views/ExplorarView.vue";
import NotificacionesView from "./views/NotificacionesView.vue";
import EventosOrganizadorView from "./views/EventosOrganizadorView.vue";
const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: "/", redirect: "/login" },
    {
      path: "/login",
      component: LoginView,
      meta: { authLayout: true, title: "Iniciar sesión" },
    },
    {
      path: "/registro",
      component: RegistroView,
      meta: { authLayout: true, title: "Crear cuenta" },
    },
    { path: "/inicio", component: InicioView, meta: { title: "Inicio" } },
    {
      path: "/explorar",
      component: ExplorarView,
      meta: { title: "Explorar eventos" },
    },
    {
      path: "/notificaciones",
      component: NotificacionesView,
      meta: { title: "Notificaciones" },
    },
    {
      path: "/mis-eventos",
      component: EventosOrganizadorView,
      meta: { title: "Mis eventos" },
    },
    { path: "/:pathMatch(.*)*", redirect: "/inicio" },
  ],
  scrollBehavior: () => ({ top: 0 }),
});
router.afterEach((to) => {
  document.title = to.meta.title + " · EventosPeruIA";
});
export default router;
