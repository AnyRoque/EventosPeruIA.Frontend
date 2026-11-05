<template>
  <section class="card border-0 shadow-sm mx-auto" style="max-width: 32rem">
    <div class="card-body p-4 p-md-5">
      <p class="text-primary fw-semibold mb-2">Crea tu cuenta</p>
      <h1 class="h3 mb-4">Regístrate en EventosPeruIA</h1>

      <div v-if="successMessage" class="alert alert-success" role="status">
        {{ successMessage }}
      </div>
      <div v-if="errorMessage" class="alert alert-danger" role="alert">
        {{ errorMessage }}
      </div>

      <form @submit.prevent="register">
        <div class="mb-3">
          <label for="register-name" class="form-label">Nombre</label>
          <input
            id="register-name"
            v-model.trim="form.nombre"
            class="form-control"
            autocomplete="name"
            required
            maxlength="120"
          />
        </div>
        <div class="mb-3">
          <label for="register-email" class="form-label">Correo electrónico</label>
          <input
            id="register-email"
            v-model.trim="form.email"
            class="form-control"
            type="email"
            autocomplete="email"
            required
          />
        </div>
        <div class="mb-3">
          <label for="register-password" class="form-label">Contraseña</label>
          <input
            id="register-password"
            v-model="form.password"
            class="form-control"
            type="password"
            autocomplete="new-password"
            required
            minlength="8"
          />
        </div>
        <div class="mb-4">
          <label for="register-role" class="form-label">Rol</label>
          <select id="register-role" v-model="form.rol" class="form-select" required>
            <option value="Organizador">Organizador</option>
            <option value="Asistente">Asistente</option>
          </select>
        </div>
        <button class="btn btn-primary w-100" type="submit" :disabled="isSubmitting">
          {{ isSubmitting ? 'Creando cuenta…' : 'Crear cuenta' }}
        </button>
      </form>

      <p class="text-center text-secondary mt-4 mb-0">
        ¿Ya tienes cuenta?
        <button class="btn btn-link p-0 align-baseline" @click="$emit('registered')">
          Inicia sesión
        </button>
      </p>
    </div>
  </section>
</template>

<script setup>
import { reactive, ref } from 'vue'
import api, { getErrorMessage } from '../api/axios.js'

defineEmits(['registered'])

const form = reactive({
  nombre: '',
  email: '',
  password: '',
  rol: 'Organizador',
})
const isSubmitting = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

async function register() {
  isSubmitting.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    await api.post('/Auth/registro', form)
    successMessage.value = 'Tu cuenta se creó correctamente. Ya puedes iniciar sesión.'
    form.nombre = ''
    form.email = ''
    form.password = ''
  } catch (error) {
    errorMessage.value = getErrorMessage(error)
  } finally {
    isSubmitting.value = false
  }
}
</script>
