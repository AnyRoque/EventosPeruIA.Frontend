<template>
  <q-page>
    <section class="hero">
      <div class="hero-inner">
        <span class="hero-tag"
          ><q-icon name="auto_awesome" /> Plataforma de eventos · Perú</span
        >
        <h1>
          Descubre los mejores<br /><span class="gradient-text"
            >eventos del Perú</span
          >
        </h1>
        <p>
          Conciertos, talleres, ferias y charlas para compartir.<br
            class="desktop-only"
          />
          Encuentra tu próximo plan y vive experiencias únicas.
        </p>
        <div class="hero-actions">
          <q-btn
            unelevated
            no-caps
            color="primary"
            icon="search"
            label="Explorar eventos"
            to="/explorar"
          /><q-btn
            no-caps
            outline
            icon="festival"
            label="Organizar un evento"
            to="/mis-eventos"
          />
        </div>
        <div class="hero-note">
          <span class="live-dot"></span> Un país. Miles de historias por vivir.
        </div>
      </div>
      <div class="hero-orbit" aria-hidden="true">
        <div class="orbit-inner">✦</div>
        <span class="orbit-label orbit-label-one"
          ><q-icon name="music_note" /> Música</span
        ><span class="orbit-label orbit-label-two"
          ><q-icon name="devices" /> Tecnología</span
        ><span class="orbit-label orbit-label-three"
          ><q-icon name="palette" /> Cultura</span
        >
      </div>
    </section>
    <div class="category-strip">
      <div v-for="item in highlights" :key="item.label">
        <q-icon :name="item.icon" /><span>{{ item.label }}</span
        ><small>{{ item.description }}</small>
      </div>
    </div>
    <section class="page-content">
      <div class="section-heading">
        <div>
          <p class="eyebrow">SAL DE LA RUTINA</p>
          <h2>Tu próximo gran plan</h2>
          <p class="muted">Una muestra de lo que puedes vivir cerca de ti.</p>
        </div>
        <q-btn
          flat
          no-caps
          color="secondary"
          label="Ver todos los eventos"
          icon-right="arrow_forward"
          to="/explorar"
        />
      </div>
      <div class="event-grid">
        <EventCard
          v-for="event in publishedEvents.slice(0, 3)"
          :key="event.id"
          :event="event"
          @open="selected = $event"
        />
      </div>
    </section>
    <EventDetails :event="selected" @close="selected = null" />
  </q-page>
</template>
<script setup>
import { ref } from "vue";
import { publishedEvents } from "../state/demo.js";
import EventCard from "../components/EventCard.vue";
import EventDetails from "../components/EventDetails.vue";
const selected = ref(null);
const highlights = [
  {
    label: "Música en vivo",
    icon: "graphic_eq",
    description: "Siente cada momento",
  },
  {
    label: "Ideas que inspiran",
    icon: "lightbulb",
    description: "Aprende algo nuevo",
  },
  {
    label: "Sabores del Perú",
    icon: "restaurant",
    description: "Celebra lo nuestro",
  },
  {
    label: "Arte y cultura",
    icon: "palette",
    description: "Descubre otras miradas",
  },
];
</script>
