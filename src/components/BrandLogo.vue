<template>
  <router-link
    to="/inicio"
    class="brand"
    aria-label="EventosPeruIA, ir al inicio"
  >
    <span class="brand-mark" aria-hidden="true">✦</span>
    <span v-if="!compact" class="gradient-text">EventosPeruIA</span>
  </router-link>
</template>
<script setup>
defineProps({ compact: Boolean });
</script>
