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
        <ul v-if="unmappedErrors.length" class="mb-0 mt-2">
          <li v-for="(message, index) in unmappedErrors" :key="index">{{ message }}</li>
        </ul>
      </div>

      <form @submit.prevent="register">
        <div class="mb-3">
          <label for="register-name" class="form-label">Nombre</label>
          <input
            id="register-name"
            v-model.trim="form.nombre"
            class="form-control"
            :class="{ 'is-invalid': fieldError('nombre') }"
            @input="clearFieldError('nombre')"
            autocomplete="name"
            required
            minlength="2"
            maxlength="50"
          />
          <div v-if="fieldError('nombre')" class="invalid-feedback">{{ fieldError('nombre') }}</div>
        </div>
        <div class="mb-3">
          <label for="register-last-name" class="form-label">Apellido</label>
          <input
            id="register-last-name"
            v-model.trim="form.apellido"
            class="form-control"
            :class="{ 'is-invalid': fieldError('apellido') }"
            @input="clearFieldError('apellido')"
            autocomplete="family-name"
            required
            minlength="2"
            maxlength="50"
          />
          <div v-if="fieldError('apellido')" class="invalid-feedback">{{ fieldError('apellido') }}</div>
        </div>
        <div class="mb-3">
          <label for="register-email" class="form-label">Correo electrónico</label>
          <input
            id="register-email"
            v-model.trim="form.correo"
            class="form-control"
            :class="{ 'is-invalid': fieldError('correo') }"
            @input="clearFieldError('correo')"
            type="email"
            autocomplete="email"
            required
            maxlength="100"
          />
          <div v-if="fieldError('correo')" class="invalid-feedback">{{ fieldError('correo') }}</div>
        </div>
        <div class="mb-3">
          <label for="register-phone" class="form-label">Celular</label>
          <input
            id="register-phone"
            v-model.trim="form.celular"
            class="form-control"
            :class="{ 'is-invalid': fieldError('celular') }"
            @input="clearFieldError('celular')"
            type="tel"
            autocomplete="tel"
            inputmode="numeric"
            pattern="9[0-9]{8}"
            minlength="9"
            maxlength="9"
            placeholder="9 dígitos, empezando en 9"
            required
          />
          <div v-if="fieldError('celular')" class="invalid-feedback">{{ fieldError('celular') }}</div>
        </div>
        <div class="mb-3">
          <label for="register-birth-date" class="form-label">Fecha de nacimiento</label>
          <input
            id="register-birth-date"
            v-model="form.fechaNacimiento"
            class="form-control"
            :class="{ 'is-invalid': fieldError('fechaNacimiento') }"
            @change="clearFieldError('fechaNacimiento')"
            type="date"
            :max="maximumBirthDate"
            autocomplete="bday"
            required
          />
          <div v-if="fieldError('fechaNacimiento')" class="invalid-feedback">
            {{ fieldError('fechaNacimiento') }}
          </div>
        </div>
        <div class="row">
          <div class="col-sm-6 mb-3">
            <label for="register-department" class="form-label">Departamento</label>
            <input
              id="register-department"
              v-model.trim="form.departamento"
              class="form-control"
              :class="{ 'is-invalid': fieldError('departamento') }"
              @input="clearFieldError('departamento')"
              required
              maxlength="50"
            />
            <div v-if="fieldError('departamento')" class="invalid-feedback">
              {{ fieldError('departamento') }}
            </div>
          </div>
          <div class="col-sm-6 mb-3">
            <label for="register-district" class="form-label">Distrito</label>
            <input
              id="register-district"
              v-model.trim="form.distrito"
              class="form-control"
              :class="{ 'is-invalid': fieldError('distrito') }"
              @input="clearFieldError('distrito')"
              required
              maxlength="50"
            />
            <div v-if="fieldError('distrito')" class="invalid-feedback">
              {{ fieldError('distrito') }}
            </div>
          </div>
        </div>
        <div class="mb-3">
          <label for="register-profile" class="form-label">¿Qué deseas hacer?</label>
          <select
            id="register-profile"
            v-model="form.perfil"
            class="form-select"
            :class="{ 'is-invalid': fieldError('perfil') }"
            @change="clearFieldError('perfil')"
            required
          >
            <option value="Comprar">Comprar entradas</option>
            <option value="Publicar">Publicar eventos</option>
            <option value="Ambas">Comprar entradas y publicar eventos</option>
          </select>
          <div v-if="fieldError('perfil')" class="invalid-feedback">{{ fieldError('perfil') }}</div>
        </div>
        <div v-if="publishesEvents" class="mb-3">
          <label for="register-organizer" class="form-label">Nombre del organizador</label>
          <input
            id="register-organizer"
            v-model.trim="form.nombreOrganizador"
            class="form-control"
            :class="{ 'is-invalid': fieldError('nombreOrganizador') }"
            @input="clearFieldError('nombreOrganizador')"
            required
            minlength="3"
            maxlength="80"
          />
          <div v-if="fieldError('nombreOrganizador')" class="invalid-feedback">
            {{ fieldError('nombreOrganizador') }}
          </div>
        </div>
        <div class="mb-3">
          <label for="register-password" class="form-label">Contraseña</label>
          <input
            id="register-password"
            v-model="form.password"
            class="form-control"
            :class="{ 'is-invalid': fieldError('password') }"
            @input="clearFieldError('password')"
            type="password"
            autocomplete="new-password"
            required
            minlength="8"
            pattern="(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).{8,}"
            title="Debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número."
          />
          <div v-if="fieldError('password')" class="invalid-feedback">{{ fieldError('password') }}</div>
        </div>
        <div class="mb-3">
          <label for="register-confirm-password" class="form-label">Confirmar contraseña</label>
          <input
            id="register-confirm-password"
            v-model="form.confirmarPassword"
            class="form-control"
            :class="{ 'is-invalid': fieldError('confirmarPassword') }"
            @input="clearFieldError('confirmarPassword')"
            type="password"
            autocomplete="new-password"
            required
            minlength="8"
          />
          <div v-if="fieldError('confirmarPassword')" class="invalid-feedback">
            {{ fieldError('confirmarPassword') }}
          </div>
        </div>
        <div class="form-check mb-4">
          <input
            id="register-terms"
            v-model="form.aceptaTerminos"
            class="form-check-input"
            :class="{ 'is-invalid': fieldError('aceptaTerminos') }"
            @change="clearFieldError('aceptaTerminos')"
            type="checkbox"
            required
          />
          <label class="form-check-label" for="register-terms">
            Acepto los términos y condiciones
          </label>
          <div v-if="fieldError('aceptaTerminos')" class="invalid-feedback">
            {{ fieldError('aceptaTerminos') }}
          </div>
        </div>
        <button class="btn btn-primary w-100" type="submit" :disabled="isSubmitting">
          {{ isSubmitting ? 'Registrando…' : 'Registrarse' }}
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
import { computed, reactive, ref } from 'vue'
import api, { getErrorMessage } from '../api/axios.js'

defineEmits(['registered'])

const form = reactive({
  nombre: '',
  apellido: '',
  correo: '',
  celular: '',
  fechaNacimiento: '',
  departamento: '',
  distrito: '',
  perfil: 'Publicar',
  nombreOrganizador: '',
  password: '',
  confirmarPassword: '',
  aceptaTerminos: false,
})
const isSubmitting = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const validationErrors = ref({})
const unmappedErrors = ref([])
const publishesEvents = computed(() => ['Publicar', 'Ambas'].includes(form.perfil))
const maximumBirthDate = new Date(new Date().setFullYear(new Date().getFullYear() - 18))
  .toISOString()
  .slice(0, 10)

function fieldError(field) {
  return validationErrors.value[field]?.join(' ') || ''
}

function clearFieldError(field) {
  if (!validationErrors.value[field]) {
    return
  }

  const updatedErrors = { ...validationErrors.value }
  delete updatedErrors[field]
  validationErrors.value = updatedErrors
}

function parseValidationErrors(error) {
  const backendErrors = error.response?.data?.errores

  if (!backendErrors || typeof backendErrors !== 'object') {
    return { fields: {}, unmapped: [] }
  }

  const formFields = new Map(Object.keys(form).map((field) => [field.toLowerCase(), field]))
  const fields = {}
  const unmapped = []

  for (const [key, value] of Object.entries(backendErrors)) {
    const messages = (Array.isArray(value) ? value : [value])
      .filter((message) => typeof message === 'string' && message.length > 0)
    const propertyName = key
      .replace(/^\$\.?/, '')
      .split('.')
      .pop()
      .replace(/^['"]|['"]$/g, '')
      .toLowerCase()

    const formField = formFields.get(propertyName)

    if (formField) {
      fields[formField] = [...(fields[formField] || []), ...messages]
    } else {
      unmapped.push(...messages.map((message) => `${key}: ${message}`))
    }
  }

  return { fields, unmapped }
}

async function register() {
  isSubmitting.value = true
  errorMessage.value = ''
  successMessage.value = ''
  validationErrors.value = {}
  unmappedErrors.value = []

  try {
    const response = await api.post('/Usuario/registro', {
      ...form,
      nombreOrganizador: publishesEvents.value ? form.nombreOrganizador : null,
    })
    successMessage.value = response.data?.mensaje || '¡Registro exitoso!'
    Object.assign(form, {
      nombre: '',
      apellido: '',
      correo: '',
      celular: '',
      fechaNacimiento: '',
      departamento: '',
      distrito: '',
      perfil: 'Publicar',
      nombreOrganizador: '',
      password: '',
      confirmarPassword: '',
      aceptaTerminos: false,
    })
  } catch (error) {
    errorMessage.value = getErrorMessage(error)
    const validation = parseValidationErrors(error)
    validationErrors.value = validation.fields
    unmappedErrors.value = validation.unmapped
  } finally {
    isSubmitting.value = false
  }
}
</script>
