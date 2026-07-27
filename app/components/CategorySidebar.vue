<script setup lang="ts">
import type { Category } from '~/types/categories'

interface Props {
  categories: Category[]
  selectedSlug: string | null
}

defineProps<Props>()

const localePath = useLocalePath()

const { t } = useI18n()
</script>

<template>
  <!-- Desktop: vertical list (md and up) -->
  <v-card class="d-none d-md-block">
    <v-card-text class="pa-0">
      <v-list nav>
        <v-list-item
          v-for="category in categories"
          :key="category.slug"
          :to="localePath(`/categories?category=${category.slug}`)"
          :active="selectedSlug === category.slug"
          :title="category.name"
          color="primary"
          min-height="48"
        />
      </v-list>
    </v-card-text>
  </v-card>

  <!-- Mobile: collapsible expansion panel (below md) -->
  <v-expansion-panels
    class="d-md-none mb-4"
    variant="accordion"
  >
    <v-expansion-panel>
      <v-expansion-panel-title>
        <span class="font-weight-bold">{{ t('categories.browse') }}</span>
      </v-expansion-panel-title>

      <v-expansion-panel-text class="pa-0">
        <v-list nav>
          <v-list-item
            v-for="category in categories"
            :key="category.slug"
            :to="localePath(`/categories?category=${category.slug}`)"
            :active="selectedSlug === category.slug"
            :title="category.name"
            color="primary"
            min-height="48"
          />
        </v-list>
      </v-expansion-panel-text>
    </v-expansion-panel>
  </v-expansion-panels>
</template>
