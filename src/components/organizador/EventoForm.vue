<template>
  <q-form ref="formulario" class="row q-col-gutter-md" @submit.prevent>
    <div class="col-12 col-md-8">
      <q-card flat bordered class="tarjeta">
        <q-card-section class="q-gutter-md">
          <q-input
            v-model="f.nombre"
            outlined
            label="Nombre del evento *"
            counter
            maxlength="150"
            :rules="[(v) => (v?.trim().length ?? 0) >= 5 || 'Entre 5 y 150 caracteres']"
          />
          <q-input
            v-model="f.descripcion"
            outlined
            type="textarea"
            autogrow
            label="Descripción *"
            counter
            maxlength="1000"
            :rules="[(v) => (v?.trim().length ?? 0) >= 20 || 'Mínimo 20 caracteres']"
          />
          <q-select
            v-model="f.idCategoria"
            outlined
            emit-value
            map-options
            :options="categorias"
            option-value="idCategoria"
            option-label="nombre"
            label="Categoría *"
            :rules="[(v) => !!v || 'Elige una categoría']"
          />

          <div class="row q-col-gutter-md">
            <div class="col-12 col-sm-6">
              <q-input
                v-model="f.fechaHoraInicio"
                outlined
                type="datetime-local"
                label="Inicio *"
                stack-label
                :rules="[(v) => !!v || 'Obligatorio']"
              />
            </div>
            <div class="col-12 col-sm-6">
              <q-input
                v-model="f.fechaHoraFin"
                outlined
                type="datetime-local"
                label="Fin *"
                stack-label
                :rules="[
                  (v) => !!v || 'Obligatorio',
                  (v) => v > f.fechaHoraInicio || 'Debe ser posterior al inicio',
                ]"
              />
            </div>
          </div>

          <div class="row q-col-gutter-md">
            <div class="col-12 col-sm-6">
              <q-select
                v-model="f.departamento"
                outlined
                :options="departamentos"
                label="Departamento *"
                :rules="[(v) => !!v || 'Obligatorio']"
              />
            </div>
            <div class="col-12 col-sm-6">
              <q-input
                v-model="f.distrito"
                outlined
                label="Distrito *"
                :rules="[(v) => !!v?.trim() || 'Obligatorio']"
              />
            </div>
          </div>
          <q-input
            v-model="f.direccion"
            outlined
            label="Dirección *"
            :rules="[(v) => (v?.trim().length ?? 0) >= 5 || 'Mínimo 5 caracteres']"
          />

          <div class="row q-col-gutter-md">
            <div class="col-6">
              <q-input
                v-model.number="f.aforoMaximo"
                outlined
                type="number"
                min="1"
                max="10000"
                label="Aforo *"
                :rules="[(v) => (v >= 1 && v <= 10000) || 'Entre 1 y 10 000']"
              />
            </div>
            <div class="col-6">
              <q-input
                v-model.number="f.precio"
                outlined
                type="number"
                min="0"
                step="0.01"
                prefix="S/"
                label="Precio (0 = gratis) *"
                :rules="[(v) => (v >= 0 && v <= 9999.99) || 'Entre 0 y 9 999.99']"
              />
            </div>
          </div>
        </q-card-section>
      </q-card>
    </div>

    <!-- Imagen de portada: opcional, JPG o PNG, máximo 2 MB -->
    <div class="col-12 col-md-4">
      <q-card flat bordered class="tarjeta">
        <q-card-section>
          <div class="text-subtitle2 q-mb-sm">Imagen de portada</div>
          <div class="portada">
            <img v-if="vistaPrevia" :src="vistaPrevia" alt="Portada" />
            <div v-else class="text-grey-6 text-center">
              <q-icon name="image" size="48px" />
              <div>Sin imagen</div>
            </div>
          </div>
          <q-file
            v-model="archivo"
            outlined
            dense
            class="q-mt-sm"
            accept=".jpg,.jpeg,.png,image/jpeg,image/png"
            max-file-size="2097152"
            label="Elegir imagen (JPG o PNG, máx. 2 MB)"
            clearable
            @rejected="
              $q.notify({
                type: 'negative',
                message: 'La imagen debe ser JPG o PNG de máximo 2 MB.',
              })
            "
          >
            <template #prepend><q-icon name="upload" /></template>
          </q-file>
          <q-btn
            v-if="idEvento && imagenActual && !archivo"
            flat
            no-caps
            dense
            color="negative"
            icon="delete"
            label="Quitar imagen"
            class="q-mt-sm"
            @click="quitarImagen"
          />
        </q-card-section>
      </q-card>

      <q-card flat bordered class="tarjeta q-mt-md">
        <q-card-section class="q-gutter-sm">
          <q-banner v-if="error" dense rounded class="bg-red-1 text-negative">{{ error }}</q-banner>
          <template v-if="!idEvento">
            <q-btn
              unelevated
              no-caps
              color="primary"
              class="full-width"
              icon="publish"
              label="Publicar evento"
              :loading="guardando === 'publicar'"
              @click="guardar(true)"
            />
            <q-btn
              outline
              no-caps
              color="primary"
              class="full-width"
              icon="save"
              label="Guardar como borrador"
              :loading="guardando === 'borrador'"
              @click="guardar(false)"
            />
          </template>
          <q-btn
            v-else
            unelevated
            no-caps
            color="primary"
            class="full-width"
            icon="save"
            label="Guardar cambios"
            :loading="!!guardando"
            @click="guardar(false)"
          />
        </q-card-section>
      </q-card>
    </div>
  </q-form>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'
import { api, mensajeError } from '@/boot/axios'
import { departamentos, urlImagen } from '@/utils/formato'

const props = defineProps({ idEvento: { type: Number, default: null } })

const $q = useQuasar()
const router = useRouter()

const formulario = ref(null)
const categorias = ref([])
const archivo = ref(null)
const imagenActual = ref(null)
const guardando = ref('')
const error = ref('')
const f = ref({
  nombre: '',
  descripcion: '',
  idCategoria: null,
  fechaHoraInicio: '',
  fechaHoraFin: '',
  departamento: 'Lima',
  distrito: '',
  direccion: '',
  aforoMaximo: 100,
  precio: 0,
})

const vistaPrevia = ref(null)
watch(archivo, (nuevo) => {
  vistaPrevia.value = nuevo ? URL.createObjectURL(nuevo) : urlImagen(imagenActual.value)
})

// "2026-12-20T19:00:00" → "2026-12-20T19:00" (formato del input datetime-local)
const aInput = (fecha) => (fecha ? fecha.slice(0, 16) : '')
const cuerpo = computed(() => ({
  ...f.value,
  nombre: f.value.nombre.trim(),
  descripcion: f.value.descripcion.trim(),
}))

async function subirImagen(id) {
  if (!archivo.value) return
  const datos = new FormData()
  datos.append('imagen', archivo.value)
  try {
    await api.post(`/Evento/${id}/imagen`, datos)
  } catch (e) {
    $q.notify({
      type: 'warning',
      message: `El evento se guardó, pero la imagen no: ${mensajeError(e)}`,
    })
  }
}

async function guardar(publicar, confirmarCambios = false) {
  if (!(await formulario.value.validate())) return
  guardando.value = publicar ? 'publicar' : 'borrador'
  error.value = ''
  try {
    let id = props.idEvento
    let mensaje
    if (id) {
      const { data } = await api.put(`/Evento/${id}`, { ...cuerpo.value, confirmarCambios })
      mensaje = data.mensaje
    } else {
      const { data } = await api.post('/Evento', { ...cuerpo.value, publicar })
      id = data.datos.idEvento
      mensaje = data.mensaje
    }
    await subirImagen(id)
    $q.notify({ type: 'positive', message: mensaje })
    router.push('/organizador/eventos')
  } catch (e) {
    // US-03: cambio de fecha o lugar con entradas vendidas → pedir confirmación
    if (
      e.response?.status === 409 &&
      !confirmarCambios &&
      e.response.data?.mensaje?.includes('confirmarCambios')
    ) {
      $q.dialog({
        title: 'Confirmar cambios',
        message: e.response.data.mensaje.split('.')[0] + '. ¿Deseas guardar los cambios?',
        cancel: true,
      }).onOk(() => guardar(publicar, true))
    } else {
      error.value = mensajeError(e)
    }
  } finally {
    guardando.value = ''
  }
}

function quitarImagen() {
  $q.dialog({
    title: 'Quitar imagen',
    message: '¿Quitar la imagen de portada?',
    cancel: true,
  }).onOk(async () => {
    try {
      await api.delete(`/Evento/${props.idEvento}/imagen`)
      imagenActual.value = null
      vistaPrevia.value = null
    } catch (e) {
      $q.notify({ type: 'negative', message: mensajeError(e) })
    }
  })
}

onMounted(async () => {
  const { data } = await api.get('/Categoria')
  categorias.value = data
  if (props.idEvento) {
    try {
      const { data: res } = await api.get(`/Evento/${props.idEvento}`)
      const e = res.datos
      f.value = {
        nombre: e.nombre,
        descripcion: e.descripcion,
        idCategoria: e.idCategoria,
        fechaHoraInicio: aInput(e.fechaHoraInicio),
        fechaHoraFin: aInput(e.fechaHoraFin),
        departamento: e.departamento,
        distrito: e.distrito,
        direccion: e.direccion,
        aforoMaximo: e.aforoMaximo,
        precio: e.precio,
      }
      imagenActual.value = e.imagenUrl
      vistaPrevia.value = urlImagen(e.imagenUrl)
    } catch (e) {
      error.value = mensajeError(e)
    }
  }
})
</script>

<style scoped>
.tarjeta {
  border-radius: 14px;
}
.portada {
  height: 180px;
  border-radius: 12px;
  background: #eef0f4;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}
.portada img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>
