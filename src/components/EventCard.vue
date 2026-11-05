<template>
  <q-card flat bordered class="event-card">
    <div class="event-cover" :class="'cover-' + event.id">
      <img
        v-if="event.imagen"
        :src="event.imagen"
        alt=""
        loading="lazy"
        @error="imageFailed = true"
        v-show="!imageFailed"
      />
      <q-icon
        v-if="!event.imagen || imageFailed"
        :name="event.icono || 'festival'"
        class="poster-icon"
      />
      <q-badge class="category-badge">{{ event.categoria }}</q-badge>
      <span class="cover-city"><q-icon name="place" /> {{ event.ciudad }}</span>
    </div>
    <q-card-section>
      <h3>{{ event.titulo }}</h3>
      <p class="event-meta">
        <q-icon name="event" /> {{ formatDate(event.fecha) }}
      </p>
      <p class="event-meta"><q-icon name="place" /> {{ event.lugar }}</p>
      <p class="availability" :class="{ scarce: event.cupos < 20 }">
        <q-icon name="confirmation_number" />
        {{
          event.cupos < 20
            ? "¡Solo " + event.cupos + " cupos!"
            : event.cupos + " cupos disponibles"
        }}
      </p>
      <div class="card-bottom">
        <strong>{{ formatPrice(event.precio) }}</strong
        ><q-btn
          unelevated
          no-caps
          color="primary"
          label="Ver evento"
          @click="$emit('open', event)"
        />
      </div>
    </q-card-section>
  </q-card>
</template>
<script setup>
import { ref } from "vue";
import { formatDate, formatPrice } from "../state/demo.js";
defineProps({ event: { type: Object, required: true } });
defineEmits(["open"]);
const imageFailed = ref(false);
</script>
