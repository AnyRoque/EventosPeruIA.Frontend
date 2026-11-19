<template>
  <q-page class="contenedor q-px-md q-py-lg">
    <div class="row items-center q-mb-md">
      <div>
        <div class="text-h5 text-weight-bold">Reportes de ventas</div>
        <div class="text-grey-7">Resumen de tus ventas según los filtros.</div>
      </div>
      <q-space />
      <q-btn
        outline
        no-caps
        color="positive"
        icon="grid_on"
        label="Excel"
        class="q-mr-sm"
        :disable="!reporte?.hayVentas"
        @click="exportar('excel')"
      />
      <q-btn
        outline
        no-caps
        color="negative"
        icon="picture_as_pdf"
        label="PDF"
        :disable="!reporte?.hayVentas"
        @click="exportar('pdf')"
      />
    </div>

    <!-- Filtros -->
    <q-card flat bordered class="tarjeta q-mb-md">
      <q-card-section class="row q-col-gutter-sm items-center">
        <div class="col-12 col-md-5">
          <q-select
            v-model="filtro.idEvento"
            outlined
            dense
            clearable
            emit-value
            map-options
            :options="eventos"
            option-value="idEvento"
            option-label="nombre"
            label="Todos mis eventos"
          />
        </div>
        <div class="col-6 col-md-3">
          <q-input v-model="filtro.desde" outlined dense type="date" label="Desde" stack-label />
        </div>
        <div class="col-6 col-md-3">
          <q-input v-model="filtro.hasta" outlined dense type="date" label="Hasta" stack-label />
        </div>
        <div class="col-12 col-md-1">
          <q-btn
            unelevated
            no-caps
            color="primary"
            icon="filter_alt"
            class="full-width"
            :loading="cargando"
            @click="cargar"
          />
        </div>
      </q-card-section>
    </q-card>

    <q-banner v-if="error" rounded class="bg-red-1 text-negative q-mb-md">{{ error }}</q-banner>
    <q-banner v-else-if="reporte && !reporte.hayVentas" rounded class="bg-grey-3 q-mb-md"
      >No hay ventas en el periodo seleccionado.</q-banner
    >

    <template v-if="reporte?.hayVentas">
      <!-- Tarjetas -->
      <div class="row q-col-gutter-md q-mb-md">
        <div v-for="t in tarjetas" :key="t.label" class="col-6 col-md-3">
          <q-card flat bordered class="tarjeta">
            <q-card-section>
              <q-icon :name="t.icon" color="primary" size="28px" />
              <div class="text-h5 text-weight-bold q-mt-xs">{{ t.valor }}</div>
              <div class="text-caption text-grey-7">{{ t.label }}</div>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- Ventas por fecha (gráfico de barras) -->
      <q-card flat bordered class="tarjeta q-mb-md">
        <q-card-section>
          <div class="text-subtitle1 text-weight-bold q-mb-md">Ventas por fecha</div>
          <div class="barras">
            <div v-for="d in reporte.ventasPorDia" :key="d.fecha" class="barra">
              <div class="barra__valor">{{ d.entradasVendidas }}</div>
              <div
                class="barra__columna"
                :style="{ height: `${(d.entradasVendidas / maxDia) * 140 + 4}px` }"
              >
                <q-tooltip
                  >{{ fechaCorta(d.fecha) }}: {{ d.entradasVendidas }} entradas ·
                  {{ soles(d.monto) }}</q-tooltip
                >
              </div>
              <div class="barra__fecha">{{ fechaCorta(d.fecha) }}</div>
            </div>
          </div>
        </q-card-section>
      </q-card>

      <q-table
        flat
        bordered
        title="Ventas por evento"
        :rows="reporte.ventasPorEvento"
        :columns="colEventos"
        row-key="idEvento"
        hide-pagination
        :pagination="{ rowsPerPage: 0 }"
        class="tarjeta q-mb-md"
      >
        <template #bottom-row>
          <q-tr class="text-weight-bold bg-grey-2">
            <q-td>Total</q-td><q-td /><q-td class="text-right">{{ reporte.aforoTotal }}</q-td>
            <q-td class="text-right">{{ reporte.entradasVendidas }}</q-td>
            <q-td class="text-right">{{ reporte.porcentajeAforoOcupado }}%</q-td>
            <q-td class="text-right">{{ soles(reporte.totalRecaudado) }}</q-td
            ><q-td />
          </q-tr>
        </template>
      </q-table>

      <q-table
        flat
        bordered
        title="Detalle de ventas"
        :rows="reporte.detalleVentas"
        :columns="colDetalle"
        row-key="numeroCompra"
        :pagination="{ rowsPerPage: 10 }"
        class="tarjeta"
      />
    </template>
  </q-page>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useQuasar } from 'quasar'
import { api, mensajeError } from '@/boot/axios'
import { descargar, fechaCorta, fechaHora, soles } from '@/utils/formato'

const $q = useQuasar()

const eventos = ref([])
const filtro = ref({ idEvento: null, desde: '', hasta: '' })
const reporte = ref(null)
const cargando = ref(false)
const error = ref('')

const params = computed(() => {
  const p = {}
  if (filtro.value.idEvento) p.idEvento = filtro.value.idEvento
  if (filtro.value.desde) p.desde = filtro.value.desde
  if (filtro.value.hasta) p.hasta = filtro.value.hasta
  return p
})

const tarjetas = computed(() => [
  { label: 'Total recaudado', valor: soles(reporte.value.totalRecaudado), icon: 'payments' },
  {
    label: 'Entradas vendidas',
    valor: reporte.value.entradasVendidas,
    icon: 'confirmation_number',
  },
  { label: 'Aforo ocupado', valor: `${reporte.value.porcentajeAforoOcupado}%`, icon: 'groups' },
  {
    label: 'Asistentes que ingresaron',
    valor: reporte.value.asistentesIngresaron,
    icon: 'how_to_reg',
  },
])
const maxDia = computed(() =>
  Math.max(1, ...reporte.value.ventasPorDia.map((d) => d.entradasVendidas)),
)

const colEventos = [
  { name: 'evento', label: 'Evento', field: 'evento', align: 'left' },
  { name: 'fecha', label: 'Fecha', field: 'fecha', align: 'left', format: fechaHora },
  { name: 'aforo', label: 'Aforo', field: 'aforo', align: 'right' },
  { name: 'vendidas', label: 'Vendidas', field: 'entradasVendidas', align: 'right' },
  {
    name: 'ocupacion',
    label: '% Ocupación',
    field: 'porcentajeOcupacion',
    align: 'right',
    format: (v) => `${v}%`,
  },
  { name: 'monto', label: 'Monto', field: 'montoRecaudado', align: 'right', format: soles },
  { name: 'estado', label: 'Estado', field: 'estado', align: 'center' },
]
const colDetalle = [
  { name: 'numero', label: 'N° compra', field: 'numeroCompra', align: 'left' },
  { name: 'comprador', label: 'Comprador', field: 'comprador', align: 'left' },
  { name: 'evento', label: 'Evento', field: 'evento', align: 'left' },
  { name: 'cantidad', label: 'Cant.', field: 'cantidad', align: 'right' },
  { name: 'total', label: 'Total', field: 'total', align: 'right', format: soles },
  { name: 'fecha', label: 'Fecha y hora', field: 'fechaCompra', align: 'left', format: fechaHora },
  { name: 'estado', label: 'Estado', field: 'estado', align: 'center' },
]

async function cargar() {
  cargando.value = true
  error.value = ''
  try {
    const { data } = await api.get('/Reporte', { params: params.value })
    reporte.value = data.datos
  } catch (e) {
    error.value = mensajeError(e)
    reporte.value = null
  } finally {
    cargando.value = false
  }
}

async function exportar(tipo) {
  try {
    await descargar(
      api,
      `/Reporte/exportar/${tipo}`,
      `ReporteVentas.${tipo === 'excel' ? 'xlsx' : 'pdf'}`,
      params.value,
    )
  } catch (e) {
    $q.notify({ type: 'negative', message: mensajeError(e) })
  }
}

onMounted(async () => {
  try {
    const { data } = await api.get('/Evento/mis-eventos')
    eventos.value = data.filter((e) => e.estado !== 'Borrador')
  } catch {
    // el filtro por evento queda vacío
  }
  cargar()
})
</script>

<style scoped>
.tarjeta {
  border-radius: 14px;
}
.barras {
  display: flex;
  align-items: flex-end;
  gap: 10px;
  overflow-x: auto;
  padding-bottom: 4px;
  min-height: 190px;
}
.barra {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 44px;
}
.barra__columna {
  width: 28px;
  border-radius: 6px 6px 0 0;
  background: var(--q-primary);
}
.barra__valor,
.barra__fecha {
  font-size: 11px;
  color: #666;
}
</style>
