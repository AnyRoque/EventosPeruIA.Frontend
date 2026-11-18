<template>
  <div class="position-fixed bottom-0 end-0 m-4" style="z-index: 1050;">
    <div
      v-if="abierto"
      class="card shadow-lg mb-3"
      style="width: 340px; height: 440px;"
    >
      <div
        class="card-header bg-primary text-white d-flex justify-content-between align-items-center"
      >
        <span class="fw-semibold">Asistente EventosPeruIA</span>
        <button
          type="button"
          class="btn-close btn-close-white"
          aria-label="Cerrar asistente"
          @click="abierto = false"
        ></button>
      </div>

      <div
        ref="contenedorMensajes"
        class="card-body overflow-auto d-flex flex-column gap-2"
        style="background-color: #f8f9fa;"
      >
        <div
          v-for="(msg, index) in mensajes"
          :key="index"
          :class="[
            'p-2 rounded-3 small',
            msg.remitente === 'usuario'
              ? 'bg-primary text-white align-self-end'
              : 'bg-white border text-dark align-self-start',
          ]"
          style="max-width: 82%; white-space: pre-wrap;"
        >
          {{ msg.texto }}
        </div>

        <div v-if="cargando" class="text-muted small fst-italic align-self-start">
          Escribiendo...
        </div>
      </div>

      <div class="card-footer bg-white p-2">
        <form class="d-flex gap-2" @submit.prevent="enviarMensaje">
          <input
            v-model="nuevoMensaje"
            type="text"
            class="form-control form-control-sm"
            placeholder="Escribe tu consulta..."
            :disabled="cargando"
          />
          <button
            type="submit"
            class="btn btn-primary btn-sm"
            :disabled="cargando || !nuevoMensaje.trim()"
          >
            Enviar
          </button>
        </form>
      </div>
    </div>

    <div class="d-flex justify-content-end">
      <button
        class="btn btn-primary rounded-circle shadow d-flex align-items-center justify-content-center"
        style="width: 56px; height: 56px; font-size: 1.4rem;"
        title="Abrir asistente"
        :aria-expanded="abierto"
        aria-label="Abrir asistente"
        @click="abierto = !abierto"
      >
        {{ abierto ? "✕" : "💬" }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { nextTick, ref } from "vue";
import api from "../api/axios";

const abierto = ref(false);
const nuevoMensaje = ref("");
const cargando = ref(false);
const contenedorMensajes = ref(null);

const mensajes = ref([
  {
    remitente: "bot",
    texto: "¡Hola! Soy el asistente de EventosPeruIA. ¿En qué puedo ayudarte hoy?",
  },
]);

const bajarScroll = async () => {
  await nextTick();
  if (contenedorMensajes.value) {
    contenedorMensajes.value.scrollTop = contenedorMensajes.value.scrollHeight;
  }
};

const enviarMensaje = async () => {
  const texto = nuevoMensaje.value.trim();
  if (!texto) return;

  mensajes.value.push({ remitente: "usuario", texto });
  nuevoMensaje.value = "";
  cargando.value = true;
  await bajarScroll();

  try {
    const response = await api.post("/Chat", { mensaje: texto });
    mensajes.value.push({
      remitente: "bot",
      texto: response.data.respuesta,
    });
  } catch {
    mensajes.value.push({
      remitente: "bot",
      texto: "Hubo un problema al conectar con el servidor. Inténtalo nuevamente.",
    });
  } finally {
    cargando.value = false;
    await bajarScroll();
  }
};
</script>
