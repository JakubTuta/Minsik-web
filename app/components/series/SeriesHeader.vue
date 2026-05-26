<script setup lang="ts">
import type { EditFieldConfig } from '~/types/admin'
import type { Author, AuthorMinimal, BookSummary, Series } from '~/types/api'
import { formatReadingTime } from '~/utils/readingTime'

interface Props {
  series: Series
  books: BookSummary[]
  primaryAuthor?: Author | null
  isAdmin?: boolean
  editFields: EditFieldConfig[]
  editOriginalData: Record<string, any>
  editLoading?: boolean
  editError?: string
  deleteLoading?: boolean
  deleteError?: string
}

const props = withDefaults(defineProps<Props>(), {
  primaryAuthor: null,
  isAdmin: false,
  editLoading: false,
  editError: '',
  deleteLoading: false,
  deleteError: '',
})

const emit = defineEmits<{
  editSave: [data: Record<string, any>]
  deleteConfirm: []
}>()

const editDialogOpen = defineModel<boolean>('editDialogOpen', { default: false })
const deleteDialogOpen = defineModel<boolean>('deleteDialogOpen', { default: false })

const collageCovers = computed(() => {
  if (!props.books || props.books.length === 0)
    return []

  return props.books.slice(0, 4).map(book => book.primary_cover_url || coverColor(book))
})

const authorsLine = computed(() => {
  const seen = new Set<number>()
  const out: AuthorMinimal[] = []
  for (const b of props.books) {
    for (const a of b.authors) {
      if (!seen.has(a.author_id)) {
        seen.add(a.author_id)
        out.push(a)
      }
    }
  }

  return out
})

const totalPages = computed(() => props.series.total_pages ?? 0)

const seriesReadingTime = computed(() => formatReadingTime(totalPages.value))

const seriesStats = computed(() => {
  const items: Array<{ icon: string, value: string | number, label: string }> = [
    {
      icon: 'mdi-book-multiple',
      value: props.series.total_books ?? props.books.length,
      label: 'BOOKS',
    },
  ]

  if (totalPages.value > 0) {
    items.push({
      icon: 'mdi-book-open-page-variant',
      value: totalPages.value.toLocaleString(),
      label: 'PAGES',
    })
  }

  if (seriesReadingTime.value) {
    items.push({
      icon: 'mdi-clock-outline',
      value: `~${seriesReadingTime.value}`,
      label: 'READING TIME',
    })
  }

  return items
})
</script>

<template>
  <v-card>
    <v-row no-gutters>
      <!-- Book Covers Collage -->
      <v-col
        cols="12"
        md="3"
        class="pa-0"
      >
        <CoversCollage :covers="collageCovers" />
      </v-col>

      <!-- Series Info -->
      <v-col
        cols="12"
        md="6"
      >
        <v-card-text class="d-flex flex-column h-100">
          <div>
            <div class="text-secondary text-h6 mb-1">
              Book Series
            </div>

            <div class="d-flex align-center justify-space-between">
              <h1 class="text-h3 font-weight-bold">
                {{ series.name }}
              </h1>

              <ClientOnly>
                <div class="d-flex">
                  <v-btn
                    v-if="isAdmin"
                    icon="mdi-pencil"
                    variant="text"
                    size="small"
                    color="secondary"
                    @click="editDialogOpen = true"
                  />

                  <v-btn
                    v-if="isAdmin"
                    icon="mdi-delete"
                    variant="text"
                    size="small"
                    color="error"
                    @click="deleteDialogOpen = true"
                  />
                </div>
              </ClientOnly>
            </div>

            <!-- Authors line -->
            <div
              v-if="authorsLine.length > 0"
              class="text-body-1 mt-2"
            >
              by
              <template
                v-for="(author, i) in authorsLine"
                :key="author.author_id"
              >
                <NuxtLink
                  :to="`/authors/${author.slug}`"
                  class="font-weight-bold text-primary text-decoration-none"
                >
                  {{ author.name }}
                </NuxtLink>

                <span v-if="i < authorsLine.length - 1">, </span>
              </template>
            </div>

            <!-- Ratings Card -->
            <v-card
              class="mt-6"
              flat
              color="background"
            >
              <v-card-text class="pa-3">
                <div class="d-flex align-stretch">
                  <div class="d-flex flex-column align-center flex-1 pa-2 text-center">
                    <div class="text-caption text-secondary mb-1">
                      Minsik readers
                    </div>

                    <div class="text-h4 font-weight-bold text-primary">
                      {{ (series.avg_rating ?? 0).toFixed(1) }}
                    </div>

                    <v-rating
                      :model-value="Math.floor((series.avg_rating ?? 0) * 2) / 2"
                      readonly
                      half-increments
                      color="warning"
                      active-color="warning"
                      density="compact"
                      size="small"
                    />

                    <div class="text-caption text-secondary mt-1">
                      {{ (series.rating_count ?? 0).toLocaleString() }} ratings
                    </div>
                  </div>

                  <v-divider vertical />

                  <div class="d-flex flex-column align-center flex-1 pa-2 text-center">
                    <div class="text-caption text-secondary mb-1">
                      Other platforms
                    </div>

                    <div class="text-h4 font-weight-bold text-primary">
                      {{ (series.ol_avg_rating ?? 0).toFixed(1) }}
                    </div>

                    <v-rating
                      :model-value="Math.floor((series.ol_avg_rating ?? 0) * 2) / 2"
                      readonly
                      half-increments
                      color="warning"
                      active-color="warning"
                      density="compact"
                      size="small"
                    />

                    <div class="text-caption text-secondary mt-1">
                      {{ (series.ol_rating_count ?? 0).toLocaleString() }} ratings
                    </div>
                  </div>
                </div>
              </v-card-text>
            </v-card>

            <!-- Stats Row -->
            <StatsRow
              :stats="seriesStats"
              class="mt-4"
            />
          </div>
        </v-card-text>
      </v-col>

      <!-- Author Section -->
      <v-col
        v-if="primaryAuthor"
        cols="12"
        md="3"
      >
        <AuthorShortCard :author="primaryAuthor" />
      </v-col>
    </v-row>

    <!-- Dialogs -->
    <ClientOnly>
      <AdminEditDialog
        v-model="editDialogOpen"
        title="Edit Series"
        :fields="editFields"
        :original-data="editOriginalData"
        :loading="editLoading"
        :error="editError"
        @save="emit('editSave', $event)"
      />

      <v-dialog
        v-model="deleteDialogOpen"
        max-width="400"
      >
        <v-card>
          <v-card-title>Delete Series?</v-card-title>

          <v-card-text>
            This action cannot be undone. Are you sure you want to delete "{{ series.name }}"?
            <v-alert
              v-if="deleteError"
              type="error"
              class="mt-3"
            >
              {{ deleteError }}
            </v-alert>
          </v-card-text>

          <v-card-actions>
            <v-spacer />

            <v-btn
              variant="text"
              @click="deleteDialogOpen = false"
            >
              Cancel
            </v-btn>

            <v-btn
              color="error"
              variant="flat"
              :loading="deleteLoading"
              @click="emit('deleteConfirm')"
            >
              Delete
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </ClientOnly>
  </v-card>
</template>
