<script setup lang="ts">
interface Metric {
  label: string
  value: string | number
}

interface Props {
  to: string
  title: string
  imageUrl?: string | null
  metrics: Metric[]
  issues: string[]
}

const props = withDefaults(defineProps<Props>(), {
  imageUrl: null,
})

const coverUrl = computed(() => props.imageUrl || undefined)
const fallbackColor = computed(() => hashColor(props.title))
</script>

<template>
  <v-card
    :to="to"
    hover
    class="quality-audit-card d-flex flex-column h-100"
  >
    <v-img
      v-if="imageUrl !== null"
      :src="coverUrl"
      lazy-src="/placeholder-book-lazy.jpg"
      :alt="title"
      height="180"
      cover
    >
      <template #placeholder>
        <HashedFill :color="fallbackColor" />
      </template>
    </v-img>

    <v-card-text class="d-flex flex-column flex-grow-1 pa-4">
      <div class="text-subtitle-1 font-weight-bold line-clamp-2 mb-2">
        {{ title }}
      </div>

      <div class="d-flex mb-3 flex-wrap gap-2">
        <v-chip
          v-for="metric in metrics"
          :key="metric.label"
          size="small"
          color="primary"
          variant="tonal"
        >
          {{ metric.label }}: {{ metric.value }}
        </v-chip>
      </div>

      <div class="d-flex mt-auto flex-wrap gap-2">
        <v-chip
          v-for="issue in issues"
          :key="issue"
          size="small"
          color="warning"
          variant="flat"
        >
          {{ issue.replaceAll('_', ' ') }}
        </v-chip>
      </div>
    </v-card-text>
  </v-card>
</template>

<style scoped>
.quality-audit-card {
  min-height: 180px;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
