<script setup lang="ts">
const toastStore = useToastStore()
</script>

<template>
  <v-snackbar
    v-for="(message, index) in toastStore.messages"
    :key="message.id"
    model-value
    :color="message.color"
    :timeout="message.timeout"
    :style="{'marginBottom': `${index * 56}px`}"
    location="bottom"
    @update:model-value="(value: boolean) => !value && toastStore.dismiss(message.id)"
  >
    {{ message.text }}

    <template #actions>
      <v-btn
        variant="text"
        icon="mdi-close"
        size="small"
        @click="toastStore.dismiss(message.id)"
      />
    </template>
  </v-snackbar>
</template>
