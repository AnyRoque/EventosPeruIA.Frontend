<template>
  <q-dialog v-model="visible" persistent>
    <q-card style="width: 460px; max-width: 95vw; border-radius: 16px">
      <!-- Paso 2: compra confirmada -->
      <template v-if="resultado">
        <q-card-section class="text-center q-pt-lg">
          <q-icon name="check_circle" color="positive" size="64px" />
          <div class="text-h6 text-weight-bold q-mt-sm">¡Compra confirmada!</div>
          <div class="text-grey-7">N° de compra {{ resultado.numeroCompra }}</div>
        </q-card-section>
        <q-card-section>
          <div class="row justify-between">
            <span>Evento</span><b class="text-right">{{ resultado.evento }}</b>
          </div>
          <div class="row justify-between">
            <span>Entradas</span><b>{{ resultado.cantidad }}</b>
          </div>
          <div class="row justify-between">
            <span>Total</span><b>{{ soles(resultado.montoTotal) }}</b>
          </div>
          <div class="text-caption text-grey-7 q-mt-sm">
            Te enviamos una notificación con el detalle.
          </div>
        </q-card-section>
        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat no-caps label="Cerrar" @click="cerrar" />
          <q-btn
            unelevated
            no-caps
            color="primary"
            icon="download"
            label="Descargar PDF"
            @click="pdf"
          />
          <q-btn unelevated no-caps color="secondary" label="Ver mis entradas" to="/mis-entradas" />
        </q-card-actions>
      </template>

      <!-- Paso 1: datos de la compra -->
      <q-form v-else @submit="comprar">
        <q-card-section class="row items-center">
          <div class="text-h6 text-weight-bold">Comprar entradas</div>
          <q-space />
          <q-btn flat round dense icon="close" :disable="cargando" @click="cerrar" />
        </q-card-section>

        <q-card-section class="q-pt-none">
          <div class="text-subtitle1 text-weight-medium">{{ evento.nombre }}</div>
          <div class="text-caption text-grey-7">
            {{ evento.precioTexto }} por entrada · {{ cupos }} cupos
          </div>

          <div class="row items-center q-mt-md">
            <span class="q-mr-md">Cantidad</span>
            <q-btn round dense flat icon="remove" :disable="cantidad <= 1" @click="cantidad--" />
            <span class="text-h6 q-mx-md">{{ cantidad }}</span>
            <q-btn round dense flat icon="add" :disable="cantidad >= maximo" @click="cantidad++" />
            <q-space />
            <div class="text-h6 text-weight-bold">{{ esGratis ? 'Gratis' : soles(total) }}</div>
          </div>
          <div class="text-caption text-grey-7">Máximo {{ maximo }} por compra.</div>
        </q-card-section>

        <!-- Pago simulado (solo eventos con precio) -->
        <q-card-section v-if="!esGratis" class="q-pt-none q-gutter-sm">
          <div class="text-subtitle2">Pago con tarjeta (simulado)</div>
          <q-input
            v-model="titular"
            outlined
            dense
            label="Titular de la tarjeta"
            :rules="[(v) => !!v?.trim() || 'Obligatorio']"
          />
          <q-input
            v-model="numero"
            outlined
            dense
            label="Número de tarjeta"
            mask="#### #### #### ####"
            unmasked-value
            hint="Prueba: 4111 1111 1111 1111 (aprobada) · terminada en 0000 (rechazada)"
            :rules="[(v) => (v && v.length === 16) || '16 dígitos']"
          />
          <div class="row q-col-gutter-sm">
            <div class="col-6">
              <q-input
                v-model="vencimiento"
                outlined
                dense
                label="Vencimiento"
                mask="##/##"
                placeholder="MM/AA"
                :rules="[(v) => /^(0[1-9]|1[0-2])\/\d{2}$/.test(v || '') || 'MM/AA']"
              />
            </div>
            <div class="col-6">
              <q-input
                v-model="cvv"
                outlined
                dense
                label="CVV"
                mask="###"
                type="password"
                :rules="[(v) => (v && v.length === 3) || '3 dígitos']"
              />
            </div>
          </div>
        </q-card-section>

        <q-card-section v-if="error" class="q-pt-none">
          <q-banner dense rounded class="bg-red-1 text-negative">{{ error }}</q-banner>
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md">
          <q-btn
            type="submit"
            unelevated
            no-caps
            color="primary"
            size="lg"
            class="full-width"
            :loading="cargando"
            :label="esGratis ? 'Reservar entradas gratis' : `Pagar ${soles(total)}`"
          />
        </q-card-actions>
      </q-form>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { api, mensajeError } from '@/boot/axios'
import { descargar, soles } from '@/utils/formato'

const props = defineProps({
  evento: { type: Object, required: true },
  cupos: { type: Number, required: true },
})
const emit = defineEmits(['comprado'])
const visible = defineModel({ type: Boolean, default: false })

const cantidad = ref(1)
const titular = ref('')
const numero = ref('')
const vencimiento = ref('')
const cvv = ref('')
const cargando = ref(false)
const error = ref('')
const resultado = ref(null)
// Mismo código si se reintenta: la API no cobra dos veces (idempotencia)
let codigoOperacion = crypto.randomUUID()

const esGratis = computed(() => props.evento.precio === 0)
const maximo = computed(() => Math.max(1, Math.min(10, props.cupos)))
const total = computed(() => props.evento.precio * cantidad.value)

watch(visible, (abierto) => {
  if (abierto) {
    resultado.value = null
    error.value = ''
    cantidad.value = 1
    codigoOperacion = crypto.randomUUID()
  }
})

async function comprar() {
  cargando.value = true
  error.value = ''
  try {
    const { data } = await api.post('/Compra', {
      codigoOperacion,
      idEvento: props.evento.idEvento,
      cantidad: cantidad.value,
      titularTarjeta: esGratis.value ? null : titular.value,
      numeroTarjeta: esGratis.value ? null : numero.value,
      vencimiento: esGratis.value ? null : vencimiento.value,
      cvv: esGratis.value ? null : cvv.value,
    })
    resultado.value = data.datos
    emit('comprado')
  } catch (e) {
    error.value = mensajeError(e)
    codigoOperacion = crypto.randomUUID()
  } finally {
    cargando.value = false
  }
}

function pdf() {
  descargar(
    api,
    `/Compra/${resultado.value.idCompra}/pdf`,
    `Entradas_${resultado.value.numeroCompra}.pdf`,
  )
}

function cerrar() {
  visible.value = false
}
</script>
