<script setup lang="ts">
import type { AdminMutationResult, EditFieldConfig } from '~/types/admin'
import type { Author } from '~/types/api'

type EntityKind = 'author' | 'book' | 'series'

interface Props {
  entity: EntityKind
  id: number
  name: string
  slug: string
  fields: EditFieldConfig[]
  originalData: Record<string, any>
  /** Re-reads the entity after a successful edit, under the slug it now has. */
  refresh: (slug: string) => Promise<unknown>
  authors?: Pick<Author, 'author_id' | 'name' | 'slug'>[]
  variant?: 'text' | 'icon'
  containerClass?: string
}

const props = withDefaults(defineProps<Props>(), {
  authors: () => [],
  variant: 'text',
  containerClass: '',
})

const { t } = useI18n()
const authStore = useAuthStore()
const adminStore = useAdminStore()
const localePath = useLocalePath()

const LABELS: Record<EntityKind, { edit: string, remove: string, confirmTitle: string, confirmBody: string }> = {
  author: {
    edit: 'author.edit',
    remove: 'author.delete',
    confirmTitle: 'author.deleteConfirmTitle',
    confirmBody: 'author.deleteConfirmBody',
  },
  book: {
    edit: 'bookPage.editBook',
    remove: 'bookPage.deleteBook',
    confirmTitle: 'bookPage.deleteBookConfirmTitle',
    confirmBody: 'bookPage.deleteBookConfirmBody',
  },
  series: {
    edit: 'series.editSeries',
    remove: 'series.delete',
    confirmTitle: 'series.deleteConfirmTitle',
    confirmBody: 'series.deleteConfirmBody',
  },
}

const ROUTE_NAMES: Record<EntityKind, string> = {
  author: 'authors-slug',
  book: 'books-slug',
  series: 'series-slug',
}

const isAdmin = computed(() => authStore.user?.role === 'admin')
const labels = computed(() => LABELS[props.entity])
const canRemoveAuthors = computed(() => props.entity !== 'author')

const editDialogOpen = ref(false)
const deleteDialogOpen = ref(false)
const editError = ref('')
const deleteError = ref('')

function applyUpdate(edited: Record<string, any>): Promise<AdminMutationResult> {
  switch (props.entity) {
    case 'book':
      return adminStore.updateBook(props.id, props.originalData, edited)
    case 'series':
      return adminStore.updateSeries(props.id, props.originalData, edited)
    default:
      return adminStore.updateAuthor(props.id, props.originalData, edited)
  }
}

function applyDelete(): Promise<AdminMutationResult> {
  switch (props.entity) {
    case 'book':
      return adminStore.deleteBook(props.id)
    case 'series':
      return adminStore.deleteSeries(props.id)
    default:
      return adminStore.deleteAuthor(props.id)
  }
}

function applyAuthorRemoval(authorId: number): Promise<AdminMutationResult> {
  return props.entity === 'book'
    ? adminStore.removeBookAuthor(props.id, authorId)
    : adminStore.removeSeriesAuthor(props.id, authorId)
}

async function handleSave(edited: Record<string, any>) {
  editError.value = ''
  const result = await applyUpdate(edited)
  if (!result.success) {
    editError.value = result.error || t('admin.updateFailed')

    return
  }

  editDialogOpen.value = false
  const nextSlug = typeof edited.slug === 'string' && edited.slug
    ? edited.slug
    : props.slug

  await props.refresh(nextSlug)
  if (nextSlug !== props.slug)
    await navigateTo(localePath({ name: ROUTE_NAMES[props.entity], params: { slug: nextSlug } }))
}

async function handleRemoveAuthors(authorIds: number[]) {
  editError.value = ''
  const results = await Promise.all(authorIds.map(applyAuthorRemoval))
  const failed = results.find(result => !result.success)
  if (failed) {
    editError.value = failed.error || t('seriesPage.removeFailed')

    return
  }

  await props.refresh(props.slug)
}

async function handleDelete() {
  deleteError.value = ''
  const result = await applyDelete()
  if (!result.success) {
    deleteError.value = result.error || t('admin.deleteFailed')

    return
  }

  deleteDialogOpen.value = false
  await navigateTo(localePath('index'))
}
</script>

<template>
  <ClientOnly>
    <template v-if="isAdmin">
      <div
        class="d-flex gap-2"
        :class="containerClass"
      >
        <v-btn
          v-if="variant === 'icon'"
          icon="mdi-pencil"
          variant="text"
          size="small"
          color="secondary"
          :aria-label="t(labels.edit)"
          @click="editDialogOpen = true"
        />

        <v-btn
          v-else
          prepend-icon="mdi-pencil"
          variant="text"
          size="small"
          color="secondary"
          @click="editDialogOpen = true"
        >
          {{ t(labels.edit) }}
        </v-btn>

        <v-btn
          v-if="variant === 'icon'"
          icon="mdi-delete"
          variant="text"
          size="small"
          color="error"
          :aria-label="t(labels.remove)"
          @click="deleteDialogOpen = true"
        />

        <v-btn
          v-else
          prepend-icon="mdi-delete"
          variant="text"
          size="small"
          color="error"
          @click="deleteDialogOpen = true"
        >
          {{ t(labels.remove) }}
        </v-btn>
      </div>

      <AdminEditDialog
        v-model="editDialogOpen"
        :title="t(labels.edit)"
        :fields="fields"
        :original-data="originalData"
        :authors="canRemoveAuthors
          ? authors
          : []"
        :loading="adminStore.isUpdateLoading"
        :error="editError"
        @save="handleSave"
        @remove-authors="handleRemoveAuthors"
      />

      <v-dialog
        v-model="deleteDialogOpen"
        max-width="400"
      >
        <v-card>
          <v-card-title>{{ t(labels.confirmTitle) }}</v-card-title>

          <v-card-text>
            {{ t(labels.confirmBody, {name,
                                      'title': name}) }}

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
              @click="handleDelete"
            >
              {{ t('common.delete') }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </template>
  </ClientOnly>
</template>
