<script setup lang="ts">
import type { Category } from '~/types/categories'

interface Props {
  categories: Category[]
  selectedSlug: string | null
  selectedSubGenre: string | null
  loading?: boolean
}

withDefaults(defineProps<Props>(), {
  loading: false,
})
</script>

<template>
  <!-- Desktop: vertical list (md and up) -->
  <v-card class="d-none d-md-block">
    <v-card-text class="pa-0">
      <div
        v-if="loading"
        class="pa-6 text-center"
      >
        <v-progress-circular
          indeterminate
          color="primary"
          size="24"
        />
      </div>

      <v-list
        v-else
        nav
        :opened="selectedSlug ? [selectedSlug] : []"
      >
        <template
          v-for="category in categories"
          :key="category.slug"
        >
          <!-- Category with sub-genres -->
          <v-list-group
            v-if="category.sub_genres.length > 0"
            :value="category.slug"
          >
            <template #activator="{ props: groupProps }">
              <v-list-item
                v-bind="groupProps"
                :to="`/categories?category=${category.slug}`"
                :active="selectedSlug === category.slug"
                :title="category.name"
                color="primary"
                min-height="48"
              />
            </template>

            <v-list-item
              v-for="sub in category.sub_genres"
              :key="sub.slug"
              :to="`/categories?category=${category.slug}&sub_genre=${sub.slug}`"
              :active="selectedSlug === category.slug && selectedSubGenre === sub.slug"
              :title="sub.name"
              color="primary"
              class="pl-4"
              min-height="44"
            />
          </v-list-group>

          <!-- Category without sub-genres -->
          <v-list-item
            v-else
            :to="`/categories?category=${category.slug}`"
            :active="selectedSlug === category.slug"
            :title="category.name"
            color="primary"
            min-height="48"
          />
        </template>
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
        <span class="font-weight-bold">Browse Categories</span>
      </v-expansion-panel-title>

      <v-expansion-panel-text class="pa-0">
        <div
          v-if="loading"
          class="pa-6 text-center"
        >
          <v-progress-circular
            indeterminate
            color="primary"
            size="24"
          />
        </div>

        <v-list
          v-else
          nav
          :opened="selectedSlug ? [selectedSlug] : []"
        >
          <template
            v-for="category in categories"
            :key="category.slug"
          >
            <v-list-group
              v-if="category.sub_genres.length > 0"
              :value="category.slug"
            >
              <template #activator="{ props: groupProps }">
                <v-list-item
                  v-bind="groupProps"
                  :to="`/categories?category=${category.slug}`"
                  :active="selectedSlug === category.slug"
                  :title="category.name"
                  color="primary"
                  min-height="48"
                />
              </template>

              <v-list-item
                v-for="sub in category.sub_genres"
                :key="sub.slug"
                :to="`/categories?category=${category.slug}&sub_genre=${sub.slug}`"
                :active="selectedSlug === category.slug && selectedSubGenre === sub.slug"
                :title="sub.name"
                color="primary"
                class="pl-4"
                min-height="44"
              />
            </v-list-group>

            <v-list-item
              v-else
              :to="`/categories?category=${category.slug}`"
              :active="selectedSlug === category.slug"
              :title="category.name"
              color="primary"
              min-height="48"
            />
          </template>
        </v-list>
      </v-expansion-panel-text>
    </v-expansion-panel>
  </v-expansion-panels>
</template>
