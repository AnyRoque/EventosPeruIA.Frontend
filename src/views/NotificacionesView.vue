<template>
  <q-page class="page-content notifications-page">
    <div class="section-heading">
      <div>
        <p class="eyebrow">MANTENTE AL DÍA</p>
        <h1>Notificaciones</h1>
        <q-badge class="unread-badge">{{ unreadCount }} sin leer</q-badge>
      </div>
      <q-btn
        outline
        no-caps
        icon="done_all"
        label="Marcar todas como leídas"
        :disable="!unreadCount"
        @click="markAll"
      />
    </div>
    <p class="muted q-mb-xl">
      Avisos de ejemplo. Los cambios se conservan mientras navegas en esta
      sesión.
    </p>
    <section
      v-for="group in groups"
      :key="group.label"
      class="notification-group"
    >
      <h2>
        {{ group.label }} <span class="muted">· {{ group.items.length }}</span>
      </h2>
      <p v-if="!group.items.length" class="empty-notifications">
        <q-icon name="task_alt" /> Estás al día. No tienes notificaciones
        pendientes.
      </p>
      <article
        v-for="item in group.items"
        :key="item.id"
        class="notification-card"
        :class="[item.tono, { read: item.leida }]"
      >
        <div class="notification-icon">
          <q-icon :name="item.icono" size="27px" />
        </div>
        <div class="notification-content">
          <div class="notification-title">
            <h3>{{ item.titulo }}</h3>
            <q-badge outline :color="item.leida ? 'primary' : 'warning'">{{
              item.leida ? "Leída" : "Pendiente"
            }}</q-badge>
          </div>
          <p>{{ item.texto }}</p>
          <div class="notification-actions">
            <time>{{ item.fecha }}</time
            ><router-link
              :to="
                item.evento ? '/explorar?evento=' + item.evento : '/explorar'
              "
              @click="item.leida = true"
              >{{
                item.evento ? "Ver evento" : "Explorar eventos"
              }}
              →</router-link
            >
          </div>
        </div>
        <q-btn
          v-if="!item.leida"
          flat
          round
          dense
          icon="done"
          :aria-label="'Marcar como leída: ' + item.titulo"
          @click="item.leida = true"
          ><q-tooltip>Marcar como leída</q-tooltip></q-btn
        >
      </article>
    </section>
  </q-page>
</template>
<script setup>
import { computed } from "vue";
import { notifications, unreadCount } from "../state/demo.js";
const groups = computed(() => [
  { label: "Pendientes", items: notifications.value.filter((n) => !n.leida) },
  { label: "Leídas", items: notifications.value.filter((n) => n.leida) },
]);
function markAll() {
  notifications.value.forEach((n) => {
    n.leida = true;
  });
}
</script>
