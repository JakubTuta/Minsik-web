<script setup lang="ts">
import type { EditFieldConfig } from '~/types/admin'
import type { Author } from '~/types/api'
import { hashColor } from '~/utils/coverColor'
import { totalRatingCount, totalReaders, weightedRating } from '~/utils/format'

interface Props {
  author: Author
  isAdmin?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isAdmin: false,
})

const emit = defineEmits<{
  edit: []
  delete: []
}>()

const adminStore = useAdminStore()
const authorsStore = useAuthorsStore()

const photoUrl = computed(() => props.author.photo_url || undefined)
const photoBg = computed(() => hashColor(props.author.name))

const age = computed(() => {
  if (!props.author.birth_date)
    return null

  const birthDate = new Date(props.author.birth_date)
  const endDate = props.author.death_date
    ? new Date(props.author.death_date)
    : new Date()

  let years = endDate.getFullYear() - birthDate.getFullYear()
  const monthDiff = endDate.getMonth() - birthDate.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && endDate.getDate() < birthDate.getDate()))
    years--

  return years
})

const birthYear = computed(() =>
  props.author.birth_date ? new Date(props.author.birth_date).getFullYear() : null,
)

const deathYear = computed(() =>
  props.author.death_date ? new Date(props.author.death_date).getFullYear() : null,
)

const authorWeightedRating = computed(() =>
  weightedRating(
    props.author.books_avg_rating,
    props.author.books_total_ratings,
    props.author.books_ol_avg_rating,
    props.author.books_ol_total_ratings,
  ),
)

const authorTotalRatings = computed(() =>
  totalRatingCount(props.author.books_total_ratings, props.author.books_ol_total_ratings),
)

const authorTotalReaders = computed(() =>
  totalReaders(
    props.author.app_want_to_read_count,
    props.author.app_reading_count,
    props.author.app_read_count,
    props.author.ol_want_to_read_count,
    props.author.ol_currently_reading_count,
    props.author.ol_already_read_count,
  ),
)

const preTitleLine = computed(() => {
  const parts: string[] = []
  if (props.author.nationality)
    parts.push(`${props.author.nationality.toUpperCase()} AUTHOR`)
  if (props.author.book_categories?.length)
    parts.push(...props.author.book_categories.slice(0, 2).map(c => c.toUpperCase()))
  return parts.join(' · ')
})

// Edit/delete dialog state
const editDialogOpen = ref(false)
const editError = ref('')
const deleteDialogOpen = ref(false)
const deleteError = ref('')

const slug = computed(() => props.author.slug)

const authorEditFields: EditFieldConfig[] = [
  { key: 'name', label: 'Name', type: 'text' },
  { key: 'slug', label: 'Slug', type: 'text' },
  { key: 'bio', label: 'Biography', type: 'textarea' },
  { key: 'birth_date', label: 'Birth Date (YYYY-MM-DD)', type: 'text' },
  { key: 'death_date', label: 'Death Date (YYYY-MM-DD)', type: 'text' },
  { key: 'birth_place', label: 'Birth Place', type: 'text' },
  { key: 'nationality', label: 'Nationality', type: 'text' },
  { key: 'photo_url', label: 'Photo URL', type: 'text' },
  { key: 'wikipedia_url', label: 'Wikipedia URL', type: 'text' },
  { key: 'wikidata_id', label: 'Wikidata ID', type: 'text' },
  { key: 'open_library_id', label: 'Open Library ID', type: 'text' },
  { key: 'alternate_names', label: 'Alternate Names', type: 'array' },
]

const authorEditOriginalData = computed(() => ({
  name: props.author.name ?? null,
  slug: props.author.slug ?? null,
  bio: props.author.bio ?? null,
  birth_date: props.author.birth_date ?? null,
  death_date: props.author.death_date ?? null,
  birth_place: props.author.birth_place ?? null,
  nationality: props.author.nationality ?? null,
  photo_url: props.author.photo_url ?? null,
  wikipedia_url: props.author.wikipedia_url ?? null,
  wikidata_id: props.author.wikidata_id ?? null,
  open_library_id: props.author.open_library_id ?? null,
  alternate_names: props.author.alternate_names ?? [],
}))

async function handleAuthorDelete() {
  deleteError.value = ''
  const result = await adminStore.deleteAuthor(props.author.author_id)
  if (result.success) {
    deleteDialogOpen.value = false
    emit('delete')
  }
  else {
    deleteError.value = (result as any).error || 'Delete failed'
  }
}

async function handleAuthorEditSave(editedData: Record<string, any>) {
  editError.value = ''
  const result = await adminStore.updateAuthor(props.author.author_id, authorEditOriginalData.value, editedData)
  if (result.success) {
    editDialogOpen.value = false
    const newSlug = editedData.slug && editedData.slug !== slug.value ? editedData.slug : slug.value
    await authorsStore.fetchAuthor(newSlug, true)
    if (newSlug !== slug.value)
      await navigateTo(`/authors/${newSlug}`)
  }
  else {
    editError.value = (result as any).error || 'Update failed'
  }
}
</script>

<template>
  <v-row class="mb-6 align-center">
    <!-- Left: Avatar + dates -->
    <v-col
      cols="12"
      md="4"
      class="d-flex flex-column align-center"
    >
      <v-avatar
        size="220"
        class="mb-4"
      >
        <v-img
          :src="photoUrl"
          :alt="author.name"
          :lazy-src="photoUrl ? '/placeholder-author-lazy.jpg' : undefined"
          eager
        >
          <template #placeholder>
            <HashedFill :color="photoBg" />
          </template>
        </v-img>
      </v-avatar>

      <div
        v-if="birthYear || deathYear"
        class="d-flex align-center gap-2 text-medium-emphasis text-body-2"
      >
        <v-icon
          icon="mdi-calendar"
          size="small"
        />
        <span>{{ birthYear ?? '?' }} — {{ deathYear ?? '—' }}</span>
        <span
          v-if="age !== null"
          class="ml-1"
        >· {{ age }} yrs</span>
      </div>
    </v-col>

    <!-- Right: Name, stats, bio, info -->
    <v-col
      cols="12"
      md="8"
    >
      <p
        v-if="preTitleLine"
        class="text-caption text-medium-emphasis font-weight-medium mb-1 tracking-widest"
      >
        {{ preTitleLine }}
      </p>

      <h1 class="text-h3 font-weight-bold mb-1">
        {{ author.name }}
      </h1>

      <p
        v-if="author.alternate_names && author.alternate_names.length > 0"
        class="text-body-2 text-medium-emphasis mb-4"
      >
        Also known as: {{ author.alternate_names.slice(0, 2).join(', ') }}
      </p>

      <!-- Stats row -->
      <div class="d-flex flex-wrap gap-6 mb-4 align-center">
        <div class="d-flex flex-column align-center">
          <div class="d-flex align-center gap-1 text-body-1 font-weight-bold">
            <v-icon
              icon="mdi-book-multiple"
              size="small"
            />
            {{ author.books_count }}
          </div>
          <span class="text-caption text-medium-emphasis">BOOKS</span>
        </div>

        <div class="d-flex flex-column align-center">
          <div class="d-flex align-center gap-1 text-body-1 font-weight-bold">
            <v-icon
              icon="mdi-star"
              size="small"
              color="warning"
            />
            <span>
              {{ authorWeightedRating.toFixed(1) }}
              <v-tooltip
                activator="parent"
                location="bottom"
              >
                <div>Minsik: {{ author.books_avg_rating?.toFixed(1) ?? '0.0' }} ({{ (author.books_total_ratings ?? 0).toLocaleString() }} ratings)</div>
                <div class="mt-1">
                  Open Library: {{ author.books_ol_avg_rating?.toFixed(1) ?? '0.0' }} ({{ (author.books_ol_total_ratings ?? 0).toLocaleString() }} ratings)
                </div>
              </v-tooltip>
            </span>
          </div>
          <span class="text-caption text-medium-emphasis">AVG RATING ({{ authorTotalRatings.toLocaleString() }})</span>
        </div>

        <div class="d-flex flex-column align-center">
          <div class="d-flex align-center gap-1 text-body-1 font-weight-bold">
            <v-icon
              icon="mdi-account-multiple"
              size="small"
            />
            <span>
              {{ authorTotalReaders.toLocaleString() }}
              <v-tooltip
                activator="parent"
                location="bottom"
              >
                <div>Minsik - Want to Read: {{ (author.app_want_to_read_count ?? 0).toLocaleString() }}</div>
                <div>Minsik - Reading: {{ (author.app_reading_count ?? 0).toLocaleString() }}</div>
                <div>Minsik - Read: {{ (author.app_read_count ?? 0).toLocaleString() }}</div>
                <div class="mt-1">
                  Open Library - Want to Read: {{ (author.ol_want_to_read_count ?? 0).toLocaleString() }}
                </div>
                <div>Open Library - Reading: {{ (author.ol_currently_reading_count ?? 0).toLocaleString() }}</div>
                <div>Open Library - Read: {{ (author.ol_already_read_count ?? 0).toLocaleString() }}</div>
              </v-tooltip>
            </span>
          </div>
          <span class="text-caption text-medium-emphasis">READERS</span>
        </div>
      </div>

      <!-- Bio -->
      <DescriptionCard
        :description="author.bio"
        :collapsible="true"
        :max-chars="400"
        hide-card
        empty-message=""
        class="mb-4"
      />

      <!-- Info row -->
      <div class="d-flex flex-wrap align-center gap-4 mb-4 text-body-2">
        <div
          v-if="author.birth_place"
          class="d-flex align-center gap-1 text-medium-emphasis"
        >
          <v-icon
            icon="mdi-map-marker"
            size="small"
          />
          {{ author.birth_place }}
        </div>

        <a
          v-if="author.wikipedia_url"
          :href="author.wikipedia_url"
          target="_blank"
          rel="noopener noreferrer"
          class="d-flex align-center gap-1 text-primary text-decoration-none"
        >
          <v-icon
            icon="mdi-wikipedia"
            size="small"
          />
          Wikipedia
          <v-icon
            icon="mdi-open-in-new"
            size="x-small"
          />
        </a>
      </div>

      <!-- Admin actions -->
      <ClientOnly>
        <div
          v-if="isAdmin"
          class="d-flex gap-2"
        >
          <v-btn
            prepend-icon="mdi-pencil"
            variant="text"
            size="small"
            color="secondary"
            @click="editDialogOpen = true"
          >
            Edit Author
          </v-btn>

          <v-btn
            prepend-icon="mdi-delete"
            variant="text"
            size="small"
            color="error"
            @click="deleteDialogOpen = true"
          >
            Delete Author
          </v-btn>
        </div>

        <AdminEditDialog
          v-if="isAdmin"
          v-model="editDialogOpen"
          title="Edit Author"
          :fields="authorEditFields"
          :original-data="authorEditOriginalData"
          :loading="adminStore.isUpdateLoading"
          :error="editError"
          @save="handleAuthorEditSave"
        />

        <v-dialog
          v-if="isAdmin"
          v-model="deleteDialogOpen"
          max-width="400"
        >
          <v-card>
            <v-card-title>Delete Author?</v-card-title>

            <v-card-text>
              This action cannot be undone. Are you sure you want to delete "{{ author.name }}"?
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
                :loading="adminStore.isDeleteLoading"
                @click="handleAuthorDelete"
              >
                Delete
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </ClientOnly>
    </v-col>
  </v-row>
</template>
