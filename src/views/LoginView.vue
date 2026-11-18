<template>
  <main class="login-layout">
    <section class="login-brand-panel">
      <div class="login-brand-content">
        <BrandLogo compact />
        <h1 class="gradient-text">EventosPeruIA</h1>
        <p class="brand-description">
          Descubre, conecta y vive los mejores<br class="desktop-only" />
          eventos del Perú con el poder de la IA.
        </p>
        <div class="brand-features">
          <div>
            <q-icon name="auto_awesome" color="secondary" /><span
              >Experiencias que conectan contigo</span
            >
          </div>
          <div>
            <q-icon name="confirmation_number" color="primary" /><span
              >Todos tus eventos, en un solo lugar</span
            >
          </div>
          <div>
            <q-icon name="groups" color="secondary" /><span
              >Una comunidad que comparte tu pasión</span
            >
          </div>
          <div>
            <q-icon name="public" color="primary" /><span
              >Los mejores eventos del Perú</span
            >
          </div>
        </div>
      </div>
      <span class="brand-footnote">TU PRÓXIMA HISTORIA EMPIEZA AQUÍ</span>
    </section>
    <section class="login-form-panel">
      <div class="login-form-content">
        <p class="eyebrow">VUELVE A CONECTAR</p>
        <h2>Bienvenido de vuelta</h2>
        <p class="muted intro-copy">Ingresa tus credenciales para continuar</p>
        <q-banner
          v-if="errorMessage"
          rounded
          class="error-banner q-mb-lg"
          role="alert"
          ><template #avatar><q-icon name="error_outline" /></template
          >{{ errorMessage }}</q-banner
        >
        <q-form @submit="login" class="form-stack">
          <q-input
            v-model.trim="form.correo"
            outlined
            label="Correo electrónico"
            placeholder="tu@email.com"
            type="email"
            autocomplete="email"
            :rules="[emailRule]"
            lazy-rules
            hide-bottom-space
          />
          <q-input
            v-model="form.password"
            outlined
            label="Contraseña"
            :type="showPassword ? 'text' : 'password'"
            autocomplete="current-password"
            :rules="[(v) => !!v || 'Ingresa tu contraseña']"
            lazy-rules
            hide-bottom-space
            ><template #append
              ><q-btn
                flat
                round
                dense
                :icon="showPassword ? 'visibility_off' : 'visibility'"
                :aria-label="
                  showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'
                "
                @click="showPassword = !showPassword" /></template
          ></q-input>
          <q-btn
            class="full-width primary-action"
            unelevated
            no-caps
            color="primary"
            type="submit"
            label="Iniciar sesión"
            :loading="loading"
          />
        </q-form>
        <div class="quick-access">
          <span class="eyebrow">CUENTAS DE PRUEBA</span>
          <div class="row q-gutter-sm q-mt-xs">
            <q-btn
              v-for="role in roles"
              :key="role.label"
              no-caps
              outline
              :label="role.label"
              @click="fillAccount(role.email)"
            />
          </div>
          <small class="muted"
            >Selecciona una cuenta para completar el formulario.</small
          >
        </div>
        <p class="auth-link">
          ¿No tienes una cuenta?
          <router-link to="/registro">Regístrate</router-link>
        </p>
        <q-btn
          flat
          no-caps
          class="preview-link"
          icon-right="arrow_forward"
          label="Explorar la demostración"
          to="/inicio"
        />
      </div>
    </section>
  </main>
</template>
<script setup>
import { reactive, ref } from "vue";
import { useRouter } from "vue-router";
import BrandLogo from "../components/BrandLogo.vue";
import api, { getErrorMessage } from "../api/axios.js";
import { saveSession } from "../state/session.js";
const router = useRouter();
const form = reactive({ correo: "", password: "" });
const loading = ref(false);
const showPassword = ref(false);
const errorMessage = ref("");
const roles = [
  { label: "Asistente", email: "asistente.demo@example.test" },
  { label: "Organizador", email: "organizador.demo@example.test" },
  { label: "Admin", email: "admin.demo@example.test" },
];
const emailRule = (v) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || "Ingresa un correo válido";
function fillAccount(email) {
  form.correo = email;
  form.password = "Prueba123";
  errorMessage.value = "";
}
async function login() {
  if (loading.value) return;
  loading.value = true;
  errorMessage.value = "";
  try {
    const { data } = await api.post("/Usuario/login", {
      correo: form.correo,
      password: form.password,
    });
    if (!data.datos?.token || !data.datos?.correo)
      throw new Error("Respuesta de sesión inválida");
    saveSession(data.datos);
    form.password = "";
    await router.push("/inicio");
  } catch (error) {
    errorMessage.value = getErrorMessage(error);
  } finally {
    loading.value = false;
  }
}
</script>
