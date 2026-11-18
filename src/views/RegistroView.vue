<template>
  <main class="register-layout">
    <q-btn
      flat
      no-caps
      icon="arrow_back"
      label="Volver al inicio de sesión"
      to="/login"
      class="register-back"
    />
    <section class="register-card">
      <div class="register-heading">
        <BrandLogo compact />
        <h1>Crear cuenta</h1>
        <p class="muted">Únete a EventosPeruIA</p>
        <q-badge outline color="secondary">Registro</q-badge>
      </div>

      <q-banner
        v-if="successMessage"
        class="success-banner q-mb-lg"
        rounded
        role="status"
      >
        {{ successMessage }}
      </q-banner>
      <q-banner
        v-if="errorMessage"
        class="error-banner q-mb-lg"
        rounded
        role="alert"
      >
        <template #avatar><q-icon name="error_outline" /></template>
        {{ errorMessage }}
        <ul v-if="unmappedErrors.length" class="q-mb-none q-mt-sm">
          <li v-for="(message, index) in unmappedErrors" :key="index">
            {{ message }}
          </li>
        </ul>
      </q-banner>

      <q-form class="form-stack" @submit="register">
        <div class="form-grid">
          <q-input
            v-model.trim="form.nombre"
            label="Nombre *"
            outlined
            autocomplete="given-name"
            :rules="[required]"
            lazy-rules
            hide-bottom-space
            @update:model-value="clearFieldError('nombre')"
          />
          <q-input
            v-model.trim="form.apellido"
            label="Apellido *"
            outlined
            autocomplete="family-name"
            :rules="[required]"
            lazy-rules
            hide-bottom-space
            @update:model-value="clearFieldError('apellido')"
          />
        </div>
        <q-input
          v-model.trim="form.correo"
          label="Correo electrónico *"
          type="email"
          outlined
          autocomplete="email"
          :rules="[emailRule]"
          lazy-rules
          hide-bottom-space
          @update:model-value="clearFieldError('correo')"
        />
        <div class="form-grid">
          <q-input
            v-model.trim="form.celular"
            label="Celular *"
            outlined
            type="tel"
            inputmode="numeric"
            maxlength="9"
            autocomplete="tel"
            :rules="[phoneRule]"
            lazy-rules
            hide-bottom-space
            @update:model-value="clearFieldError('celular')"
          />
          <q-input
            v-model="form.fechaNacimiento"
            label="Fecha de nacimiento *"
            outlined
            type="date"
            :max="maximumBirthDate"
            :rules="[required]"
            lazy-rules
            hide-bottom-space
            @update:model-value="clearFieldError('fechaNacimiento')"
          />
        </div>
        <div class="form-grid">
          <q-input
            v-model.trim="form.departamento"
            label="Departamento *"
            outlined
            :rules="[required]"
            lazy-rules
            hide-bottom-space
            @update:model-value="clearFieldError('departamento')"
          />
          <q-input
            v-model.trim="form.distrito"
            label="Distrito *"
            outlined
            :rules="[required]"
            lazy-rules
            hide-bottom-space
            @update:model-value="clearFieldError('distrito')"
          />
        </div>
        <q-select
          v-model="form.perfil"
          label="¿Qué deseas hacer? *"
          outlined
          emit-value
          map-options
          :options="profileOptions"
          :rules="[required]"
          lazy-rules
          hide-bottom-space
        />
        <q-input
          v-if="publishesEvents"
          v-model.trim="form.nombreOrganizador"
          label="Nombre del organizador *"
          outlined
          :rules="[required]"
          lazy-rules
          hide-bottom-space
          @update:model-value="clearFieldError('nombreOrganizador')"
        />
        <div class="form-grid">
          <q-input
            v-model="form.password"
            label="Contraseña *"
            :type="showPassword ? 'text' : 'password'"
            outlined
            autocomplete="new-password"
            :rules="[passwordRule]"
            lazy-rules
            hide-bottom-space
          >
            <template #append>
              <q-btn
                flat
                round
                dense
                :icon="showPassword ? 'visibility_off' : 'visibility'"
                aria-label="Mostrar u ocultar contraseña"
                @click="showPassword = !showPassword"
              />
            </template>
          </q-input>
          <q-input
            v-model="form.confirmarPassword"
            label="Confirmar contraseña *"
            type="password"
            outlined
            autocomplete="new-password"
            :rules="[confirmationRule]"
            lazy-rules
            hide-bottom-space
          />
        </div>
        <q-checkbox
          v-model="form.aceptaTerminos"
          label="Acepto los términos y condiciones"
          :rules="[(value) => value || 'Debes aceptar los términos']"
        />
        <q-btn
          unelevated
          color="primary"
          no-caps
          class="primary-action"
          type="submit"
          label="Crear cuenta"
          :loading="isSubmitting"
        />
      </q-form>

      <p class="auth-link">
        ¿Ya tienes una cuenta?
        <router-link to="/login">Inicia sesión</router-link>
      </p>
    </section>
  </main>
</template>

<script setup>
import { computed, reactive, ref } from "vue";
import BrandLogo from "../components/BrandLogo.vue";
import api, { getErrorMessage } from "../api/axios.js";

const form = reactive({
  nombre: "",
  apellido: "",
  correo: "",
  celular: "",
  fechaNacimiento: "",
  departamento: "",
  distrito: "",
  perfil: "Publicar",
  nombreOrganizador: "",
  password: "",
  confirmarPassword: "",
  aceptaTerminos: false,
});
const isSubmitting = ref(false);
const showPassword = ref(false);
const errorMessage = ref("");
const successMessage = ref("");
const validationErrors = ref({});
const unmappedErrors = ref([]);
const profileOptions = [
  { label: "Comprar entradas", value: "Comprar" },
  { label: "Publicar eventos", value: "Publicar" },
  { label: "Comprar entradas y publicar eventos", value: "Ambas" },
];
const publishesEvents = computed(() =>
  ["Publicar", "Ambas"].includes(form.perfil),
);
const maximumBirthDate = new Date(
  new Date().setFullYear(new Date().getFullYear() - 18),
)
  .toISOString()
  .slice(0, 10);
const required = (value) =>
  String(value || "").trim().length >= 2 || "Ingresa al menos 2 caracteres";
const emailRule = (value) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) || "Ingresa un correo válido";
const phoneRule = (value) =>
  /^9\d{8}$/.test(value) || "Ingresa un celular válido de 9 dígitos";
const passwordRule = (value) =>
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(value) ||
  "Usa 8 caracteres, mayúscula, minúscula y número";
const confirmationRule = (value) =>
  value === form.password || "Las contraseñas deben coincidir";

function clearFieldError(field) {
  if (!validationErrors.value[field]) return;
  const updatedErrors = { ...validationErrors.value };
  delete updatedErrors[field];
  validationErrors.value = updatedErrors;
}

function parseValidationErrors(error) {
  const backendErrors = error.response?.data?.errores;
  if (!backendErrors || typeof backendErrors !== "object") {
    return { fields: {}, unmapped: [] };
  }
  const formFields = new Map(
    Object.keys(form).map((field) => [field.toLowerCase(), field]),
  );
  const fields = {};
  const unmapped = [];
  for (const [key, value] of Object.entries(backendErrors)) {
    const messages = (Array.isArray(value) ? value : [value]).filter(
      (message) => typeof message === "string" && message.length > 0,
    );
    const propertyName = key
      .replace(/^\$\.?/, "")
      .split(".")
      .pop()
      .replace(/^['"]|['"]$/g, "")
      .toLowerCase();
    const formField = formFields.get(propertyName);
    if (formField) {
      fields[formField] = [...(fields[formField] || []), ...messages];
    } else {
      unmapped.push(...messages.map((message) => `${key}: ${message}`));
    }
  }
  return { fields, unmapped };
}

async function register() {
  isSubmitting.value = true;
  errorMessage.value = "";
  successMessage.value = "";
  validationErrors.value = {};
  unmappedErrors.value = [];
  try {
    const response = await api.post("/Usuario/registro", {
      ...form,
      nombreOrganizador: publishesEvents.value ? form.nombreOrganizador : null,
    });
    successMessage.value = response.data?.mensaje || "¡Registro exitoso!";
  } catch (error) {
    errorMessage.value = getErrorMessage(error);
    const validation = parseValidationErrors(error);
    validationErrors.value = validation.fields;
    unmappedErrors.value = validation.unmapped;
  } finally {
    isSubmitting.value = false;
  }
}
</script>
