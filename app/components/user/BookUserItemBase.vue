<script setup lang="ts">
interface Props {
  slug: string
  title: string
  coverUrl?: string | null
  authorNames: string[]
  authorSlugs: string[]
  seriesName?: string | null
  seriesSlug?: string | null
  eager?: boolean
}

defineProps<Props>()
</script>

<template>
  <v-card
    variant="elevated"
    color="surface"
  >
    <div class="d-flex flex-row gap-3 pa-3">
      <!-- Cover Image -->
      <div
        class="flex-shrink-0"
        style="width: 90px; height: 120px;"
      >
        <v-img
          :src="coverUrl || '/placeholder-book-lazy.jpg'"
          :alt="title"
          width="90"
          height="120"
          cover
          rounded="lg"
          :eager="eager"
        />
      </div>

      <!-- Content -->
      <div class="d-flex flex-column min-w-0 flex-grow-1">
        <!-- Book Title -->
        <NuxtLink
          :to="`/books/${slug}`"
          class="text-decoration-none text-primary"
        >
          <div class="text-subtitle-1 font-weight-bold text-truncate">
            {{ title }}
          </div>
        </NuxtLink>

        <!-- Authors -->
        <div class="text-medium-emphasis text-truncate">
          <span
            v-if="authorNames.length > 0"
            class="text-body-2"
          >by </span>

          <template
            v-for="(author, i) in authorNames"
            :key="author"
          >
            <NuxtLink
              :to="`/authors/${authorSlugs[i]}`"
              class="text-decoration-none text-medium-emphasis text-body-2"
            >
              {{ author }}
            </NuxtLink>

            <span v-if="i < authorNames.length - 1">, </span>
          </template>
        </div>

        <!-- Series -->
        <NuxtLink
          v-if="seriesName && seriesSlug"
          :to="`/series/${seriesSlug}`"
          class="text-decoration-none"
        >
          <div class="text-body-2 text-medium-emphasis mt-1">
            Series: {{ seriesName }}
          </div>
        </NuxtLink>

        <!-- Middle slot -->
        <slot name="middle" />

        <!-- Action slot — full width below text, right-aligned -->
        <div
          v-if="$slots.topRight"
          class="d-flex justify-end mt-2"
        >
          <slot name="topRight" />
        </div>
      </div>
    </div>
  </v-card>
</template>
