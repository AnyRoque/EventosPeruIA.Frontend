<template>
  <q-page class="contenedor q-px-md q-py-lg" style="max-width: 1000px">
    <div class="row items-center q-mb-md">
      <div>
        <div class="text-h5 text-weight-bold">Categorías</div>
        <div class="text-grey-7">
          Las categorías activas aparecen en el buscador y al crear eventos.
        </div>
      </div>
      <q-space />
      <q-btn
        unelevated
        no-caps
        color="primary"
        icon="add"
        label="Nueva categoría"
        @click="abrir()"
      />
    </div>

    <q-table
      flat
      bordered
      :rows="categorias"
      :columns="columnas"
      row-key="idCategoria"
      :loading="cargando"
      :filter="buscar"
      :grid="$q.screen.lt.sm"
      class="tarjeta"
    >
      <template #top-right>
        <q-input v-model="buscar" dense outlined debounce="300" placeholder="Buscar">
          <template #append><q-icon name="search" /></template>
        </q-input>
      </template>
      <template #body-cell-estado="p">
        <q-td :props="p"
          ><q-chip dense :color="colorEstado(p.row.estado)" text-color="white">{{
            p.row.estado
          }}</q-chip></q-td
        >
      </template>
      <template #body-cell-acciones="p">
        <q-td :props="p">
          <q-btn
            flat
            dense
            no-caps
            icon="edit"
            color="primary"
            label="Editar"
            @click="abrir(p.row)"
          />
          <q-btn
            v-if="p.row.estado === 'Activa'"
            flat
            dense
            no-caps
            icon="block"
            color="negative"
            label="Desactivar"
            @click="desactivar(p.row)"
          />
          <q-btn
            v-else
            flat
            dense
            no-caps
            icon="restart_alt"
            color="positive"
            label="Reactivar"
            @click="reactivar(p.row)"
          />
        </q-td>
      </template>
    </q-table>

    <q-dialog v-model="dialogo">
      <q-card style="width: 440px; max-width: 95vw">
        <q-form @submit="guardar">
          <q-card-section class="text-h6">{{
            editando ? 'Editar categoría' : 'Nueva categoría'
          }}</q-card-section>
          <q-card-section class="q-pt-none q-gutter-md">
            <q-input
              v-model="form.nombre"
              outlined
              label="Nombre *"
              counter
              maxlength="80"
              :rules="[(v) => (v?.trim().length ?? 0) >= 3 || 'Mínimo 3 caracteres']"
            />
            <q-input
              v-model="form.descripcion"
              outlined
              type="textarea"
              autogrow
              label="Descripción"
              counter
              maxlength="250"
            />
          </q-card-section>
          <q-card-actions align="right">
            <q-btn v-close-popup flat no-caps label="Cancelar" />
            <q-btn
              type="submit"
              unelevated
              no-caps
              color="primary"
              label="Guardar"
              :loading="guardando"
            />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useQuasar } from 'quasar'
import { api, mensajeError } from '@/boot/axios'
import { colorEstado } from '@/utils/formato'

const $q = useQuasar()

const categorias = ref([])
const cargando = ref(true)
const buscar = ref('')
const dialogo = ref(false)
const editando = ref(null)
const form = ref({ nombre: '', descripcion: '' })
const guardando = ref(false)

const columnas = [
  { name: 'nombre', label: 'Nombre', field: 'nombre', align: 'left', sortable: true },
  { name: 'descripcion', label: 'Descripción', field: 'descripcion', align: 'left' },
  { name: 'eventos', label: 'Eventos', field: 'cantidadEventos', align: 'center', sortable: true },
  { name: 'estado', label: 'Estado', field: 'estado', align: 'center' },
  { name: 'acciones', label: '', field: 'idCategoria', align: 'right' },
]

const avisar = (data) => $q.notify({ type: 'positive', message: data.mensaje })
const fallo = (e) => $q.notify({ type: 'negative', message: mensajeError(e) })

async function cargar() {
  cargando.value = true
  try {
    const { data } = await api.get('/Categoria/admin')
    categorias.value = data
  } catch (e) {
    fallo(e)
  } finally {
    cargando.value = false
  }
}

function abrir(c = null) {
  editando.value = c
  form.value = { nombre: c?.nombre ?? '', descripcion: c?.descripcion ?? '' }
  dialogo.value = true
}

async function guardar() {
  guardando.value = true
  try {
    const cuerpo = {
      nombre: form.value.nombre.trim(),
      descripcion: form.value.descripcion?.trim() || null,
    }
    const { data } = editando.value
      ? await api.put(`/Categoria/${editando.value.idCategoria}`, cuerpo)
      : await api.post('/Categoria', cuerpo)
    avisar(data)
    dialogo.value = false
    cargar()
  } catch (e) {
    fallo(e)
  } finally {
    guardando.value = false
  }
}

async function desactivar(c, confirmar = false) {
  try {
    const { data } = await api.patch(`/Categoria/${c.idCategoria}/desactivar`, null, {
      params: { confirmar },
    })
    avisar(data)
    cargar()
  } catch (e) {
    // 409: tiene eventos publicados → se pide confirmación
    if (e.response?.status === 409 && !confirmar) {
      $q.dialog({
        title: 'Desactivar categoría',
        message: e.response.data.mensaje,
        cancel: true,
      }).onOk(() => desactivar(c, true))
    } else fallo(e)
  }
}

async function reactivar(c) {
  try {
    avisar((await api.patch(`/Categoria/${c.idCategoria}/reactivar`)).data)
    cargar()
  } catch (e) {
    fallo(e)
  }
}

onMounted(cargar)
</script>

<style scoped>
.tarjeta {
  border-radius: 14px;
}
</style>
