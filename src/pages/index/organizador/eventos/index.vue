<template>
  <q-page class="contenedor q-px-md q-py-lg">
    <div class="row items-center q-mb-md">
      <div>
        <div class="text-h5 text-weight-bold">Mis eventos</div>
        <div class="text-grey-7">Publica, edita o cancela tus eventos.</div>
      </div>
      <q-space />
      <q-btn
        unelevated
        no-caps
        color="primary"
        icon="add"
        label="Crear evento"
        to="/organizador/eventos/nuevo"
      />
    </div>

    <q-table
      flat
      bordered
      :rows="eventos"
      :columns="columnas"
      row-key="idEvento"
      :loading="cargando"
      :grid="$q.screen.lt.md"
      :pagination="{ rowsPerPage: 10 }"
      no-data-label="Aún no tienes eventos. ¡Crea el primero!"
      class="tabla"
    >
      <template #body-cell-nombre="p">
        <q-td :props="p">
          <router-link :to="`/eventos/${p.row.idEvento}`" class="text-weight-medium text-dark">{{
            p.row.nombre
          }}</router-link>
        </q-td>
      </template>
      <template #body-cell-estado="p">
        <q-td :props="p"
          ><q-chip dense :color="colorEstado(p.row.estado)" text-color="white">{{
            p.row.estado
          }}</q-chip></q-td
        >
      </template>
      <template #body-cell-acciones="p">
        <q-td :props="p" class="q-gutter-xs">
          <Acciones
            :evento="p.row"
            @publicar="publicar"
            @cancelar="abrirCancelar"
            @eliminar="eliminar"
          />
        </q-td>
      </template>

      <!-- Vista en tarjetas para celular -->
      <template #item="p">
        <div class="col-12 col-sm-6 q-pa-xs">
          <q-card flat bordered class="tabla">
            <q-card-section>
              <div class="row items-start no-wrap">
                <div class="col text-weight-bold">{{ p.row.nombre }}</div>
                <q-chip dense :color="colorEstado(p.row.estado)" text-color="white">{{
                  p.row.estado
                }}</q-chip>
              </div>
              <div class="text-caption text-grey-7">
                {{ fechaHora(p.row.fechaHoraInicio) }} · {{ p.row.vendidas }} vendidas
              </div>
            </q-card-section>
            <q-card-actions>
              <Acciones
                :evento="p.row"
                @publicar="publicar"
                @cancelar="abrirCancelar"
                @eliminar="eliminar"
              />
            </q-card-actions>
          </q-card>
        </div>
      </template>
    </q-table>

    <!-- US-04 Cancelar evento -->
    <q-dialog v-model="dialogoCancelar" persistent>
      <q-card style="width: 480px; max-width: 95vw">
        <q-card-section>
          <div class="text-h6">Cancelar «{{ resumen?.tituloEvento }}»</div>
        </q-card-section>
        <q-card-section v-if="resumen" class="q-pt-none">
          <q-banner rounded class="bg-orange-1 text-dark">
            Se anularán <b>{{ resumen.entradasVendidas }}</b> entradas de
            <b>{{ resumen.totalCompradores }}</b> compradores y se devolverán
            <b>{{ soles(resumen.montoADevolver) }}</b
            >. Esta acción no se puede deshacer.
          </q-banner>
          <q-input
            v-model="motivo"
            outlined
            type="textarea"
            autogrow
            counter
            maxlength="500"
            class="q-mt-md"
            label="Motivo (mínimo 20 caracteres)"
          />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn v-close-popup flat no-caps label="Volver" />
          <q-btn
            unelevated
            no-caps
            color="negative"
            label="Cancelar evento"
            :loading="cancelando"
            :disable="motivo.trim().length < 20"
            @click="cancelar"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { h, onMounted, ref } from 'vue'
import { useQuasar, QBtn } from 'quasar'
import { useRouter } from 'vue-router'
import { api, mensajeError } from '@/boot/axios'
import { colorEstado, fechaHora, soles } from '@/utils/formato'

const $q = useQuasar()
const router = useRouter()

const eventos = ref([])
const cargando = ref(true)
const dialogoCancelar = ref(false)
const resumen = ref(null)
const motivo = ref('')
const cancelando = ref(false)

const columnas = [
  { name: 'nombre', label: 'Evento', field: 'nombre', align: 'left', sortable: true },
  {
    name: 'fecha',
    label: 'Fecha',
    field: 'fechaHoraInicio',
    align: 'left',
    sortable: true,
    format: fechaHora,
  },
  { name: 'vendidas', label: 'Vendidas', field: 'vendidas', align: 'center' },
  { name: 'estado', label: 'Estado', field: 'estado', align: 'center', sortable: true },
  { name: 'acciones', label: 'Acciones', field: 'idEvento', align: 'right' },
]

// Botones según lo que permite la API para cada evento
const Acciones = (props, { emit }) => {
  const e = props.evento
  const boton = (icon, label, color, onClick) =>
    h(QBtn, { flat: true, dense: true, noCaps: true, icon, label, color, onClick })
  return [
    e.puedeEditar &&
      boton('edit', 'Editar', 'primary', () => router.push(`/organizador/eventos/${e.idEvento}`)),
    e.estado === 'Borrador' && boton('publish', 'Publicar', 'positive', () => emit('publicar', e)),
    e.puedeCancelar && boton('event_busy', 'Cancelar', 'negative', () => emit('cancelar', e)),
    e.estado === 'Borrador' && boton('delete', 'Eliminar', 'grey-8', () => emit('eliminar', e)),
  ].filter(Boolean)
}
Acciones.props = ['evento']
Acciones.emits = ['publicar', 'cancelar', 'eliminar']

async function cargar() {
  cargando.value = true
  try {
    const { data } = await api.get('/Evento/mis-eventos')
    eventos.value = data
  } catch (e) {
    $q.notify({ type: 'negative', message: mensajeError(e) })
  } finally {
    cargando.value = false
  }
}

async function publicar(e) {
  try {
    const { data } = await api.patch(`/Evento/${e.idEvento}/publicar`)
    $q.notify({ type: 'positive', message: data.mensaje })
    cargar()
  } catch (err) {
    $q.notify({ type: 'negative', message: mensajeError(err) })
  }
}

async function abrirCancelar(e) {
  try {
    const { data } = await api.get(`/Evento/${e.idEvento}/resumen-cancelacion`)
    resumen.value = data.datos
    motivo.value = ''
    dialogoCancelar.value = true
  } catch (err) {
    $q.notify({ type: 'negative', message: mensajeError(err) })
  }
}

async function cancelar() {
  cancelando.value = true
  try {
    const { data } = await api.post(`/Evento/${resumen.value.idEvento}/cancelar`, {
      motivo: motivo.value.trim(),
    })
    $q.notify({ type: 'positive', message: data.mensaje, timeout: 6000 })
    dialogoCancelar.value = false
    cargar()
  } catch (err) {
    $q.notify({ type: 'negative', message: mensajeError(err) })
  } finally {
    cancelando.value = false
  }
}

function eliminar(e) {
  $q.dialog({ title: 'Eliminar borrador', message: `¿Eliminar «${e.nombre}»?`, cancel: true }).onOk(
    async () => {
      try {
        const { data } = await api.delete(`/Evento/${e.idEvento}`)
        $q.notify({ type: 'positive', message: data.mensaje })
        cargar()
      } catch (err) {
        $q.notify({ type: 'negative', message: mensajeError(err) })
      }
    },
  )
}

onMounted(cargar)
</script>

<style scoped>
.tabla {
  border-radius: 14px;
}
</style>
