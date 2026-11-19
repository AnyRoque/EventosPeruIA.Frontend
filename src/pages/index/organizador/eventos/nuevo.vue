<template>
  <q-page class="contenedor q-px-md q-py-lg">
    <q-btn
      flat
      no-caps
      icon="arrow_back"
      label="Mis eventos"
      to="/organizador/eventos"
      class="q-mb-sm"
    />
    <div class="text-h5 text-weight-bold q-mb-md">Crear evento</div>
    <EventoForm />
  </q-page>
</template>

<script setup>
import EventoForm from '@/components/organizador/EventoForm.vue'
</script>
