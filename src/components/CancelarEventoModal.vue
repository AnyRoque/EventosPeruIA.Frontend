<template>
  <q-dialog
    :model-value="true"
    persistent
    @update:model-value="(value) => !value && $emit('close')"
  >
    <q-card class="detail-dialog">
      <q-card-section class="row items-center justify-between"
        ><h2>Cancelar evento</h2>
        <q-btn
          flat
          round
          icon="close"
          aria-label="Cerrar cancelación"
          @click="$emit('close')"
      /></q-card-section>
      <q-card-section
        ><p>
          Vas a cancelar <strong>{{ event.titulo }}</strong> en la demostración.
        </p>
        <p class="muted">
          Este evento dejará de aparecer en el catálogo. No se modifica la base
          de datos ni se realizan devoluciones.
        </p>
        <q-form @submit="$emit('cancelled', reason.trim())" class="form-stack"
          ><q-input
            v-model="reason"
            outlined
            type="textarea"
            label="Motivo de cancelación"
            maxlength="500"
            counter
            :rules="[
              (v) =>
                v.trim().length >= 20 ||
                'Describe el motivo con al menos 20 caracteres',
            ]" />
          <div class="dialog-actions">
            <q-btn flat no-caps label="Volver" @click="$emit('close')" /><q-btn
              unelevated
              no-caps
              color="negative"
              type="submit"
              label="Confirmar cancelación"
            /></div
        ></q-form>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>
<script setup>
import { ref } from "vue";
defineProps({ event: { type: Object, required: true } });
defineEmits(["close", "cancelled"]);
const reason = ref("");
</script>
