<template>
  <router-view v-if="route.meta.authLayout" />
  <q-layout v-else view="hHh lpR fFf">
    <q-header class="app-header">
      <q-toolbar class="main-toolbar">
        <BrandLogo />
        <nav class="desktop-nav" aria-label="Navegación principal">
          <q-btn
            v-for="item in links"
            :key="item.to"
            flat
            no-caps
            :label="item.label"
            :to="item.to"
            :class="{ 'nav-active': route.path === item.to }"
          />
        </nav>
        <div class="header-actions">
          <q-btn
            flat
            round
            icon="notifications_none"
            to="/notificaciones"
            aria-label="Ver notificaciones"
            ><q-badge v-if="unreadCount" floating color="negative">{{
              unreadCount
            }}</q-badge></q-btn
          >
          <div v-if="session" class="profile-chip">
            <q-avatar size="35px" class="avatar-gradient">{{
              initials
            }}</q-avatar>
            <div>
              <strong
                >{{ session.nombre }}
                {{ session.apellido?.slice(0, 1) }}.</strong
              ><small>{{ session.roles?.[0] || "Usuario" }}</small>
            </div>
          </div>
          <q-btn
            v-if="session"
            flat
            no-caps
            icon="logout"
            label="Salir"
            class="logout-btn"
            @click="logout"
          />
          <q-btn
            v-else
            unelevated
            no-caps
            color="primary"
            label="Ingresar"
            to="/login"
          />
        </div>
      </q-toolbar>
      <nav class="mobile-nav" aria-label="Navegación móvil">
        <q-btn
          v-for="item in links"
          :key="item.to"
          flat
          no-caps
          :label="item.label"
          :to="item.to"
          :class="{ 'nav-active': route.path === item.to }"
        />
      </nav>
    </q-header>
    <q-page-container><router-view /></q-page-container>
    <footer class="site-footer">
      <BrandLogo /><span>Hecho para vivir el Perú.</span
      ><q-badge outline color="secondary"
        >Vista de demostración · Entrega 3</q-badge
      >
    </footer>
  </q-layout>
</template>
<script setup>
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import BrandLogo from "./components/BrandLogo.vue";
import { session, clearSession } from "./state/session.js";
import { unreadCount } from "./state/demo.js";
const route = useRoute();
const router = useRouter();
const links = [
  { to: "/inicio", label: "Inicio" },
  { to: "/explorar", label: "Explorar" },
  { to: "/mis-eventos", label: "Mis eventos" },
];
const initials = computed(
  () =>
    (session.value?.nombre?.[0] || "") + (session.value?.apellido?.[0] || ""),
);
function logout() {
  clearSession();
  router.push("/login");
}
</script>
