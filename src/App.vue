<template>
  <div class="min-vh-100 bg-light">
    <nav class="navbar navbar-expand bg-white border-bottom">
      <div class="container">
        <a class="navbar-brand fw-bold text-primary" href="#" @click.prevent="goHome">
          EventosPeruIA
        </a>
        <div class="d-flex align-items-center gap-3">
          <template v-if="isAuthenticated">
            <span class="text-secondary small d-none d-sm-inline">{{ userEmail }}</span>
            <button class="btn btn-outline-secondary btn-sm" @click="logout">Cerrar sesión</button>
          </template>
          <template v-else>
            <button
              class="btn btn-link btn-sm text-decoration-none"
              @click="currentPage = 'login'"
            >
              Iniciar sesión
            </button>
            <button class="btn btn-primary btn-sm" @click="currentPage = 'register'">
              Crear cuenta
            </button>
          </template>
        </div>
      </div>
    </nav>

    <main class="container py-5">
      <template v-if="isAuthenticated">
        <EventosOrganizadorView />
      </template>
      <template v-else-if="currentPage === 'register'">
        <RegistroView @registered="currentPage = 'login'" />
      </template>
      <template v-else-if="currentPage === 'login'">
        <LoginView @logged-in="handleLogin" @register="currentPage = 'register'" />
      </template>
      <section v-else class="text-center py-5">
        <p class="text-uppercase text-primary fw-semibold mb-2">EventosPeruIA</p>
        <h1 class="display-5 fw-bold">Descubre eventos cerca de ti</h1>
        <p class="lead text-secondary mb-4">
          Organiza tus eventos y mantén informados a tus asistentes.
        </p>
        <button class="btn btn-primary btn-lg" @click="currentPage = 'register'">
          Comenzar
        </button>
      </section>
    </main>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import EventosOrganizadorView from './views/EventosOrganizadorView.vue'
import LoginView from './views/LoginView.vue'
import RegistroView from './views/RegistroView.vue'

const currentPage = ref('home')
const token = ref(localStorage.getItem('token'))
const userEmail = ref(localStorage.getItem('userEmail') || '')
const isAuthenticated = computed(() => Boolean(token.value))

function handleLogin(credentials) {
  token.value = credentials.token
  userEmail.value = credentials.email
  currentPage.value = 'events'
}

function logout() {
  localStorage.removeItem('token')
  localStorage.removeItem('userEmail')
  token.value = null
  userEmail.value = ''
  currentPage.value = 'home'
}

function goHome() {
  currentPage.value = isAuthenticated.value ? 'events' : 'home'
}
</script>
