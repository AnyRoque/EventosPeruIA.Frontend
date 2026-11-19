<template>
  <q-layout view="hHh lpR fff">
    <q-header class="bg-white text-dark" bordered>
      <q-toolbar class="contenedor q-py-sm">
        <!-- Celular y tablet: menú ☰ -->
        <q-btn
          flat
          round
          icon="menu"
          class="lt-md q-mr-xs"
          aria-label="Menú"
          @click="drawer = !drawer"
        />

        <q-btn flat no-caps to="/" class="q-px-sm">
          <q-icon name="confirmation_number" color="primary" size="28px" class="q-mr-sm" />
          <span class="text-h6 text-weight-bold"
            >Eventos<span class="text-primary">PeruIA</span></span
          >
        </q-btn>

        <q-space />

        <!-- Escritorio: menú según el rol -->
        <div class="gt-sm row items-center no-wrap">
          <q-btn flat no-caps label="Inicio" to="/" />
          <q-btn flat no-caps label="Eventos" to="/eventos" />
          <q-btn v-if="auth.haySesion" flat no-caps label="Mis entradas" to="/mis-entradas" />

          <q-btn-dropdown
            v-for="s in seccionesRol"
            :key="s.titulo"
            flat
            no-caps
            :icon="s.icon"
            :label="s.titulo"
          >
            <q-list style="min-width: 220px">
              <q-item v-for="i in s.items" :key="i.to" v-close-popup clickable :to="i.to">
                <q-item-section avatar><q-icon :name="i.icon" color="primary" /></q-item-section>
                <q-item-section>{{ i.label }}</q-item-section>
              </q-item>
            </q-list>
          </q-btn-dropdown>
        </div>

        <!-- Sin sesión -->
        <template v-if="!auth.haySesion">
          <q-btn flat no-caps label="Iniciar sesión" to="/login" class="q-ml-sm gt-xs" />
          <q-btn
            unelevated
            no-caps
            color="primary"
            label="Regístrate"
            to="/registro"
            class="q-ml-sm"
          />
        </template>

        <!-- Con sesión: notificaciones (US-15) y menú del usuario con su nombre -->
        <template v-else>
          <q-btn
            flat
            round
            icon="notifications"
            class="q-ml-xs"
            to="/notificaciones"
            aria-label="Notificaciones"
          >
            <q-badge v-if="noLeidas > 0" color="primary" floating>{{ noLeidas }}</q-badge>
          </q-btn>

          <q-btn flat no-caps class="q-ml-xs q-px-xs">
            <q-avatar size="34px" color="primary" text-color="white">{{ auth.iniciales }}</q-avatar>
            <span class="gt-xs q-ml-sm text-weight-medium">{{ auth.usuario.nombre }}</span>
            <q-menu anchor="bottom right" self="top right">
              <q-list style="min-width: 240px">
                <q-item>
                  <q-item-section>
                    <q-item-label class="text-weight-bold">{{ auth.nombre }}</q-item-label>
                    <q-item-label caption>{{ auth.usuario.correo }}</q-item-label>
                    <q-item-label class="q-mt-xs">
                      <q-badge
                        v-for="r in auth.roles"
                        :key="r"
                        outline
                        color="primary"
                        class="q-mr-xs"
                        >{{ r }}</q-badge
                      >
                    </q-item-label>
                  </q-item-section>
                </q-item>
                <q-separator />
                <q-item v-close-popup clickable to="/perfil">
                  <q-item-section avatar><q-icon name="person" /></q-item-section>
                  <q-item-section>Mi perfil</q-item-section>
                </q-item>
                <q-item v-close-popup clickable @click="cerrarSesion">
                  <q-item-section avatar><q-icon name="logout" /></q-item-section>
                  <q-item-section>Cerrar sesión</q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-btn>
        </template>
      </q-toolbar>
    </q-header>

    <!-- Menú lateral para celular -->
    <q-drawer v-model="drawer" overlay bordered behavior="mobile" :width="280">
      <q-list padding>
        <q-item v-if="auth.haySesion" class="q-mb-sm">
          <q-item-section avatar>
            <q-avatar color="primary" text-color="white">{{ auth.iniciales }}</q-avatar>
          </q-item-section>
          <q-item-section>
            <q-item-label class="text-weight-bold">{{ auth.nombre }}</q-item-label>
            <q-item-label caption>{{ auth.roles.join(' · ') }}</q-item-label>
          </q-item-section>
        </q-item>

        <template v-for="s in secciones" :key="s.titulo">
          <q-item-label header>{{ s.titulo }}</q-item-label>
          <q-item
            v-for="i in s.items"
            :key="i.to"
            v-ripple
            clickable
            :to="i.to"
            exact
            @click="drawer = false"
          >
            <q-item-section avatar><q-icon :name="i.icon" color="primary" /></q-item-section>
            <q-item-section>{{ i.label }}</q-item-section>
          </q-item>
        </template>

        <q-separator class="q-my-sm" />
        <q-item v-if="!auth.haySesion" v-ripple clickable to="/login" @click="drawer = false">
          <q-item-section avatar><q-icon name="login" /></q-item-section>
          <q-item-section>Iniciar sesión</q-item-section>
        </q-item>
        <q-item v-else v-ripple clickable @click="cerrarSesion">
          <q-item-section avatar><q-icon name="logout" /></q-item-section>
          <q-item-section>Cerrar sesión</q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>

    <!-- US-14 Asistente PeruIA, disponible en todas las páginas -->
    <PeruIAChat />

    <q-footer class="bg-secondary text-white">
      <div class="contenedor q-pa-md text-center text-caption">
        EventosPeruIA · Encuentra y compra entradas para eventos en todo el Perú
      </div>
    </q-footer>
  </q-layout>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useQuasar } from 'quasar'
import { useRoute, useRouter } from 'vue-router'
import { api } from '@/boot/axios'
import { useAuthStore } from '@/stores/auth-store'
import { menuPorRol } from '@/components/layout/menuPorRol'
import PeruIAChat from '@/components/peruia/PeruIAChat.vue'

const $q = useQuasar()
const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const drawer = ref(false)
const noLeidas = ref(0)
let temporizador = null

const secciones = computed(() => menuPorRol(auth))
// En escritorio, Organizador y Administración van como menús desplegables
const seccionesRol = computed(() => secciones.value.filter((s) => s.icon))

async function contarNoLeidas() {
  if (!auth.haySesion) return (noLeidas.value = 0)
  try {
    const { data } = await api.get('/Notificacion/no-leidas')
    noLeidas.value = data.noLeidas
  } catch {
    // sin conexión: se mantiene el último valor
  }
}

function cerrarSesion() {
  auth.logout()
  drawer.value = false
  $q.notify({ type: 'info', message: 'Cerraste sesión.' })
  router.push('/')
}

watch(() => [auth.token, route.fullPath], contarNoLeidas)

onMounted(() => {
  contarNoLeidas()
  temporizador = setInterval(contarNoLeidas, 30000)
})
onUnmounted(() => clearInterval(temporizador))
</script>
