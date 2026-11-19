<template>
  <q-page class="contenedor q-px-md q-py-lg">
    <div class="text-h5 text-weight-bold">Mis entradas</div>
    <div class="text-grey-7 q-mb-md">
      Muestra el código QR de cada entrada en el ingreso al evento.
    </div>

    <q-tabs
      v-model="tab"
      dense
      align="left"
      no-caps
      active-color="primary"
      indicator-color="primary"
      class="q-mb-md"
    >
      <q-tab name="proximas" :label="`Próximas (${proximas.length})`" />
      <q-tab name="pasadas" :label="`Pasadas y canceladas (${pasadas.length})`" />
    </q-tabs>

    <div v-if="cargando" class="row q-col-gutter-md">
      <div v-for="n in 3" :key="n" class="col-12 col-md-6"><q-skeleton height="150px" /></div>
    </div>

    <q-banner v-else-if="error" rounded class="bg-red-1 text-negative">{{ error }}</q-banner>

    <div v-else-if="lista.length === 0" class="text-center q-pa-xl text-grey-7">
      <q-icon name="confirmation_number" size="64px" color="grey-5" />
      <div class="q-mt-sm">No tienes entradas aquí.</div>
      <q-btn
        unelevated
        no-caps
        color="primary"
        label="Buscar eventos"
        to="/eventos"
        class="q-mt-md"
      />
    </div>

    <div v-else class="row q-col-gutter-md">
      <div v-for="g in lista" :key="g.numeroCompra" class="col-12 col-md-6">
        <q-card flat bordered class="entrada" :class="{ 'entrada--cancelada': g.eventoCancelado }">
          <q-card-section>
            <div class="row items-start no-wrap">
              <div class="col">
                <div
                  class="text-subtitle1 text-weight-bold cursor-pointer"
                  @click="router.push(`/eventos/${g.idEvento}`)"
                >
                  {{ g.evento }}
                </div>
                <div class="text-caption text-grey-7 capitalizar">
                  {{ fechaLarga(g.fechaHoraInicio) }} · {{ hora(g.fechaHoraInicio) }}
                </div>
                <div class="text-caption text-grey-7">{{ g.lugar }}</div>
                <div class="text-caption q-mt-xs">
                  Compra {{ g.numeroCompra }} · {{ g.entradas.length }} entrada(s)
                </div>
              </div>
              <q-chip v-if="g.eventoCancelado" color="negative" text-color="white" dense
                >Evento cancelado</q-chip
              >
            </div>

            <!-- US-04: motivo y monto devuelto -->
            <q-banner v-if="g.eventoCancelado" dense rounded class="bg-red-1 text-negative q-mt-sm">
              Motivo: {{ g.motivoCancelacion }}<br />
              Monto devuelto: <b>{{ soles(g.montoDevuelto) }}</b>
            </q-banner>
          </q-card-section>

          <q-separator />
          <q-list dense>
            <q-item v-for="e in g.entradas" :key="e.idEntrada">
              <q-item-section>
                <q-item-label>Entrada {{ e.numeroEntrada }} de {{ e.totalEntradas }}</q-item-label>
                <q-item-label caption>{{ e.asistente }}</q-item-label>
              </q-item-section>
              <q-item-section side>
                <div class="row items-center q-gutter-xs">
                  <q-chip dense :color="colorEstado(e.estado)" text-color="white">{{
                    e.estado
                  }}</q-chip>
                  <q-btn
                    v-if="!g.eventoCancelado"
                    flat
                    round
                    dense
                    icon="qr_code_2"
                    color="primary"
                    @click="verQr(e)"
                  >
                    <q-tooltip>Ver código</q-tooltip>
                  </q-btn>
                  <q-btn
                    v-if="!g.eventoCancelado"
                    flat
                    round
                    dense
                    icon="download"
                    @click="pdfEntrada(e)"
                  >
                    <q-tooltip>Descargar PDF</q-tooltip>
                  </q-btn>
                </div>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card>
      </div>
    </div>

    <!-- Código de la entrada (es el que valida el check-in) -->
    <q-dialog v-model="dialogoQr">
      <q-card style="width: 360px; max-width: 92vw" class="text-center">
        <q-card-section>
          <div class="text-h6">{{ entradaQr?.evento }}</div>
          <div class="text-caption text-grey-7">
            Entrada {{ entradaQr?.numeroEntrada }} de {{ entradaQr?.totalEntradas }}
          </div>
        </q-card-section>
        <q-card-section>
          <img v-if="qrUrl" :src="qrUrl" alt="Código QR" width="220" height="220" />
          <div class="text-caption q-mt-sm" style="word-break: break-all">
            {{ entradaQr?.codigoEntrada }}
          </div>
          <div class="text-caption text-grey-7 q-mt-sm">El PDF también incluye este código QR.</div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn
            flat
            no-caps
            label="Descargar PDF"
            icon="download"
            @click="pdfEntrada(entradaQr)"
          />
          <q-btn v-close-popup flat no-caps label="Cerrar" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import QRCode from 'qrcode'
import { api, mensajeError } from '@/boot/axios'
import { colorEstado, descargar, fechaLarga, hora, soles } from '@/utils/formato'

const router = useRouter()

const entradas = ref([])
const cargando = ref(true)
const error = ref('')
const tab = ref('proximas')
const dialogoQr = ref(false)
const entradaQr = ref(null)
const qrUrl = ref('')

// Agrupa las entradas por compra
const compras = computed(() => {
  const grupos = new Map()
  for (const e of entradas.value) {
    if (!grupos.has(e.numeroCompra)) {
      grupos.set(e.numeroCompra, {
        numeroCompra: e.numeroCompra,
        idEvento: e.idEvento,
        evento: e.evento,
        fechaHoraInicio: e.fechaHoraInicio,
        lugar: e.lugar,
        eventoCancelado: e.eventoCancelado,
        motivoCancelacion: e.motivoCancelacion,
        montoDevuelto: 0,
        entradas: [],
      })
    }
    const g = grupos.get(e.numeroCompra)
    g.entradas.push(e)
    g.montoDevuelto += e.montoDevuelto ?? 0
  }
  return [...grupos.values()]
})

const ahora = Date.now()
const proximas = computed(() =>
  compras.value.filter((g) => !g.eventoCancelado && new Date(g.fechaHoraInicio) >= ahora),
)
const pasadas = computed(() =>
  compras.value.filter((g) => g.eventoCancelado || new Date(g.fechaHoraInicio) < ahora),
)
const lista = computed(() => (tab.value === 'proximas' ? proximas.value : pasadas.value))

// El QR se genera en el navegador (no se envía el código a ningún servicio externo)
async function verQr(e) {
  entradaQr.value = e
  qrUrl.value = await QRCode.toDataURL(e.codigoEntrada, { width: 220, margin: 1 })
  dialogoQr.value = true
}

function pdfEntrada(e) {
  descargar(
    api,
    `/Compra/entradas/${e.idEntrada}/pdf`,
    `Entrada_${e.numeroCompra}_${e.numeroEntrada}.pdf`,
  )
}

onMounted(async () => {
  try {
    const { data } = await api.get('/Compra/mis-entradas')
    entradas.value = data
  } catch (e) {
    error.value = mensajeError(e)
  } finally {
    cargando.value = false
  }
})
</script>

<style scoped>
.entrada {
  border-radius: 14px;
}
.entrada--cancelada {
  opacity: 0.85;
}
</style>
