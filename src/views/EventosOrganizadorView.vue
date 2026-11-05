<template>
  <section>
    <div class="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
      <div>
        <p class="text-primary fw-semibold mb-1">Panel del organizador</p>
        <h1 class="h2 mb-0">Mis eventos</h1>
      </div>
      <button class="btn btn-primary" @click="startCreate">
        Crear evento
      </button>
    </div>

    <div v-if="pageError" class="alert alert-danger" role="alert">
      {{ pageError }}
      <button class="btn btn-sm btn-outline-danger ms-2" @click="loadEvents">Reintentar</button>
    </div>
    <div v-if="successMessage" class="alert alert-success" role="status">
      {{ successMessage }}
    </div>

    <section v-if="isFormOpen" class="card border-0 shadow-sm mb-4">
      <div class="card-body p-4">
        <h2 class="h5 mb-3">{{ editingEventId === null ? 'Nuevo evento' : 'Editar evento' }}</h2>
        <div v-if="formError" class="alert alert-danger" role="alert">{{ formError }}</div>
        <form class="row g-3" @submit.prevent="saveEvent">
          <div class="col-md-6">
            <label for="event-title" class="form-label">Título</label>
            <input
              id="event-title"
              v-model.trim="form.titulo"
              class="form-control"
              required
              maxlength="150"
            />
          </div>
          <div class="col-md-6">
            <label for="event-place" class="form-label">Lugar</label>
            <input
              id="event-place"
              v-model.trim="form.lugar"
              class="form-control"
              required
              maxlength="200"
            />
          </div>
          <div class="col-md-4">
            <label for="event-date" class="form-label">Fecha y hora</label>
            <input
              id="event-date"
              v-model="form.fecha"
              class="form-control"
              type="datetime-local"
              required
            />
          </div>
          <div class="col-md-4">
            <label for="event-capacity" class="form-label">Aforo</label>
            <input
              id="event-capacity"
              v-model.number="form.aforo"
              class="form-control"
              type="number"
              min="1"
              step="1"
              required
            />
          </div>
          <div class="col-md-4">
            <label for="event-price" class="form-label">Precio (S/)</label>
            <input
              id="event-price"
              v-model.number="form.precio"
              class="form-control"
              type="number"
              min="0"
              step="0.01"
              required
            />
          </div>
          <div class="col-12 d-flex justify-content-end gap-2">
            <button
              type="button"
              class="btn btn-outline-secondary"
              :disabled="isSaving"
              @click="closeForm"
            >
              Cancelar
            </button>
            <button type="submit" class="btn btn-primary" :disabled="isSaving">
              {{ isSaving ? 'Guardando…' : 'Guardar evento' }}
            </button>
          </div>
        </form>
      </div>
    </section>

    <div v-if="isLoading" class="text-center py-5" role="status">
      <span class="spinner-border text-primary me-2" aria-hidden="true" />
      Cargando eventos…
    </div>
    <div v-else-if="events.length === 0" class="card border-0 shadow-sm">
      <div class="card-body text-center py-5">
        <h2 class="h5">Aún no tienes eventos</h2>
        <p class="text-secondary mb-0">Crea tu primer evento para empezar a organizar.</p>
      </div>
    </div>
    <div v-else class="row g-3">
      <div v-for="event in events" :key="eventId(event)" class="col-12 col-lg-6">
        <article class="card border-0 shadow-sm h-100">
          <div class="card-body p-4">
            <div class="d-flex justify-content-between align-items-start gap-3">
              <div>
                <h2 class="h5 mb-1">{{ event.titulo }}</h2>
                <p class="text-secondary mb-3">{{ event.lugar }}</p>
              </div>
              <span class="badge text-bg-light">{{ formatDate(event.fecha) }}</span>
            </div>
            <p class="mb-3">
              Aforo: {{ event.aforo }} · Precio: {{ formatAmount(event.precio) }}
            </p>
            <div class="d-flex gap-2">
              <button class="btn btn-outline-primary btn-sm" @click="startEdit(event)">
                Editar
              </button>
              <button
                class="btn btn-outline-danger btn-sm"
                :disabled="eventId(event) === null"
                @click="selectedEventId = eventId(event)"
              >
                Cancelar evento
              </button>
            </div>
          </div>
        </article>
      </div>
    </div>

    <CancelarEventoModal
      v-if="selectedEventId !== null"
      :event-id="selectedEventId"
      @close="selectedEventId = null"
      @cancelled="handleCancelled"
    />
  </section>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import api, { getErrorMessage } from '../api/axios.js'
import CancelarEventoModal from '../components/CancelarEventoModal.vue'

const events = ref([])
const isLoading = ref(true)
const isSaving = ref(false)
const isFormOpen = ref(false)
const editingEventId = ref(null)
const selectedEventId = ref(null)
const pageError = ref('')
const formError = ref('')
const successMessage = ref('')
const form = reactive({
  titulo: '',
  lugar: '',
  fecha: '',
  aforo: 1,
  precio: 0,
})

onMounted(loadEvents)

function eventId(event) {
  return event.id ?? event.idEvento ?? null
}

function formatDate(value) {
  if (!value) {
    return 'Fecha por confirmar'
  }

  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat('es-PE', { dateStyle: 'medium', timeStyle: 'short' }).format(date)
}

function formatAmount(amount) {
  const value = Number(amount)
  return Number.isFinite(value)
    ? new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(value)
    : amount
}

async function loadEvents() {
  isLoading.value = true
  pageError.value = ''

  try {
    const response = await api.get('/Evento/mis-eventos')
    const data = response.data?.datos
    const list = Array.isArray(data) ? data : data?.eventos

    if (!Array.isArray(list)) {
      throw new Error('El servidor devolvió una lista de eventos con formato inválido.')
    }

    events.value = list
  } catch (error) {
    pageError.value = getErrorMessage(error)
  } finally {
    isLoading.value = false
  }
}

function resetForm() {
  form.titulo = ''
  form.lugar = ''
  form.fecha = ''
  form.aforo = 1
  form.precio = 0
}

function startCreate() {
  resetForm()
  editingEventId.value = null
  formError.value = ''
  successMessage.value = ''
  isFormOpen.value = true
}

function startEdit(event) {
  const id = eventId(event)

  if (id === null) {
    pageError.value = 'No se puede editar el evento: falta su identificador.'
    return
  }

  form.titulo = event.titulo || ''
  form.lugar = event.lugar || ''
  form.fecha = event.fecha ? toLocalDateTime(event.fecha) : ''
  form.aforo = Number(event.aforo) || 1
  form.precio = Number(event.precio) || 0
  editingEventId.value = id
  formError.value = ''
  successMessage.value = ''
  isFormOpen.value = true
}

function toLocalDateTime(value) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return ''
  }

  const offset = date.getTimezoneOffset() * 60000
  return new Date(date.getTime() - offset).toISOString().slice(0, 16)
}

function closeForm() {
  isFormOpen.value = false
  formError.value = ''
}

async function saveEvent() {
  isSaving.value = true
  formError.value = ''
  successMessage.value = ''
  const payload = {
    titulo: form.titulo,
    lugar: form.lugar,
    fecha: form.fecha,
    aforo: form.aforo,
    precio: form.precio,
  }

  try {
    if (editingEventId.value === null) {
      await api.post('/Evento', payload)
      successMessage.value = 'El evento se creó correctamente.'
    } else {
      await api.put(`/Evento/${encodeURIComponent(editingEventId.value)}`, payload)
      successMessage.value = 'El evento se actualizó correctamente.'
    }

    isFormOpen.value = false
    await loadEvents()
  } catch (error) {
    formError.value = getErrorMessage(error)
  } finally {
    isSaving.value = false
  }
}

async function handleCancelled() {
  selectedEventId.value = null
  successMessage.value = 'El evento se canceló correctamente.'
  await loadEvents()
}
</script>
