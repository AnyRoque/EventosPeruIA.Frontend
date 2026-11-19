<template>
  <q-page class="flex flex-center q-pa-md text-center">
    <div>
      <q-icon name="lock" color="primary" size="96px" />
      <div class="text-h4 text-weight-bold q-mt-md">Acceso denegado</div>
      <div class="text-grey-7 q-mt-sm" style="max-width: 420px">
        No tienes permiso para acceder a esta sección. Si crees que es un error, inicia sesión con
        una cuenta que tenga el rol necesario.
      </div>
      <div class="q-mt-lg q-gutter-sm">
        <q-btn unelevated no-caps color="primary" label="Ir al inicio" to="/" />
        <q-btn
          v-if="!auth.haySesion"
          outline
          no-caps
          color="primary"
          label="Iniciar sesión"
          to="/login"
        />
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { useAuthStore } from '@/stores/auth-store'

const auth = useAuthStore()
</script>
