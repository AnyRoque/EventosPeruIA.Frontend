<template>
  <section class="card border-0 shadow-sm mx-auto" style="max-width: 32rem">
    <div class="card-body p-4 p-md-5">
      <p class="text-primary fw-semibold mb-2">Qué bueno verte</p>
      <h1 class="h3 mb-4">Inicia sesión</h1>

      <div v-if="errorMessage" class="alert alert-danger" role="alert">
        {{ errorMessage }}
      </div>

      <form @submit.prevent="login">
        <div class="mb-3">
          <label for="login-email" class="form-label">Correo electrónico</label>
          <input
            id="login-email"
            v-model.trim="form.email"
            class="form-control"
            type="email"
            autocomplete="email"
            required
          />
        </div>
        <div class="mb-4">
          <label for="login-password" class="form-label">Contraseña</label>
          <input
            id="login-password"
            v-model="form.password"
            class="form-control"
            type="password"
            autocomplete="current-password"
            required
          />
        </div>
        <button class="btn btn-primary w-100" type="submit" :disabled="isSubmitting">
          {{ isSubmitting ? 'Ingresando…' : 'Iniciar sesión' }}
        </button>
      </form>

      <p class="text-center text-secondary mt-4 mb-0">
        ¿Todavía no tienes cuenta?
        <button class="btn btn-link p-0 align-baseline" @click="$emit('register')">
          Regístrate
        </button>
      </p>
    </div>
  </section>
</template>

<script setup>
import { reactive, ref } from 'vue'
import api, { getErrorMessage } from '../api/axios.js'

const emit = defineEmits(['logged-in', 'register'])
const form = reactive({ email: '', password: '' })
const isSubmitting = ref(false)
const errorMessage = ref('')

async function login() {
  isSubmitting.value = true
  errorMessage.value = ''

  try {
    const response = await api.post('/Auth/login', form)
    const token = response.data?.datos?.token

    if (typeof token !== 'string' || token.length === 0) {
      throw new Error('La respuesta del servidor no contiene un token válido.')
    }

    localStorage.setItem('token', token)
    localStorage.setItem('userEmail', form.email)
    emit('logged-in', { token, email: form.email })
  } catch (error) {
    errorMessage.value = getErrorMessage(error)
  } finally {
    isSubmitting.value = false
  }
}
</script>
