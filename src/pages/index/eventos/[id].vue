<template>
  <q-page class="contenedor q-px-md q-py-lg">
    <q-btn flat no-caps icon="arrow_back" label="Volver" class="q-mb-md" @click="router.back()" />

    <div v-if="cargando" class="row q-col-gutter-lg">
      <div class="col-12 col-md-8"><q-skeleton height="420px" style="border-radius: 14px" /></div>
      <div class="col-12 col-md-4"><q-skeleton height="260px" style="border-radius: 14px" /></div>
    </div>

    <q-banner v-else-if="error" class="bg-red-1 text-negative" rounded>
      {{ error }}
      <template #action><q-btn flat no-caps label="Ver otros eventos" to="/eventos" /></template>
    </q-banner>

    <div v-else class="row q-col-gutter-lg">
      <!-- Información del evento (US-09) -->
      <div class="col-12 col-md-8">
        <div class="detalle__imagen" :style="{ background: estilo.fondo }">
          <img v-if="evento.imagenUrl" :src="urlImagen(evento.imagenUrl)" :alt="evento.nombre" />
          <q-icon v-else :name="estilo.icono" size="96px" color="white" />
        </div>

        <q-chip color="primary" text-color="white" class="q-ml-none q-mt-md">{{
          evento.categoria
        }}</q-chip>
        <div class="text-h4 text-weight-bold q-mt-xs">{{ evento.nombre }}</div>
        <div class="text-grey-7 q-mt-xs">
          Organiza: <b>{{ evento.organizador }}</b>
        </div>

        <q-list class="q-mt-md">
          <q-item class="q-px-none">
            <q-item-section avatar><q-icon name="event" color="primary" /></q-item-section>
            <q-item-section>
              <q-item-label class="capitalizar">{{
                fechaLarga(evento.fechaHoraInicio)
              }}</q-item-label>
              <q-item-label caption
                >{{ hora(evento.fechaHoraInicio) }} – {{ hora(evento.fechaHoraFin) }}</q-item-label
              >
            </q-item-section>
          </q-item>
          <q-item class="q-px-none">
            <q-item-section avatar><q-icon name="place" color="primary" /></q-item-section>
            <q-item-section>
              <q-item-label>{{ evento.direccion }}</q-item-label>
              <q-item-label caption>{{ evento.distrito }}, {{ evento.departamento }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>

        <div class="text-h6 text-weight-bold q-mt-md">Acerca del evento</div>
        <p class="text-body1 q-mt-sm" style="white-space: pre-line">{{ evento.descripcion }}</p>

        <!-- Cancelado (US-04) -->
        <q-banner
          v-if="evento.estado === 'Cancelado'"
          rounded
          class="bg-red-1 text-negative q-mt-md"
        >
          <template #avatar><q-icon name="event_busy" /></template>
          Este evento fue cancelado. Motivo: {{ evento.motivoCancelacion }}
        </q-banner>

        <!-- Opiniones (US-12) -->
        <ResenasEvento
          :key="evento.idEvento"
          :id-evento="evento.idEvento"
          :realizado="evento.estadoCompra === 'Realizado'"
        />
      </div>

      <!-- Compra y cupos -->
      <div class="col-12 col-md-4">
        <q-card flat bordered class="detalle__compra">
          <q-card-section>
            <div class="text-caption text-grey-7">Precio por entrada</div>
            <div
              class="text-h4 text-weight-bold"
              :class="evento.precio === 0 ? 'text-positive' : ''"
            >
              {{ evento.precioTexto }}
            </div>
          </q-card-section>

          <!-- US-10: cupos (se actualizan solos cada 10 segundos) -->
          <q-card-section class="q-pt-none">
            <div class="row justify-between text-caption q-mb-xs">
              <span>{{ cupos }} cupos disponibles</span>
              <span class="text-grey-7">Aforo {{ evento.aforoMaximo }}</span>
            </div>
            <q-linear-progress
              :value="ocupacion"
              rounded
              size="10px"
              :color="cupos === 0 ? 'negative' : 'primary'"
            />
          </q-card-section>

          <q-card-section class="q-pt-none">
            <q-banner
              v-if="evento.misEntradas > 0"
              dense
              rounded
              class="bg-green-1 text-positive q-mb-sm"
            >
              Ya tienes {{ evento.misEntradas }} entrada(s) para este evento.
            </q-banner>

            <q-btn
              v-if="!auth.haySesion && evento.puedeComprar"
              unelevated
              no-caps
              color="primary"
              class="full-width"
              size="lg"
              label="Inicia sesión para comprar"
              :to="{ path: '/login', query: { redirect: route.fullPath } }"
            />
            <q-btn
              v-else-if="evento.puedeComprar && cupos > 0"
              unelevated
              no-caps
              color="primary"
              class="full-width"
              size="lg"
              icon="confirmation_number"
              label="Comprar entradas"
              @click="comprar"
            />
            <q-banner v-else dense rounded class="bg-grey-3 text-dark">
              {{ cupos === 0 && evento.puedeComprar ? 'Agotado' : evento.mensajeCompra }}
            </q-banner>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- US-06 Compra de entradas -->
    <CompraDialog
      v-if="evento"
      v-model="dialogoCompra"
      :evento="evento"
      :cupos="cupos"
      @comprado="cargar"
    />
  </q-page>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { api, mensajeError } from '@/boot/axios'
import { useAuthStore } from '@/stores/auth-store'
import { estiloCategoria, fechaLarga, hora, urlImagen } from '@/utils/formato'
import CompraDialog from '@/components/compras/CompraDialog.vue'
import ResenasEvento from '@/components/resenas/ResenasEvento.vue'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const evento = ref(null)
const cupos = ref(0)
const cargando = ref(true)
const error = ref('')
const dialogoCompra = ref(false)
let temporizador = null

const estilo = computed(() => estiloCategoria(evento.value?.categoria))
const ocupacion = computed(() =>
  evento.value ? (evento.value.aforoMaximo - cupos.value) / evento.value.aforoMaximo : 0,
)

async function actualizarCupos() {
  try {
    const { data } = await api.get(`/Evento/${route.params.id}/disponibilidad`)
    cupos.value = data.datos.cuposDisponibles
  } catch {
    // Si falla, se mantiene el último valor
  }
}

function comprar() {
  dialogoCompra.value = true
}

async function cargar() {
  try {
    const { data } = await api.get(`/Evento/${route.params.id}`)
    evento.value = data.datos
    cupos.value = data.datos.cuposDisponibles
    clearInterval(temporizador)
    if (data.datos.estadoCompra === 'Disponible') temporizador = setInterval(actualizarCupos, 10000)
  } catch (e) {
    error.value = mensajeError(e)
  } finally {
    cargando.value = false
  }
}

onMounted(cargar)
// Si se abre otro evento (por ejemplo desde PeruIA) sin salir de esta página
watch(
  () => route.params.id,
  (id) => {
    if (id) {
      cargando.value = true
      cargar()
    }
  },
)

onUnmounted(() => clearInterval(temporizador))
</script>

<style scoped>
.detalle__imagen {
  height: 320px;
  border-radius: 16px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}
.detalle__imagen img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.detalle__compra {
  border-radius: 16px;
  position: sticky;
  top: 90px;
}
</style>
