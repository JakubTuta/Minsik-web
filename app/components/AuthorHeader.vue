<script setup lang="ts">
import type { EditFieldConfig } from '~/types/admin'
import type { Author } from '~/types/api'
import { totalRatingCount, totalReaders, weightedRating } from '~/utils/format'

const props = withDefaults(defineProps<Props>(), {
  isAdmin: false,
})

const emit = defineEmits<{
  edit: []
  delete: []
}>()

const { t, locale, n } = useI18n()
const localePath = useLocalePath()

function formatShortDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString(locale.value, { year: 'numeric', month: 'short', day: 'numeric' })
}

interface Props {
  author: Author
  isAdmin?: boolean
}

const adminStore = useAdminStore()
const authorsStore = useAuthorsStore()

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

const birthDateFormatted = computed(() => (props.author.birth_date
  ? formatShortDate(props.author.birth_date)
  : null),
)

const deathDateFormatted = computed(() => (props.author.death_date
  ? formatShortDate(props.author.death_date)
  : null),
)

const birthPlace = computed(() => {
  const parts = [props.author.birth_place, props.author.nationality].filter(Boolean)

  return parts.length
    ? parts.join(', ')
    : null
})

const authorWeightedRating = computed(() => weightedRating(
  props.author.books_avg_rating,
  props.author.books_total_ratings,
  props.author.books_ol_avg_rating,
  props.author.books_ol_total_ratings,
),
)

const authorTotalRatings = computed(() => totalRatingCount(props.author.books_total_ratings, props.author.books_ol_total_ratings),
)

const authorTotalReaders = computed(() => totalReaders(
  props.author.app_want_to_read_count,
  props.author.app_reading_count,
  props.author.app_read_count,
  props.author.ol_want_to_read_count,
  props.author.ol_currently_reading_count,
  props.author.ol_already_read_count,
),
)

const authorStats = computed(() => [
  {
    icon: 'mdi-book-multiple',
    value: props.author.books_count,
    label: t('stats.books'),
  },
  {
    icon: 'mdi-star',
    iconColor: 'warning',
    value: `${authorWeightedRating.value.toFixed(1)}`,
    label: t('stats.avgRating', { count: n(authorTotalRatings.value) }),
    tooltipLines: [
      t('stats.minsikRatings', { rating: props.author.books_avg_rating?.toFixed(1) ?? '0.0', count: n(props.author.books_total_ratings ?? 0) }),
      t('stats.olRatings', { rating: props.author.books_ol_avg_rating?.toFixed(1) ?? '0.0', count: n(props.author.books_ol_total_ratings ?? 0) }),
    ],
  },
  {
    icon: 'mdi-account-multiple',
    value: n(authorTotalReaders.value),
    label: t('stats.readers'),
    tooltipLines: [
      t('stats.minsikWantToRead', { count: n(props.author.app_want_to_read_count ?? 0) }),
      t('stats.minsikReading', { count: n(props.author.app_reading_count ?? 0) }),
      t('stats.minsikRead', { count: n(props.author.app_read_count ?? 0) }),
      t('stats.olWantToRead', { count: n(props.author.ol_want_to_read_count ?? 0) }),
      t('stats.olReading', { count: n(props.author.ol_currently_reading_count ?? 0) }),
      t('stats.olRead', { count: n(props.author.ol_already_read_count ?? 0) }),
    ],
  },
])

const preTitleLine = computed(() => {
  const parts: string[] = []
  if (props.author.nationality)
    parts.push(t('author.nationalityAuthor', { nationality: props.author.nationality }).toUpperCase())
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

const authorEditFields = computed<EditFieldConfig[]>(() => [
  { key: 'name', label: t('author.fieldName'), type: 'text' },
  { key: 'slug', label: t('common.fieldSlug'), type: 'text' },
  { key: 'bio', label: t('author.fieldBiography'), type: 'textarea' },
  { key: 'birth_date', label: t('author.fieldBirthDate'), type: 'text' },
  { key: 'death_date', label: t('author.fieldDeathDate'), type: 'text' },
  { key: 'birth_place', label: t('author.fieldBirthPlace'), type: 'text' },
  { key: 'nationality', label: t('author.fieldNationality'), type: 'text' },
  { key: 'photo_url', label: t('author.fieldPhotoUrl'), type: 'text' },
  { key: 'wikipedia_url', label: t('author.fieldWikipediaUrl'), type: 'text' },
  { key: 'wikidata_id', label: t('author.fieldWikidataId'), type: 'text' },
  { key: 'open_library_id', label: t('common.fieldOpenLibraryId'), type: 'text' },
  { key: 'alternate_names', label: t('author.fieldAlternateNames'), type: 'array' },
  { key: 'remote_ids', label: t('author.fieldRemoteIds'), type: 'json' },
])

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
  remote_ids: props.author.remote_ids ?? {},
}))

async function handleAuthorDelete() {
  deleteError.value = ''
  const result = await adminStore.deleteAuthor(props.author.author_id)
  if (result.success) {
    deleteDialogOpen.value = false
    emit('delete')
  }
  else {
    deleteError.value = (result as any).error || t('admin.deleteFailed')
  }
}

async function handleAuthorEditSave(editedData: Record<string, any>) {
  editError.value = ''
  const result = await adminStore.updateAuthor(props.author.author_id, authorEditOriginalData.value, editedData)
  if (result.success) {
    editDialogOpen.value = false
    const newSlug = editedData.slug && editedData.slug !== slug.value
      ? editedData.slug
      : slug.value
    await authorsStore.fetchAuthor(newSlug, true)
    if (newSlug !== slug.value)
      await navigateTo(localePath({ name: 'authors-slug', params: { slug: newSlug } }))
  }
  else {
    editError.value = (result as any).error || t('admin.updateFailed')
  }
}
</script>

<template>
  <v-row
    align="start"
  >
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
        <AuthorPhoto
          :name="author.name"
          :src="author.photo_url"
          :size="220"
          priority
        />
      </v-avatar>

      <div
        v-if="birthDateFormatted || deathDateFormatted"
        class="d-flex align-center text-medium-emphasis text-body-2 gap-2 text-center"
      >
        <v-icon
          icon="mdi-calendar"
          size="small"
        />

        <span>{{ birthDateFormatted ?? '?' }} — {{ deathDateFormatted ?? '—' }}</span>

        <span
          v-if="age !== null"
          class="ml-1"
        >· {{ t('author.ageYears', {age}) }}</span>
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
        {{ t('author.alsoKnownAs', {"names": author.alternate_names.slice(0, 2).join(', ')}) }}
      </p>

      <StatsRow
        :stats="authorStats"
        class="mb-4"
      />

      <DescriptionCard
        :description="author.bio"
        :collapsible="true"
        :max-lines="5"
        hide-card
        empty-message=""
        class="mb-4"
      />

      <!-- Info row -->
      <div class="d-flex align-center text-body-2 mb-4 flex-wrap gap-4">
        <div
          v-if="birthPlace"
          class="d-flex align-center text-medium-emphasis gap-1"
        >
          <v-icon
            icon="mdi-map-marker"
            size="small"
          />
          {{ birthPlace }}
        </div>

        <a
          v-if="author.wikipedia_url"
          :href="author.wikipedia_url"
          target="_blank"
          rel="noopener noreferrer"
          class="d-flex align-center text-primary text-decoration-none gap-1"
        >
          <v-icon
            icon="mdi-wikipedia"
            size="small"
          />
          {{ t('author.wikipedia') }}
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
            {{ t('author.edit') }}
          </v-btn>

          <v-btn
            prepend-icon="mdi-delete"
            variant="text"
            size="small"
            color="error"
            @click="deleteDialogOpen = true"
          >
            {{ t('author.delete') }}
          </v-btn>
        </div>

        <AdminEditDialog
          v-if="isAdmin"
          v-model="editDialogOpen"
          :title="t('author.edit')"
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
            <v-card-title>{{ t('author.deleteConfirmTitle') }}</v-card-title>

            <v-card-text>
              {{ t('author.deleteConfirmBody', {'name': author.name}) }}
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
                {{ t('common.cancel') }}
              </v-btn>

              <v-btn
                color="error"
                variant="flat"
                :loading="adminStore.isDeleteLoading"
                @click="handleAuthorDelete"
              >
                {{ t('common.delete') }}
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </ClientOnly>
    </v-col>
  </v-row>
</template>
