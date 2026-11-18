<template>
  <q-page class="page-content">
    <div class="section-heading">
      <div>
        <p class="eyebrow">PANEL DEL ORGANIZADOR</p>
        <h1>Mis eventos</h1>
        <p class="muted">Dale vida a tu próxima gran idea.</p>
      </div>
      <q-btn
        unelevated
        no-caps
        color="primary"
        icon="add"
        label="Crear evento"
        @click="openForm()"
      />
    </div>
    <q-banner rounded class="demo-banner q-mb-xl"
      ><template #avatar><q-icon name="science" color="secondary" /></template
      >Gestión de demostración. Puedes crear, editar y cancelar eventos de
      ejemplo; los cambios se reinician al recargar la página.</q-banner
    >
    <div class="management-stats">
      <q-card v-for="stat in stats" :key="stat.label" flat bordered
        ><q-card-section
          ><q-icon :name="stat.icon" color="secondary" size="26px" /><strong>{{
            stat.value
          }}</strong
          ><span>{{ stat.label }}</span></q-card-section
        ></q-card
      >
    </div>
    <div class="search-bar">
      <q-input
        v-model="search"
        outlined
        clearable
        label="Buscar mis eventos"
        class="search-input"
        ><template #prepend><q-icon name="search" /></template></q-input
      ><q-select
        v-model="status"
        outlined
        label="Estado"
        :options="['Todos', 'Publicado', 'Borrador', 'Cancelado']"
      />
    </div>
    <div class="management-list">
      <article v-for="event in filtered" :key="event.id" class="management-row">
        <div class="event-miniature">
          <q-icon :name="event.icono || 'festival'" size="30px" />
        </div>
        <div class="management-info">
          <div class="row items-center q-gutter-sm">
            <h2>{{ event.titulo }}</h2>
            <q-badge
              outline
              :color="
                event.estado === 'Publicado'
                  ? 'positive'
                  : event.estado === 'Cancelado'
                    ? 'negative'
                    : 'warning'
              "
              >{{ event.estado }}</q-badge
            >
          </div>
          <p class="muted">
            {{ formatDate(event.fecha) }} · {{ event.ciudad }}
          </p>
          <small class="muted"
            >{{ event.lugar }} · Aforo: {{ event.aforo }} ·
            {{ formatPrice(event.precio) }}</small
          >
        </div>
        <div class="management-actions">
          <q-btn
            flat
            no-caps
            icon="edit"
            label="Editar"
            :disable="event.estado === 'Cancelado'"
            @click="openForm(event)"
          /><q-btn
            flat
            round
            color="negative"
            icon="event_busy"
            :disable="event.estado === 'Cancelado'"
            :aria-label="'Cancelar evento: ' + event.titulo"
            @click="cancelTarget = event"
            ><q-tooltip>Cancelar evento</q-tooltip></q-btn
          >
        </div>
      </article>
      <div v-if="!filtered.length" class="empty-state">
        <q-icon name="event_note" size="48px" />
        <h2>No hay eventos con estos filtros</h2>
        <q-btn
          flat
          color="secondary"
          no-caps
          label="Limpiar filtros"
          @click="
            search = '';
            status = 'Todos';
          "
        />
      </div>
    </div>
    <q-dialog v-model="formOpen" persistent>
      <q-card class="event-form-dialog">
        <q-card-section class="row justify-between items-center"
          ><div>
            <p class="eyebrow">TU PRÓXIMA EXPERIENCIA</p>
            <h2>{{ editingId ? "Editar evento" : "Crear evento" }}</h2>
          </div>
          <q-btn
            flat
            round
            icon="close"
            aria-label="Cerrar formulario"
            v-close-popup
        /></q-card-section>
        <q-card-section>
          <q-form @submit="save" class="form-stack">
            <q-input
              v-model.trim="form.titulo"
              outlined
              label="Título del evento *"
              maxlength="150"
              :rules="[required]"
              lazy-rules
              hide-bottom-space
            />
            <div class="form-grid">
              <q-select
                v-model="form.categoria"
                outlined
                label="Categoría"
                :options="categories.filter((c) => c !== 'Todos')"
              /><q-select
                v-model="form.ciudad"
                outlined
                label="Ciudad"
                :options="['Lima', 'Cusco', 'Arequipa']"
              />
            </div>
            <q-input
              v-model.trim="form.lugar"
              outlined
              label="Lugar *"
              :rules="[required]"
              lazy-rules
              hide-bottom-space
            />
            <q-input
              v-model="form.fecha"
              outlined
              label="Fecha y hora *"
              type="datetime-local"
              stack-label
              :rules="[
                (v) =>
                  (!!v && new Date(v) > new Date()) ||
                  'Selecciona una fecha futura',
              ]"
              lazy-rules
              hide-bottom-space
            />
            <div class="form-grid">
              <q-input
                v-model.number="form.aforo"
                outlined
                label="Aforo *"
                type="number"
                min="1"
                step="1"
                :rules="[
                  (v) =>
                    (Number.isInteger(Number(v)) &&
                      Number(v) >= minimumCapacity) ||
                    'El aforo no puede ser menor a ' + minimumCapacity,
                ]"
                lazy-rules
                hide-bottom-space
              /><q-input
                v-model.number="form.precio"
                outlined
                label="Precio (S/) *"
                type="number"
                min="0"
                step="0.01"
                :rules="[
                  (v) =>
                    (v !== '' &&
                      Number.isFinite(Number(v)) &&
                      Number(v) >= 0) ||
                    'Ingresa un precio válido',
                ]"
                lazy-rules
                hide-bottom-space
              />
            </div>
            <q-input
              v-model.trim="form.descripcion"
              outlined
              label="Descripción"
              type="textarea"
              rows="3"
              maxlength="1000"
            />
            <q-select
              v-model="form.estado"
              outlined
              label="Estado"
              :options="['Borrador', 'Publicado']"
            />
            <div class="dialog-actions">
              <q-btn no-caps flat label="Volver" v-close-popup /><q-btn
                unelevated
                no-caps
                color="primary"
                type="submit"
                label="Guardar evento demo"
              />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>
    <CancelarEventoModal
      v-if="cancelTarget"
      :event="cancelTarget"
      @close="cancelTarget = null"
      @cancelled="cancelEvent"
    />
  </q-page>
</template>
<script setup>
import { computed, reactive, ref } from "vue";
import { useQuasar } from "quasar";
import { events, categories, formatDate, formatPrice } from "../state/demo.js";
import CancelarEventoModal from "../components/CancelarEventoModal.vue";
const $q = useQuasar();
const search = ref("");
const status = ref("Todos");
const formOpen = ref(false);
const editingId = ref(null);
const cancelTarget = ref(null);
const form = reactive({});
const required = (v) => !!v?.trim() || "Este campo es obligatorio";
const original = computed(() =>
  events.value.find((e) => e.id === editingId.value),
);
const minimumCapacity = computed(() =>
  Math.max(1, original.value ? original.value.aforo - original.value.cupos : 1),
);
const filtered = computed(() =>
  events.value.filter(
    (e) =>
      (status.value === "Todos" || e.estado === status.value) &&
      e.titulo
        .toLocaleLowerCase("es")
        .includes((search.value || "").toLocaleLowerCase("es")),
  ),
);
const stats = computed(() => [
  {
    label: "Eventos en total",
    value: events.value.length,
    icon: "calendar_month",
  },
  {
    label: "Publicados",
    value: events.value.filter((e) => e.estado === "Publicado").length,
    icon: "public",
  },
  {
    label: "En borrador",
    value: events.value.filter((e) => e.estado === "Borrador").length,
    icon: "edit_note",
  },
]);
function openForm(event) {
  editingId.value = event?.id || null;
  Object.assign(
    form,
    event || {
      titulo: "",
      categoria: "Tecnología",
      ciudad: "Lima",
      lugar: "",
      fecha: "",
      aforo: 100,
      precio: 0,
      descripcion: "",
      estado: "Borrador",
    },
  );
  formOpen.value = true;
}
function save() {
  const sold = original.value ? original.value.aforo - original.value.cupos : 0;
  const updated = {
    ...form,
    aforo: Number(form.aforo),
    precio: Number(form.precio),
    cupos: Number(form.aforo) - sold,
  };
  if (original.value) Object.assign(original.value, updated);
  else
    events.value.unshift({
      ...updated,
      id: Math.max(...events.value.map((e) => e.id), 0) + 1,
      icono: "festival",
      imagen: "",
    });
  formOpen.value = false;
  $q.notify({
    type: "positive",
    message: "Evento guardado en la demostración.",
  });
}
function cancelEvent(reason) {
  cancelTarget.value.estado = "Cancelado";
  cancelTarget.value.motivoCancelacion = reason;
  cancelTarget.value = null;
  $q.notify({
    type: "positive",
    message:
      "Evento cancelado en la demostración. No se enviaron notificaciones reales.",
  });
}
</script>
