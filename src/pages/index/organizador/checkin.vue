<template>
  <q-page class="contenedor q-px-md q-py-lg" style="max-width: 900px">
    <div class="text-h5 text-weight-bold">Check-in</div>
    <div class="text-grey-7 q-mb-md">
      Valida las entradas en el ingreso. Puedes escribir o escanear el código QR.
    </div>

    <q-select
      v-model="idEvento"
      outlined
      emit-value
      map-options
      :options="eventos"
      option-value="idEvento"
      :option-label="(e) => `${e.nombre} · ${hora(e.fechaHoraInicio)}`"
      label="Evento de hoy"
      :loading="cargando"
      @update:model-value="cambiarEvento"
    >
      <template #no-option
        ><q-item
          ><q-item-section class="text-grey">No tienes eventos hoy.</q-item-section></q-item
        ></template
      >
    </q-select>

    <template v-if="idEvento">
      <div class="row q-col-gutter-md q-mt-sm">
        <div class="col-12 col-md-7">
          <q-card flat bordered class="tarjeta">
            <q-card-section>
              <q-form class="row q-col-gutter-sm" @submit="validar">
                <div class="col-12 col-sm">
                  <q-input
                    ref="campo"
                    v-model="codigo"
                    outlined
                    autofocus
                    label="Código de la entrada"
                    hint="El escáner escribe el código y presiona Enter"
                  >
                    <template #prepend><q-icon name="qr_code_scanner" /></template>
                  </q-input>
                </div>
                <div class="col-12 col-sm-auto">
                  <q-btn
                    type="submit"
                    unelevated
                    no-caps
                    color="primary"
                    label="Validar"
                    class="full-width"
                    style="height: 56px"
                    :loading="validando"
                    :disable="!codigo.trim()"
                  />
                </div>
              </q-form>
            </q-card-section>

            <!-- Resultado: verde = puede pasar, rojo = no -->
            <q-card-section v-if="resultado">
              <div class="resultado" :class="resultado.permitido ? 'bg-positive' : 'bg-negative'">
                <q-icon :name="resultado.permitido ? 'check_circle' : 'cancel'" size="56px" />
                <div class="text-h6 q-mt-sm">{{ resultado.mensaje }}</div>
                <div v-if="resultado.asistente">
                  {{ resultado.asistente }} · Entrada {{ resultado.numeroEntrada }} de
                  {{ resultado.totalEntradas }}
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>

        <div class="col-12 col-md-5">
          <q-card flat bordered class="tarjeta">
            <q-card-section class="text-center">
              <div class="text-caption text-grey-7">Ingresaron</div>
              <div class="text-h3 text-weight-bold">{{ resumen?.contador ?? '—' }}</div>
              <q-linear-progress
                v-if="resumen?.vendidas"
                :value="resumen.ingresados / resumen.vendidas"
                rounded
                size="10px"
                class="q-mt-sm"
              />
            </q-card-section>
            <q-separator />
            <q-list dense>
              <q-item-label header>Últimos ingresos</q-item-label>
              <q-item v-for="(i, n) in resumen?.ultimosIngresos ?? []" :key="n">
                <q-item-section>{{ i.asistente }}</q-item-section>
                <q-item-section side>{{ hora(i.fechaHora) }}</q-item-section>
              </q-item>
              <q-item v-if="!resumen?.ultimosIngresos?.length"
                ><q-item-section class="text-grey">Aún no hay ingresos.</q-item-section></q-item
              >
            </q-list>
          </q-card>
        </div>
      </div>
    </template>
  </q-page>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useQuasar } from 'quasar'
import { api, mensajeError } from '@/boot/axios'
import { hora } from '@/utils/formato'

const $q = useQuasar()

const eventos = ref([])
const idEvento = ref(null)
const codigo = ref('')
const resultado = ref(null)
const resumen = ref(null)
const cargando = ref(true)
const validando = ref(false)
const campo = ref(null)

function cambiarEvento() {
  resultado.value = null
  cargarResumen()
}

async function cargarResumen() {
  try {
    const { data } = await api.get(`/CheckIn/${idEvento.value}/resumen`)
    resumen.value = data.datos
  } catch (e) {
    $q.notify({ type: 'negative', message: mensajeError(e) })
  }
}

async function validar() {
  validando.value = true
  try {
    const { data } = await api.post('/CheckIn/validar', {
      idEvento: idEvento.value,
      codigo: codigo.value.trim(),
    })
    resultado.value = data.datos ?? { permitido: false, mensaje: data.mensaje }
  } catch (e) {
    resultado.value = e.response?.data?.datos ?? { permitido: false, mensaje: mensajeError(e) }
  } finally {
    validando.value = false
    codigo.value = ''
    campo.value?.focus()
    cargarResumen()
  }
}

onMounted(async () => {
  try {
    const { data } = await api.get('/CheckIn/eventos')
    eventos.value = data
    if (data.length === 1) {
      idEvento.value = data[0].idEvento
      cargarResumen()
    }
  } catch (e) {
    $q.notify({ type: 'negative', message: mensajeError(e) })
  } finally {
    cargando.value = false
  }
})
</script>

<style scoped>
.tarjeta {
  border-radius: 14px;
}
.resultado {
  color: white;
  border-radius: 12px;
  padding: 24px;
  text-align: center;
}
</style>
