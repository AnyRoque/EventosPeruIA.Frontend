<template>
  <q-dialog
    :model-value="!!event"
    @update:model-value="(value) => !value && $emit('close')"
  >
    <q-card v-if="event" class="detail-dialog">
      <q-card-section class="row items-center justify-between"
        ><q-badge outline color="secondary">{{ event.categoria }}</q-badge
        ><q-btn
          flat
          round
          icon="close"
          aria-label="Cerrar detalles"
          v-close-popup
      /></q-card-section>
      <q-card-section
        ><p class="eyebrow">{{ event.ciudad }} · EXPERIENCIAS QUE CONECTAN</p>
        <h2>{{ event.titulo }}</h2>
        <p class="muted detail-description">{{ event.descripcion }}</p>
        <p class="event-meta">
          <q-icon name="event" /> {{ formatDate(event.fecha) }} ·
          {{ event.fecha.slice(11, 16) }}
        </p>
        <p class="event-meta"><q-icon name="place" /> {{ event.lugar }}</p>
        <div class="detail-price">
          <strong>{{ formatPrice(event.precio) }}</strong
          ><span class="muted">{{ event.cupos }} cupos disponibles</span>
        </div>
        <q-banner rounded class="demo-banner"
          >Evento de ejemplo para la entrega. La compra de entradas no está
          habilitada en esta vista.</q-banner
        ></q-card-section
      >
      <q-card-actions align="right"
        ><q-btn
          no-caps
          flat
          label="Seguir explorando"
          color="secondary"
          v-close-popup
      /></q-card-actions>
    </q-card>
  </q-dialog>
</template>
<script setup>
import { formatDate, formatPrice } from "../state/demo.js";
defineProps({ event: Object });
defineEmits(["close"]);
</script>
