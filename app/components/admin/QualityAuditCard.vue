<script setup lang="ts">
interface Props {
  to: string
  title: string
  imageUrl?: string | null
  chips: string[]
}

const props = withDefaults(defineProps<Props>(), {
  imageUrl: null,
})

const localePath = useLocalePath()

const coverUrl = computed(() => props.imageUrl || undefined)
const fallbackColor = computed(() => hashColor(props.title))
</script>

<template>
  <v-card
    :to="localePath(to)"
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
      <div class="text-subtitle-1 font-weight-bold line-clamp-2 mb-3">
        {{ title }}
      </div>

      <div class="d-flex mt-auto flex-wrap gap-2">
        <v-chip
          v-for="chip in chips"
          :key="chip"
          size="small"
          color="warning"
          variant="flat"
        >
          {{ chip }}
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
