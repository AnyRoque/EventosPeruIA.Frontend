<template>
  <Teleport to="body">
    <div class="modal-backdrop fade show" @click="$emit('close')" />
    <div class="modal fade show d-block" tabindex="-1" role="dialog" aria-modal="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h2 class="modal-title fs-5">Cancelar evento</h2>
            <button
              type="button"
              class="btn-close"
              aria-label="Cerrar"
              :disabled="isSubmitting"
              @click="$emit('close')"
            />
          </div>
          <form @submit.prevent="cancelEvent">
            <div class="modal-body">
              <p class="text-secondary">
                Revisa el impacto antes de confirmar la cancelación.
              </p>

              <div v-if="isLoading" class="text-center py-3" role="status">
                <span class="spinner-border spinner-border-sm me-2" aria-hidden="true" />
                Cargando resumen…
              </div>
              <div v-else-if="errorMessage" class="alert alert-danger" role="alert">
                {{ errorMessage }}
                <button
                  v-if="!summary"
                  type="button"
                  class="btn btn-sm btn-outline-danger ms-2"
                  @click="loadSummary"
                >
                  Reintentar
                </button>
              </div>

              <dl v-if="summary" class="row mb-4">
                <dt class="col-7">Entradas vendidas</dt>
                <dd class="col-5 text-end">{{ summary.entradasVendidas }}</dd>
                <dt class="col-7">Compradores a notificar</dt>
                <dd class="col-5 text-end">{{ summary.totalCompradores }}</dd>
                <dt class="col-7">Monto a devolver</dt>
                <dd class="col-5 text-end">
                  {{ formatAmount(summary.montoADevolver) }}
                </dd>
              </dl>

              <label for="cancel-reason" class="form-label">Motivo de cancelación</label>
              <textarea
                id="cancel-reason"
                v-model="reason"
                class="form-control"
                rows="4"
                minlength="20"
                maxlength="500"
                required
                :disabled="isSubmitting"
                placeholder="Explica el motivo (entre 20 y 500 caracteres)"
              />
              <div class="form-text text-end">{{ reason.length }}/500 caracteres</div>
            </div>
            <div class="modal-footer">
              <button
                type="button"
                class="btn btn-outline-secondary"
                :disabled="isSubmitting"
                @click="$emit('close')"
              >
                Volver
              </button>
              <button
                class="btn btn-danger"
                type="submit"
                :disabled="isSubmitting || isLoading || !summary || !isReasonValid"
              >
                {{ isSubmitting ? 'Cancelando…' : 'Confirmar cancelación' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import api, { getErrorMessage } from '../api/axios.js'

const props = defineProps({
  eventId: {
    type: [String, Number],
    required: true,
  },
})
const emit = defineEmits(['close', 'cancelled'])

const summary = ref(null)
const reason = ref('')
const isLoading = ref(true)
const isSubmitting = ref(false)
const errorMessage = ref('')
const isReasonValid = computed(() => reason.value.trim().length >= 20 && reason.value.trim().length <= 500)

onMounted(loadSummary)

function formatAmount(amount) {
  const value = Number(amount)

  if (!Number.isFinite(value)) {
    return amount
  }

  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
  }).format(value)
}

async function loadSummary() {
  isLoading.value = true
  errorMessage.value = ''

  try {
    const response = await api.get(`/Evento/${encodeURIComponent(props.eventId)}/resumen-cancelacion`)
    const data = response.data?.datos

    if (
      !data
      || data.entradasVendidas === undefined
      || data.totalCompradores === undefined
      || data.montoADevolver === undefined
    ) {
      throw new Error('El servidor devolvió un resumen de cancelación incompleto.')
    }

    summary.value = data
  } catch (error) {
    errorMessage.value = getErrorMessage(error)
  } finally {
    isLoading.value = false
  }
}

async function cancelEvent() {
  if (!isReasonValid.value || !summary.value) {
    return
  }

  isSubmitting.value = true
  errorMessage.value = ''

  try {
    await api.post(`/Evento/${encodeURIComponent(props.eventId)}/cancelar`, {
      motivo: reason.value.trim(),
    })
    emit('cancelled')
  } catch (error) {
    errorMessage.value = getErrorMessage(error)
  } finally {
    isSubmitting.value = false
  }
}
</script>
