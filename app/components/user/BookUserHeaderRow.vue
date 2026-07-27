<script setup lang="ts">
import { useDisplay } from 'vuetify'

const props = defineProps<{
  isPublicProfile?: boolean
  secondaryLabel?: string
}>()

const { t } = useI18n()
const { mobile } = useDisplay()

const resolvedSecondaryLabel = computed(() => props.secondaryLabel ?? t('bookUser.status'))
</script>

<template>
  <div
    v-if="!mobile"
    class="d-flex align-center px-3 py-2 text-caption text-medium-emphasis font-weight-bold text-uppercase"
    style="position: sticky; top: var(--app-bar-height); z-index: 2; background: rgb(var(--v-theme-surface)); border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));"
    rounded-xl
  >
    <div style="width: 72px; flex-shrink: 0;" />

    <div class="flex-grow-1 pl-3">
      {{ t('bookUser.book') }}
    </div>

    <div style="width: 160px; flex-shrink: 0;">
      {{ resolvedSecondaryLabel }}
    </div>

    <slot name="metaHeaders" />

    <div
      style="width: 120px; flex-shrink: 0; text-align: right;"
    >
      {{ t('bookUser.actions') }}
    </div>
  </div>
</template>
