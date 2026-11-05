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
        <q-badge outline color="secondary">Registro de demostración</q-badge>
      </div>
      <q-banner
        v-if="complete"
        class="success-banner q-mb-lg"
        rounded
        role="status"
        >¡Todo listo, {{ form.nombre }}! Tu formulario es válido. Esta pantalla
        es una demostración: aún no crea cuentas en la base de datos.</q-banner
      >
      <q-form @submit="submit" class="form-stack">
        <div class="form-grid">
          <q-input
            v-model.trim="form.nombre"
            label="Nombre *"
            outlined
            autocomplete="given-name"
            :rules="[required]"
            lazy-rules
            hide-bottom-space
          /><q-input
            v-model.trim="form.apellido"
            label="Apellido *"
            outlined
            autocomplete="family-name"
            :rules="[required]"
            lazy-rules
            hide-bottom-space
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
            ><template #append
              ><q-btn
                flat
                round
                dense
                :icon="showPassword ? 'visibility_off' : 'visibility'"
                aria-label="Mostrar u ocultar contraseña"
                @click="showPassword = !showPassword" /></template></q-input
          ><q-input
            v-model="form.confirmar"
            label="Confirmar contraseña *"
            type="password"
            outlined
            autocomplete="new-password"
            :rules="[
              (v) =>
                (!!v && v === form.password) ||
                'Las contraseñas deben coincidir',
            ]"
            lazy-rules
            hide-bottom-space
          />
        </div>
        <fieldset class="role-picker">
          <legend>Tipo de usuario</legend>
          <div class="form-grid">
            <q-btn
              v-for="role in ['Asistente', 'Organizador']"
              :key="role"
              outline
              no-caps
              :class="{ selected: form.rol === role }"
              :aria-pressed="form.rol === role"
              @click="form.rol = role"
              ><span
                ><q-icon
                  :name="
                    role === 'Asistente' ? 'confirmation_number' : 'festival'
                  "
                  size="30px"
                /><strong>{{ role }}</strong></span
              ></q-btn
            >
          </div>
        </fieldset>
        <q-btn
          unelevated
          color="primary"
          no-caps
          class="primary-action"
          type="submit"
          label="Crear cuenta"
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
import { reactive, ref } from "vue";
import BrandLogo from "../components/BrandLogo.vue";
const form = reactive({
  nombre: "",
  apellido: "",
  correo: "",
  password: "",
  confirmar: "",
  rol: "Asistente",
});
const showPassword = ref(false);
const complete = ref(false);
const required = (v) => v.trim().length >= 2 || "Ingresa al menos 2 caracteres";
const emailRule = (v) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || "Ingresa un correo válido";
const passwordRule = (v) =>
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(v) ||
  "Usa 8 caracteres, mayúscula, minúscula y número";
function submit() {
  complete.value = true;
}
</script>
