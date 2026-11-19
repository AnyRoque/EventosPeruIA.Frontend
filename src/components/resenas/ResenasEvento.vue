<template>
  <section class="q-mt-lg">
    <div class="row items-center q-mb-sm">
      <div class="text-h6 text-weight-bold">Opiniones</div>
      <template v-if="resumen.totalResenas > 0">
        <q-rating
          :model-value="resumen.promedioCalificacion"
          readonly
          size="20px"
          color="amber"
          class="q-ml-md"
        />
        <span class="q-ml-sm text-grey-7"
          >{{ resumen.promedioCalificacion }} · {{ resumen.totalResenas }} reseñas</span
        >
      </template>
    </div>

    <!-- US-12: formulario para quien asistió (la API valida asistencia y plazo de 30 días) -->
    <q-card v-if="puedeOpinar && !miResena" flat bordered class="q-mb-md resena">
      <q-card-section>
        <div class="text-subtitle2">¿Asististe? Califica el evento</div>
        <q-rating
          v-model="calificacion"
          size="28px"
          color="amber"
          icon="star_border"
          icon-selected="star"
          class="q-my-sm"
        />
        <q-input
          v-model="comentario"
          outlined
          type="textarea"
          autogrow
          counter
          maxlength="500"
          label="Tu comentario (mínimo 10 caracteres)"
        />
        <q-banner v-if="error" dense rounded class="bg-red-1 text-negative q-mt-sm">{{
          error
        }}</q-banner>
        <div class="text-right q-mt-sm">
          <q-btn
            unelevated
            no-caps
            color="primary"
            label="Publicar reseña"
            :loading="guardando"
            :disable="!calificacion || comentario.trim().length < 10"
            @click="guardar"
          />
        </div>
      </q-card-section>
    </q-card>

    <div v-if="resumen.totalResenas === 0" class="text-grey-7">
      Aún no hay opiniones de este evento.
    </div>

    <q-card v-for="r in resumen.resenas" :key="r.idResena" flat bordered class="q-mb-sm resena">
      <q-card-section>
        <div class="row items-center">
          <b>{{ r.nombreUsuario }}</b>
          <q-rating
            :model-value="r.calificacion"
            readonly
            size="16px"
            color="amber"
            class="q-ml-sm"
          />
          <q-space />
          <span class="text-caption text-grey-6">{{ fechaCorta(r.fechaCreacion) }}</span>
          <q-btn
            v-if="r.idUsuario === auth.usuario?.idUsuario"
            flat
            round
            dense
            size="sm"
            icon="delete"
            color="negative"
            class="q-ml-sm"
            @click="eliminar(r)"
          >
            <q-tooltip>Eliminar mi reseña</q-tooltip>
          </q-btn>
        </div>
        <div class="q-mt-xs">{{ r.comentario }}</div>
      </q-card-section>
    </q-card>
  </section>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useQuasar } from 'quasar'
import { api, mensajeError } from '@/boot/axios'
import { useAuthStore } from '@/stores/auth-store'
import { fechaCorta } from '@/utils/formato'

const props = defineProps({
  idEvento: { type: Number, required: true },
  realizado: { type: Boolean, default: false },
})

const $q = useQuasar()
const auth = useAuthStore()

const resumen = ref({ promedioCalificacion: 0, totalResenas: 0, resenas: [] })
const calificacion = ref(0)
const comentario = ref('')
const guardando = ref(false)
const error = ref('')

const puedeOpinar = computed(() => props.realizado && auth.esAsistente)
const miResena = computed(() =>
  resumen.value.resenas.find((r) => r.idUsuario === auth.usuario?.idUsuario),
)

async function cargar() {
  try {
    const { data } = await api.get(`/Resena/evento/${props.idEvento}`)
    resumen.value = data.datos
  } catch {
    // sin reseñas
  }
}

async function guardar() {
  guardando.value = true
  error.value = ''
  try {
    const { data } = await api.post('/Resena', {
      idEvento: props.idEvento,
      calificacion: calificacion.value,
      comentario: comentario.value,
    })
    $q.notify({ type: 'positive', message: data.mensaje })
    comentario.value = ''
    calificacion.value = 0
    cargar()
  } catch (e) {
    error.value = mensajeError(e)
  } finally {
    guardando.value = false
  }
}

function eliminar(r) {
  $q.dialog({
    title: 'Eliminar reseña',
    message: '¿Seguro que quieres eliminar tu reseña?',
    cancel: true,
  }).onOk(async () => {
    try {
      const { data } = await api.delete(`/Resena/${r.idResena}`)
      $q.notify({ type: 'positive', message: data.mensaje })
      cargar()
    } catch (e) {
      $q.notify({ type: 'negative', message: mensajeError(e) })
    }
  })
}

onMounted(cargar)
</script>

<style scoped>
.resena {
  border-radius: 12px;
}
</style>
