<template>
  <q-page class="contenedor q-px-md q-py-lg">
    <div class="text-h5 text-weight-bold">Moderación</div>
    <div class="text-grey-7 q-mb-md">
      Suspende o reactiva eventos y usuarios, y oculta reseñas inapropiadas.
    </div>

    <q-tabs
      v-model="tab"
      dense
      no-caps
      align="left"
      active-color="primary"
      indicator-color="primary"
      outside-arrows
      mobile-arrows
      @update:model-value="cambiarTab"
    >
      <q-tab name="eventos" icon="event" label="Eventos" />
      <q-tab name="usuarios" icon="people" label="Usuarios" />
      <q-tab name="resenas" icon="reviews" label="Reseñas" />
      <q-tab name="historial" icon="history" label="Historial" />
    </q-tabs>
    <q-separator class="q-mb-md" />

    <!-- Buscador y filtro -->
    <div class="row q-col-gutter-sm q-mb-md">
      <div v-if="tab !== 'historial'" class="col-12 col-sm-6">
        <q-input
          v-model="buscar"
          outlined
          dense
          debounce="400"
          placeholder="Buscar por nombre o correo"
          clearable
          @update:model-value="cargar(1)"
        >
          <template #prepend><q-icon name="search" /></template>
        </q-input>
      </div>
      <div class="col-12 col-sm-4">
        <q-select
          v-if="tab !== 'historial'"
          v-model="estado"
          outlined
          dense
          clearable
          :options="estados[tab]"
          label="Estado"
          @update:model-value="cargar(1)"
        />
        <q-select
          v-else
          v-model="accion"
          outlined
          dense
          clearable
          :options="acciones"
          label="Acción"
          @update:model-value="cargar(1)"
        />
      </div>
    </div>

    <q-table
      flat
      bordered
      :rows="pagina.items"
      :columns="columnas[tab]"
      :row-key="clave[tab]"
      :loading="cargando"
      :grid="$q.screen.lt.sm"
      hide-pagination
      :pagination="{ rowsPerPage: 0 }"
      no-data-label="No hay resultados."
      class="tarjeta"
    >
      <template #body-cell-estado="p">
        <q-td :props="p"
          ><q-chip dense :color="colorEstado(p.row.estado)" text-color="white">{{
            p.row.estado
          }}</q-chip></q-td
        >
      </template>
      <template #body-cell-roles="p">
        <q-td :props="p"
          ><q-badge v-for="r in p.row.roles" :key="r" outline color="primary" class="q-mr-xs">{{
            r
          }}</q-badge></q-td
        >
      </template>
      <template #body-cell-calificacion="p">
        <q-td :props="p"
          ><q-rating :model-value="p.row.calificacion" readonly size="14px" color="amber"
        /></q-td>
      </template>
      <template #body-cell-acciones="p">
        <q-td :props="p">
          <template v-if="tab === 'eventos'">
            <q-btn
              v-if="p.row.puedeSuspender"
              flat
              dense
              no-caps
              color="negative"
              icon="block"
              label="Suspender"
              @click="pedirMotivo('suspender', p.row)"
            />
            <q-btn
              v-if="p.row.puedeReactivar"
              flat
              dense
              no-caps
              color="positive"
              icon="restart_alt"
              label="Reactivar"
              @click="pedirMotivo('reactivar', p.row)"
            />
          </template>
          <template v-else-if="tab === 'usuarios'">
            <q-btn
              v-if="p.row.estado === 'Activo'"
              flat
              dense
              no-caps
              color="negative"
              icon="person_off"
              label="Suspender"
              @click="pedirMotivo('suspender', p.row)"
            />
            <q-btn
              v-else
              flat
              dense
              no-caps
              color="positive"
              icon="person"
              label="Reactivar"
              @click="pedirMotivo('reactivar', p.row)"
            />
          </template>
          <q-btn
            v-else-if="tab === 'resenas' && p.row.estado === 'Visible'"
            flat
            dense
            no-caps
            color="negative"
            icon="visibility_off"
            label="Ocultar"
            @click="pedirMotivo('ocultar', p.row)"
          />
        </q-td>
      </template>
    </q-table>

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
import { useQuasar } from 'quasar'
import { api, mensajeError } from '@/boot/axios'
import { colorEstado, fechaHora } from '@/utils/formato'

const $q = useQuasar()

const tab = ref('eventos')
const buscar = ref('')
const estado = ref(null)
const accion = ref(null)
const pagina = ref({ items: [], pagina: 1, totalPaginas: 1 })
const cargando = ref(false)

const estados = {
  eventos: ['Publicado', 'Suspendido', 'Cancelado', 'Finalizado', 'Borrador'],
  usuarios: ['Activo', 'Suspendido'],
  resenas: ['Visible', 'Oculta'],
}
const acciones = [
  'SuspenderEvento',
  'ReactivarEvento',
  'SuspenderUsuario',
  'ReactivarUsuario',
  'OcultarResena',
]
const clave = {
  eventos: 'idEvento',
  usuarios: 'idUsuario',
  resenas: 'idResena',
  historial: 'idModeracion',
}

const columnas = {
  eventos: [
    { name: 'nombre', label: 'Evento', field: 'nombre', align: 'left' },
    { name: 'organizador', label: 'Organizador', field: 'organizador', align: 'left' },
    { name: 'fecha', label: 'Fecha', field: 'fechaHoraInicio', align: 'left', format: fechaHora },
    { name: 'categoria', label: 'Categoría', field: 'categoria', align: 'left' },
    { name: 'estado', label: 'Estado', field: 'estado', align: 'center' },
    { name: 'acciones', label: '', field: 'idEvento', align: 'right' },
  ],
  usuarios: [
    { name: 'nombre', label: 'Nombre', field: 'nombre', align: 'left' },
    { name: 'correo', label: 'Correo', field: 'correo', align: 'left' },
    { name: 'roles', label: 'Roles', field: 'roles', align: 'left' },
    { name: 'estado', label: 'Estado', field: 'estado', align: 'center' },
    {
      name: 'fecha',
      label: 'Registro',
      field: 'fechaRegistro',
      align: 'left',
      format: (v) => new Date(v).toLocaleDateString('es-PE'),
    },
    { name: 'acciones', label: '', field: 'idUsuario', align: 'right' },
  ],
  resenas: [
    { name: 'evento', label: 'Evento', field: 'evento', align: 'left' },
    { name: 'usuario', label: 'Usuario', field: 'usuario', align: 'left' },
    { name: 'calificacion', label: 'Calificación', field: 'calificacion', align: 'left' },
    {
      name: 'comentario',
      label: 'Comentario',
      field: 'comentario',
      align: 'left',
      style: 'max-width: 320px; white-space: normal',
    },
    { name: 'estado', label: 'Estado', field: 'estado', align: 'center' },
    { name: 'acciones', label: '', field: 'idResena', align: 'right' },
  ],
  historial: [
    { name: 'fecha', label: 'Fecha', field: 'fechaAccion', align: 'left', format: fechaHora },
    { name: 'admin', label: 'Administrador', field: 'administrador', align: 'left' },
    { name: 'accion', label: 'Acción', field: 'accion', align: 'left' },
    {
      name: 'elemento',
      label: 'Elemento',
      field: (r) => `${r.tipoElemento}: ${r.elementoAfectado}`,
      align: 'left',
    },
    {
      name: 'motivo',
      label: 'Motivo',
      field: 'motivo',
      align: 'left',
      style: 'max-width: 320px; white-space: normal',
    },
  ],
}

async function cargar(numero = 1) {
  cargando.value = true
  try {
    const params =
      tab.value === 'historial'
        ? { accion: accion.value || undefined, pagina: numero }
        : { buscar: buscar.value || undefined, estado: estado.value || undefined, pagina: numero }
    const { data } = await api.get(`/Moderacion/${tab.value}`, { params })
    pagina.value = data.datos
  } catch (e) {
    $q.notify({ type: 'negative', message: mensajeError(e) })
  } finally {
    cargando.value = false
  }
}

function cambiarTab() {
  buscar.value = ''
  estado.value = null
  accion.value = null
  cargar(1)
}

// Criterio 9: motivo de al menos 10 caracteres y confirmación antes de aplicar
function pedirMotivo(tipo, fila) {
  const nombre = fila.nombre ?? `reseña de ${fila.usuario}`
  const titulos = { suspender: 'Suspender', reactivar: 'Reactivar', ocultar: 'Ocultar' }
  $q.dialog({
    title: `${titulos[tipo]}: ${nombre}`,
    message:
      tipo === 'reactivar'
        ? 'Motivo (opcional):'
        : 'Escribe el motivo (mínimo 10 caracteres). Se notificará al afectado.',
    prompt: {
      model: '',
      type: 'textarea',
      isValid: (v) => tipo === 'reactivar' || v.trim().length >= 10,
    },
    cancel: true,
    persistent: true,
  }).onOk((motivo) => {
    $q.dialog({
      title: '¿Estás seguro?',
      message: `Se aplicará «${titulos[tipo]}» a ${nombre}.`,
      cancel: true,
    }).onOk(() => aplicar(tipo, fila, motivo.trim()))
  })
}

async function aplicar(tipo, fila, motivo) {
  const id = fila[clave[tab.value]]
  const ruta =
    tab.value === 'resenas'
      ? `/Moderacion/resenas/${id}/ocultar`
      : `/Moderacion/${tab.value}/${id}/${tipo}`
  try {
    const { data } = await api.patch(ruta, { motivo: motivo || null })
    $q.notify({ type: 'positive', message: data.mensaje })
    cargar(pagina.value.pagina)
  } catch (e) {
    $q.notify({ type: 'negative', message: mensajeError(e) })
  }
}

onMounted(() => cargar(1))
</script>

<style scoped>
.tarjeta {
  border-radius: 14px;
}
</style>
