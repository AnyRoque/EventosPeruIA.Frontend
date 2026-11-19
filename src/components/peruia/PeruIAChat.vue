<template>
  <!-- Botón flotante -->
  <q-page-sticky position="bottom-right" :offset="[18, 18]" style="z-index: 2000">
    <q-btn
      v-if="!abierto"
      round
      size="lg"
      color="primary"
      icon="auto_awesome"
      @click="abierto = true"
    >
      <q-tooltip>Pregúntale a PeruIA</q-tooltip>
    </q-btn>
  </q-page-sticky>

  <q-dialog v-model="abierto" position="right" :maximized="$q.screen.lt.sm" seamless>
    <q-card class="chat column no-wrap">
      <q-card-section class="row items-center bg-secondary text-white q-py-sm">
        <q-avatar color="primary" text-color="white" icon="auto_awesome" size="36px" />
        <div class="q-ml-sm">
          <div class="text-weight-bold">PeruIA</div>
          <div class="text-caption" style="opacity: 0.8">Te ayuda a encontrar eventos</div>
        </div>
        <q-space />
        <q-btn flat round dense icon="delete_sweep" @click="reiniciar"
          ><q-tooltip>Nueva conversación</q-tooltip></q-btn
        >
        <q-btn flat round dense icon="close" @click="abierto = false" />
      </q-card-section>

      <q-scroll-area ref="scroll" class="col q-pa-md">
        <div v-for="(m, i) in mensajes" :key="i" class="q-mb-md">
          <q-chat-message
            :text="[m.texto]"
            :sent="m.rol === 'usuario'"
            :bg-color="m.rol === 'usuario' ? 'primary' : 'grey-2'"
            :text-color="m.rol === 'usuario' ? 'white' : 'dark'"
            text-html
          />
          <!-- Eventos reales que recomienda PeruIA -->
          <div v-if="m.eventos?.length" class="q-gutter-sm">
            <q-card
              v-for="e in m.eventos"
              :key="e.idEvento"
              flat
              bordered
              class="cursor-pointer evento-ia"
              @click="verEvento(e.idEvento)"
            >
              <q-card-section class="q-py-sm">
                <div class="text-weight-bold">{{ e.nombre }}</div>
                <div class="text-caption text-grey-7">
                  {{ e.categoria }} · {{ fechaCorta(e.fechaHoraInicio) }}
                  {{ hora(e.fechaHoraInicio) }} · {{ e.lugar }}
                </div>
                <div class="row items-center justify-between q-mt-xs">
                  <span class="text-weight-bold text-primary">{{ e.precioTexto }}</span>
                  <span class="text-caption">{{ e.cuposDisponibles }} cupos</span>
                </div>
                <div v-if="e.motivo" class="text-caption text-brown-9 q-mt-xs">
                  <q-icon name="auto_awesome" size="14px" /> {{ e.motivo }}
                </div>
              </q-card-section>
            </q-card>
          </div>
        </div>
        <q-chat-message v-if="enviando" bg-color="grey-2">
          <q-spinner-dots size="2rem" />
        </q-chat-message>
      </q-scroll-area>

      <div v-if="mensajes.length <= 1" class="q-px-md q-pb-sm q-gutter-xs">
        <q-chip
          v-for="s in sugerencias"
          :key="s"
          clickable
          outline
          color="primary"
          @click="enviar(s)"
          >{{ s }}</q-chip
        >
      </div>

      <q-form class="row items-center q-pa-sm no-wrap" @submit="enviar()">
        <q-input
          v-model="texto"
          class="col"
          dense
          outlined
          maxlength="500"
          placeholder="Ej: algo de música este fin de semana en Lima"
          :disable="enviando"
        />
        <q-btn
          type="submit"
          round
          flat
          color="primary"
          icon="send"
          :disable="!texto.trim() || enviando"
        />
      </q-form>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { nextTick, ref } from 'vue'
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'
import { api, mensajeError } from '@/boot/axios'
import { fechaCorta, hora } from '@/utils/formato'

const $q = useQuasar()
const router = useRouter()

const bienvenida = {
  rol: 'asistente',
  texto:
    '¡Hola! Soy <b>PeruIA</b>. Cuéntame qué te gustaría hacer y te recomiendo eventos reales de la plataforma.',
}
const sugerencias = ['Conciertos en Lima', 'Algo gratis este mes', 'Talleres para principiantes']

const abierto = ref(false)
const texto = ref('')
const enviando = ref(false)
const mensajes = ref([bienvenida])
const scroll = ref(null)

function escapar(t) {
  return t.replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c],
  )
}

async function bajar() {
  await nextTick()
  scroll.value?.setScrollPercentage('vertical', 1, 200)
}

async function enviar(pregunta) {
  const mensaje = (pregunta ?? texto.value).trim()
  if (!mensaje) return
  texto.value = ''

  // Historial previo (máximo 10 mensajes, sin el saludo)
  const historial = mensajes.value
    .slice(1)
    .slice(-10)
    .map((m) => ({ rol: m.rol, texto: m.textoPlano ?? m.texto }))

  mensajes.value.push({ rol: 'usuario', texto: escapar(mensaje), textoPlano: mensaje })
  enviando.value = true
  bajar()

  try {
    const { data } = await api.post('/PeruIA/chat', { mensaje, historial })
    const r = data.datos
    mensajes.value.push({
      rol: 'asistente',
      texto: escapar(r.respuesta).replace(/\n/g, '<br>'),
      textoPlano: r.respuesta,
      eventos: r.eventos,
    })
  } catch (e) {
    mensajes.value.push({ rol: 'asistente', texto: escapar(mensajeError(e)), textoPlano: '' })
  } finally {
    enviando.value = false
    bajar()
  }
}

function reiniciar() {
  mensajes.value = [bienvenida]
}

function verEvento(id) {
  if ($q.screen.lt.sm) abierto.value = false
  router.push(`/eventos/${id}`)
}
</script>

<style scoped>
.chat {
  width: 380px;
  max-width: 100vw;
  height: 600px;
  max-height: 85vh;
}
.evento-ia {
  border-radius: 10px;
}
.evento-ia:hover {
  border-color: var(--q-primary);
}
</style>
