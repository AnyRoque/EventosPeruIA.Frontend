<template>
  <q-page class="contenedor q-px-md q-py-lg" style="max-width: 900px">
    <div class="text-h5 text-weight-bold q-mb-md">Mi perfil</div>

    <div class="row q-col-gutter-md">
      <!-- Datos (US-02) -->
      <div class="col-12 col-md-6">
        <q-card flat bordered class="tarjeta">
          <q-card-section class="row items-center">
            <q-avatar size="56px" color="primary" text-color="white">{{ auth.iniciales }}</q-avatar>
            <div class="q-ml-md">
              <div class="text-h6">{{ auth.nombre }}</div>
              <div>
                <q-badge v-for="r in auth.roles" :key="r" outline color="primary" class="q-mr-xs">{{
                  r
                }}</q-badge>
              </div>
            </div>
          </q-card-section>
          <q-separator />
          <q-list v-if="perfil" dense class="q-py-sm">
            <q-item
              ><q-item-section avatar><q-icon name="mail" /></q-item-section
              ><q-item-section>{{ perfil.correo }}</q-item-section></q-item
            >
            <q-item
              ><q-item-section avatar><q-icon name="phone" /></q-item-section
              ><q-item-section>{{ perfil.celular }}</q-item-section></q-item
            >
            <q-item
              ><q-item-section avatar><q-icon name="place" /></q-item-section
              ><q-item-section
                >{{ perfil.distrito }}, {{ perfil.departamento }}</q-item-section
              ></q-item
            >
            <q-item v-if="perfil.nombreOrganizador">
              <q-item-section avatar><q-icon name="storefront" /></q-item-section
              ><q-item-section>{{ perfil.nombreOrganizador }}</q-item-section>
            </q-item>
          </q-list>
        </q-card>

        <!-- Activar perfil de organizador -->
        <q-card v-if="!auth.esOrganizador && !auth.esAdmin" flat bordered class="tarjeta q-mt-md">
          <q-card-section>
            <div class="text-subtitle1 text-weight-bold">¿Quieres publicar eventos?</div>
            <div class="text-caption text-grey-7 q-mb-sm">
              Activa tu perfil de organizador con el nombre que verán los asistentes.
            </div>
            <q-input
              v-model="nombreOrganizador"
              outlined
              dense
              label="Nombre del organizador"
              counter
              maxlength="80"
            />
            <q-btn
              unelevated
              no-caps
              color="primary"
              class="q-mt-sm"
              label="Activar perfil de organizador"
              :loading="activando"
              :disable="nombreOrganizador.trim().length < 3"
              @click="activar"
            />
          </q-card-section>
        </q-card>
      </div>

      <!-- Intereses (US-08) -->
      <div class="col-12 col-md-6">
        <q-card flat bordered class="tarjeta">
          <q-card-section>
            <div class="text-subtitle1 text-weight-bold">Mis intereses</div>
            <div class="text-caption text-grey-7">
              Elige de 1 a 5 para recibir recomendaciones personalizadas.
            </div>
            <div class="q-mt-sm">
              <q-chip
                v-for="i in intereses"
                :key="i.idInteres"
                clickable
                :selected="seleccion.includes(i.idInteres)"
                :color="seleccion.includes(i.idInteres) ? 'primary' : 'grey-3'"
                :text-color="seleccion.includes(i.idInteres) ? 'white' : 'dark'"
                @click="alternar(i.idInteres)"
              >
                {{ i.nombre }}
              </q-chip>
            </div>
            <div class="text-caption q-mt-xs">{{ seleccion.length }}/5 seleccionados</div>
            <q-btn
              unelevated
              no-caps
              color="primary"
              class="q-mt-sm"
              label="Guardar intereses"
              :loading="guardando"
              :disable="seleccion.length === 0"
              @click="guardarIntereses"
            />
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useQuasar } from 'quasar'
import { api, mensajeError } from '@/boot/axios'
import { useAuthStore } from '@/stores/auth-store'

const $q = useQuasar()
const auth = useAuthStore()

const perfil = ref(null)
const intereses = ref([])
const seleccion = ref([])
const guardando = ref(false)
const nombreOrganizador = ref('')
const activando = ref(false)

function alternar(id) {
  if (seleccion.value.includes(id)) seleccion.value = seleccion.value.filter((x) => x !== id)
  else if (seleccion.value.length < 5) seleccion.value.push(id)
  else $q.notify({ type: 'warning', message: 'Puedes elegir como máximo 5 intereses.' })
}

async function guardarIntereses() {
  guardando.value = true
  try {
    const { data } = await api.put('/Recomendacion/mis-intereses', { idIntereses: seleccion.value })
    $q.notify({ type: 'positive', message: data.mensaje || 'Intereses guardados.' })
  } catch (e) {
    $q.notify({ type: 'negative', message: mensajeError(e) })
  } finally {
    guardando.value = false
  }
}

async function activar() {
  activando.value = true
  try {
    const mensaje = await auth.activarOrganizador(nombreOrganizador.value.trim())
    $q.notify({ type: 'positive', message: mensaje })
    cargarPerfil()
  } catch (e) {
    $q.notify({ type: 'negative', message: mensajeError(e) })
  } finally {
    activando.value = false
  }
}

async function cargarPerfil() {
  const { data } = await api.get('/Usuario/perfil')
  perfil.value = data.datos
}

onMounted(async () => {
  try {
    const [, resIntereses, resMios] = await Promise.all([
      cargarPerfil(),
      api.get('/Recomendacion/intereses'),
      api.get('/Recomendacion/mis-intereses'),
    ])
    intereses.value = resIntereses.data
    seleccion.value = (resMios.data.datos ?? []).map((i) => i.idInteres)
  } catch (e) {
    $q.notify({ type: 'negative', message: mensajeError(e) })
  }
})
</script>

<style scoped>
.tarjeta {
  border-radius: 14px;
}
</style>
