<template>
  <q-page class="contenedor q-px-md q-py-lg" style="max-width: 820px">
    <div class="row items-center q-mb-md">
      <div>
        <div class="text-h5 text-weight-bold">Notificaciones</div>
        <div class="text-grey-7">
          Compras, cambios, cancelaciones y recordatorios de tus eventos.
        </div>
      </div>
      <q-space />
      <q-toggle v-model="soloNoLeidas" label="Solo no leídas" @update:model-value="cargar(1)" />
      <q-btn
        flat
        no-caps
        color="primary"
        icon="done_all"
        label="Marcar todas"
        @click="marcarTodas"
      />
    </div>

    <q-banner v-if="error" rounded class="bg-red-1 text-negative">{{ error }}</q-banner>

    <div v-else-if="!cargando && pagina.items.length === 0" class="text-center q-pa-xl text-grey-7">
      <q-icon name="notifications_none" size="64px" color="grey-5" />
      <div class="q-mt-sm">No tienes notificaciones.</div>
    </div>

    <q-list v-else bordered separator class="bg-white rounded-borders">
      <q-item
        v-for="n in pagina.items"
        :key="n.idNotificacion"
        clickable
        :class="{ 'no-leida': !n.leida }"
        @click="abrir(n)"
      >
        <q-item-section avatar>
          <q-avatar :color="estilo(n.tipo).color" text-color="white" :icon="estilo(n.tipo).icon" />
        </q-item-section>
        <q-item-section>
          <q-item-label class="text-weight-bold">{{ n.titulo }}</q-item-label>
          <q-item-label caption lines="3">{{ n.mensaje }}</q-item-label>
        </q-item-section>
        <q-item-section side top>
          <q-item-label caption>{{ fechaHora(n.fechaCreacion) }}</q-item-label>
          <q-badge v-if="!n.leida" color="primary" label="Nueva" class="q-mt-xs" />
        </q-item-section>
      </q-item>
    </q-list>

    <div v-if="pagina.totalPaginas > 1" class="flex flex-center q-mt-md">
      <q-pagination
        :model-value="pagina.pagina"
        :max="pagina.totalPaginas"
        direction-links
        @update:model-value="cargar"
      />
    </div>
  </q-page>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { api, mensajeError } from '@/boot/axios'
import { fechaHora } from '@/utils/formato'

const router = useRouter()
const pagina = ref({ items: [], pagina: 1, totalPaginas: 1 })
const soloNoLeidas = ref(false)
const cargando = ref(true)
const error = ref('')

const estilos = {
  Compra: { icon: 'shopping_bag', color: 'positive' },
  Recordatorio: { icon: 'alarm', color: 'info' },
  Cancelacion: { icon: 'event_busy', color: 'negative' },
  Cambio: { icon: 'edit_calendar', color: 'warning' },
  Agotado: { icon: 'local_fire_department', color: 'accent' },
  Suspension: { icon: 'gavel', color: 'orange-9' },
}
const estilo = (tipo) => estilos[tipo] ?? { icon: 'notifications', color: 'secondary' }

async function cargar(numero = 1) {
  cargando.value = true
  try {
    const { data } = await api.get('/Notificacion', {
      params: { soloNoLeidas: soloNoLeidas.value, pagina: numero },
    })
    pagina.value = data
  } catch (e) {
    error.value = mensajeError(e)
  } finally {
    cargando.value = false
  }
}

async function abrir(n) {
  if (!n.leida) {
    try {
      await api.patch(`/Notificacion/${n.idNotificacion}/leer`)
      n.leida = true
    } catch {
      // se intenta de nuevo la próxima vez
    }
  }
  if (n.idEvento) router.push(`/eventos/${n.idEvento}`)
}

async function marcarTodas() {
  await api.patch('/Notificacion/leer-todas')
  cargar(pagina.value.pagina)
}

onMounted(() => cargar(1))
</script>

<style scoped>
.no-leida {
  background: #fff4f5;
}
</style>
