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
    <div class="text-h5 text-weight-bold q-mb-md">Editar evento</div>
    <EventoForm :id-evento="Number(route.params.id)" />
  </q-page>
</template>

<script setup>
import { useRoute } from 'vue-router'
import EventoForm from '@/components/organizador/EventoForm.vue'

const route = useRoute()
</script>
