<script setup lang="ts">
interface Props {
  description?: string | null
  emptyMessage?: string
  collapsible?: boolean
  maxLines?: number
  hideCard?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  description: null,
  collapsible: false,
  maxLines: 5,
  hideCard: false,
})

const { t } = useI18n()

const expanded = ref(false)
const contentRef = ref<HTMLElement | null>(null)
const needsCollapse = ref(false)

onMounted(() => {
  if (contentRef.value)
    needsCollapse.value = props.collapsible && contentRef.value.scrollHeight > contentRef.value.clientHeight + 4
})
</script>

<template>
  <v-card v-if="!hideCard">
    <v-card-text>
      <h2 class="text-h5 font-weight-bold mb-4">
        {{ t('common.description') }}
      </h2>

      <p
        v-if="description"
        ref="contentRef"
        class="text-body-1"
        :style="!expanded && collapsible
          ? `-webkit-line-clamp: ${maxLines}; display: -webkit-box; -webkit-box-orient: vertical; overflow: hidden; white-space: pre-line;`
          : 'white-space: pre-line;'"
      >
        {{ description }}
      </p>

      <p
        v-else
        class="text-body-1 font-italic"
      >
        {{ emptyMessage ?? t('common.noDescription') }}
      </p>

      <v-btn
        v-if="needsCollapse"
        variant="text"
        size="small"
        color="secondary"
        class="mt-1 px-0"
        @click="expanded = !expanded"
      >
        {{ expanded
          ? t('common.showLess')
          : t('common.showMore') }}
      </v-btn>
    </v-card-text>
  </v-card>

  <div v-else>
    <p
      v-if="description"
      ref="contentRef"
      class="text-body-1"
      :style="!expanded && collapsible
        ? `-webkit-line-clamp: ${maxLines}; display: -webkit-box; -webkit-box-orient: vertical; overflow: hidden; white-space: pre-line;`
        : 'white-space: pre-line;'"
    >
      {{ description }}
    </p>

    <p
      v-else
      class="text-body-1 text-medium-emphasis font-italic"
    >
      {{ emptyMessage ?? t('common.noDescription') }}
    </p>

    <v-btn
      v-if="needsCollapse"
      variant="text"
      size="small"
      color="secondary"
      class="mt-1 px-0"
      @click="expanded = !expanded"
    >
      {{ expanded
        ? t('common.showLess')
        : t('common.showMore') }}
    </v-btn>
  </div>
</template>
