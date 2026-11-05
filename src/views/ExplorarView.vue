<template>
  <q-page class="page-content">
    <div class="page-heading">
      <p class="eyebrow">ENCUENTRA TU PRÓXIMA EXPERIENCIA</p>
      <h1>Explorar eventos</h1>
      <p class="muted">Hay un plan para cada pasión. Descubre el tuyo.</p>
    </div>
    <div class="search-bar">
      <q-input
        v-model="search"
        outlined
        clearable
        label="Buscar eventos"
        placeholder="Nombre, lugar o ciudad"
        class="search-input"
        ><template #prepend><q-icon name="search" /></template></q-input
      ><q-select
        v-model="city"
        outlined
        :options="['Todas las ciudades', 'Lima', 'Cusco', 'Arequipa']"
        label="Ciudad"
      />
    </div>
    <div class="filter-chips">
      <q-btn
        v-for="category in categories"
        :key="category"
        no-caps
        :unelevated="selectedCategory === category"
        :outline="selectedCategory !== category"
        :color="selectedCategory === category ? 'primary' : undefined"
        :label="category"
        :aria-pressed="selectedCategory === category"
        @click="selectedCategory = category"
      />
    </div>
    <div class="results-heading">
      <span
        >{{ filtered.length }}
        {{
          filtered.length === 1 ? "evento disponible" : "eventos disponibles"
        }}</span
      ><q-badge outline color="secondary">Catálogo de demostración</q-badge>
    </div>
    <div v-if="filtered.length" class="event-grid">
      <EventCard
        v-for="event in filtered"
        :key="event.id"
        :event="event"
        @open="selected = $event"
      />
    </div>
    <div v-else class="empty-state">
      <q-icon name="search_off" size="56px" color="secondary" />
      <h2>No encontramos eventos</h2>
      <p class="muted">Prueba con otro nombre, categoría o ciudad.</p>
      <q-btn no-caps color="primary" label="Limpiar filtros" @click="reset" />
    </div>
    <EventDetails :event="selected" @close="selected = null" />
  </q-page>
</template>
<script setup>
import { computed, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { categories, publishedEvents } from "../state/demo.js";
import EventCard from "../components/EventCard.vue";
import EventDetails from "../components/EventDetails.vue";
const search = ref("");
const city = ref("Todas las ciudades");
const selectedCategory = ref("Todos");
const selected = ref(null);
const route = useRoute();
const normalize = (value) =>
  value
    .toLocaleLowerCase("es")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
const filtered = computed(() =>
  publishedEvents.value.filter(
    (e) =>
      (selectedCategory.value === "Todos" ||
        e.categoria === selectedCategory.value) &&
      (city.value === "Todas las ciudades" || e.ciudad === city.value) &&
      normalize(e.titulo + " " + e.lugar + " " + e.ciudad).includes(
        normalize(search.value || ""),
      ),
  ),
);
function reset() {
  search.value = "";
  city.value = "Todas las ciudades";
  selectedCategory.value = "Todos";
}
watch(
  () => route.query.evento,
  (id) => {
    selected.value =
      publishedEvents.value.find((e) => e.id === Number(id)) || null;
  },
  { immediate: true },
);
</script>
