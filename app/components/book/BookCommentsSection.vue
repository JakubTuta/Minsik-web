<script setup lang="ts">
interface Props {
  slug: string
  selectedRatingFilters?: number[] | null
}

const props = withDefaults(defineProps<Props>(), {
  selectedRatingFilters: null,
})

const { t } = useI18n()
const authStore = useAuthStore()
const authDialogStore = useAuthDialogStore()
const bookPageStore = useBookPageStore()

const editingOwnComment = ref(false)
const confirmDelete = ref(false)

const snackbar = ref(false)
const snackbarText = ref('')
const snackbarColor = ref('success')

function showSnackbar(text: string, color = 'success') {
  snackbarText.value = text
  snackbarColor.value = color
  snackbar.value = true
}

// Sorting
const sortOptions = computed(() => [
  { title: t('comment.sortNewest'), value: 'newest' },
  { title: t('comment.sortOldest'), value: 'oldest' },
  { title: t('comment.sortHighestRated'), value: 'highest' },
  { title: t('comment.sortLowestRated'), value: 'lowest' },
])

const selectedSort = ref('newest')

function getSortParams() {
  switch (selectedSort.value) {
    case 'oldest':
      return { sort_by: 'created_at', order: 'asc' }
    case 'highest':
      return { sort_by: 'overall_rating', order: 'desc' }
    case 'lowest':
      return { sort_by: 'overall_rating', order: 'asc' }
    default:
      return { sort_by: 'created_at', order: 'desc' }
  }
}

const otherComments = computed(() => {
  if (!bookPageStore.myComment)
    return bookPageStore.comments

  return bookPageStore.comments.filter(
    comment => comment.comment_id !== bookPageStore.myComment?.comment_id,
  )
})

function fetchComments() {
  const params: Record<string, any> = {
    ...getSortParams(),
    include_spoilers: true,
  }
  if (props.selectedRatingFilters?.length)
    params.rating_filter = props.selectedRatingFilters
  bookPageStore.fetchComments(props.slug, params)
}

onMounted(() => fetchComments())

watch(selectedSort, () => fetchComments())
watch(() => props.selectedRatingFilters, () => fetchComments())
watch(() => authStore.isAuthenticated, () => fetchComments())

function handleCommentSaved() {
  editingOwnComment.value = false
  showSnackbar(t('comment.saved'))
  // Refresh the list of other comments in background
  fetchComments()
}

async function handleDeleteComment() {
  if (!bookPageStore.myComment)
    return

  try {
    await bookPageStore.deleteComment(props.slug, bookPageStore.myComment.comment_id)
    confirmDelete.value = false
    showSnackbar(t('comment.deleted'))
    fetchComments()
  }
  catch {
    showSnackbar(t('comment.deleteFailed'), 'error')
  }
}
</script>

<template>
  <div class="d-flex align-center justify-space-between mb-4">
    <h2 class="text-h6 font-weight-bold">
      {{ t('nav.comments') }}
      <span class="text-medium-emphasis">
        ({{ bookPageStore.commentsTotal }})
      </span>
    </h2>

    <!-- Sort -->
    <v-select
      v-model="selectedSort"
      :items="sortOptions"
      item-title="title"
      item-value="value"
      variant="outlined"
      density="compact"
      hide-details
      style="max-width: 180px;"
    />
  </div>

  <!-- User's Own Comment -->
  <template v-if="authStore.isAuthenticated">
    <!-- Editing own comment -->
    <BookCommentForm
      v-if="editingOwnComment && bookPageStore.myComment"
      :slug="slug"
      :existing-comment="bookPageStore.myComment"
      class="mb-4"
      @saved="handleCommentSaved"
      @cancelled="editingOwnComment = false"
    />

    <!-- Display own comment -->
    <BookCommentCard
      v-else-if="bookPageStore.myComment"
      :comment="bookPageStore.myComment"
      is-own
      class="mb-8"
      @edit="editingOwnComment = true"
      @delete="confirmDelete = true"
    />

    <!-- Create new comment form -->
    <BookCommentForm
      v-else
      :slug="slug"
      class="mb-4"
      @saved="handleCommentSaved"
    />
  </template>

  <!-- Guest Login Prompt -->
  <v-card
    v-else
    variant="outlined"
    class="mb-4 pa-4 text-center"
  >
    <v-icon
      icon="mdi-comment-text-outline"
      size="32"
      color="secondary"
      class="mb-2"
    />

    <div class="text-body-1 mb-3">
      {{ t('comment.loginPrompt') }}
    </div>

    <v-btn
      variant="elevated"
      color="primary"
      @click="authDialogStore.openLogin()"
    >
      {{ t('nav.signIn') }}
    </v-btn>
  </v-card>

  <Transition
    name="fade"
    mode="out-in"
  >
    <!-- Initial Loading -->
    <div
      v-if="bookPageStore.commentsLoading && otherComments.length === 0"
      key="loading"
      class="py-6 text-center"
    >
      <v-progress-circular
        indeterminate
        color="primary"
      />
    </div>

    <!-- Content -->
    <div
      v-else
      key="content"
    >
      <!-- Comments List -->
      <div class="d-flex flex-column">
        <BookCommentCard
          v-for="comment in otherComments"
          :key="comment.comment_id"
          class="mb-4"
          :comment="comment"
        />
      </div>

      <!-- Load More Loading -->
      <div
        v-if="bookPageStore.commentsLoading"
        class="py-6 text-center"
      >
        <v-progress-circular
          indeterminate
          color="primary"
        />
      </div>

      <!-- Load More -->
      <div
        v-if="bookPageStore.commentsHasMore && !bookPageStore.commentsLoading"
        class="py-4 text-center"
      >
        <v-btn
          variant="outlined"
          color="primary"
          @click="bookPageStore.loadMoreComments()"
        >
          {{ t('comment.loadMore') }}
        </v-btn>
      </div>

      <!-- Empty State -->
      <div
        v-if="!bookPageStore.commentsLoading && otherComments.length === 0 && !bookPageStore.myComment"
        class="py-8 text-center"
      >
        <v-icon
          icon="mdi-comment-outline"
          size="48"
          color="secondary"
          class="mb-3"
        />

        <div class="text-body-1 text-secondary">
          {{ t('comment.empty') }}
        </div>
      </div>
    </div>
  </Transition>

  <v-dialog
    v-model="confirmDelete"
    max-width="400"
  >
    <v-card>
      <v-card-title class="text-h6">
        {{ t('comment.deleteTitle') }}
      </v-card-title>

      <v-card-text>
        {{ t('comment.deleteBody') }}
      </v-card-text>

      <v-card-actions>
        <v-spacer />

        <v-btn
          variant="text"
          @click="confirmDelete = false"
        >
          {{ t('common.cancel') }}
        </v-btn>

        <v-btn
          color="error"
          variant="elevated"
          @click="handleDeleteComment"
        >
          {{ t('common.delete') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <v-snackbar
    v-model="snackbar"
    :color="snackbarColor"
    :timeout="3000"
  >
    {{ snackbarText }}
  </v-snackbar>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
