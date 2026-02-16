<script setup lang="ts">
interface Props {
  slug: string
}

const props = defineProps<Props>()

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
const sortOptions = [
  { title: 'Newest', value: 'newest' },
  { title: 'Oldest', value: 'oldest' },
  { title: 'Highest rated', value: 'highest' },
  { title: 'Lowest rated', value: 'lowest' },
]

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
  bookPageStore.fetchComments(props.slug, {
    ...getSortParams(),
    include_spoilers: true,
  })
}

onMounted(() => fetchComments())

watch(selectedSort, () => fetchComments())

watch(() => authStore.isAuthenticated, () => fetchComments())

function handleCommentSaved() {
  editingOwnComment.value = false
  showSnackbar('Comment saved')
  // Refresh the list of other comments in background
  fetchComments()
}

async function handleDeleteComment() {
  if (!bookPageStore.myComment)
    return

  try {
    await bookPageStore.deleteComment(props.slug, bookPageStore.myComment.comment_id)
    confirmDelete.value = false
    showSnackbar('Comment deleted')
    fetchComments()
  }
  catch {
    showSnackbar('Failed to delete comment', 'error')
  }
}
</script>

<template>
  <div class="d-flex align-center justify-space-between mb-4">
    <h2 class="text-h6 font-weight-bold">
      Comments
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
      Log in to leave a comment
    </div>

    <v-btn
      variant="elevated"
      color="primary"
      @click="authDialogStore.openLogin()"
    >
      Log In
    </v-btn>
  </v-card>

  <!-- Comments List -->
  <div class="d-flex flex-column">
    <BookCommentCard
      v-for="comment in otherComments"
      :key="comment.comment_id"
      class="mb-4"
      :comment="comment"
    />
  </div>

  <!-- Loading -->
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
      Load More Comments
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
      No comments yet. Be the first to share your thoughts!
    </div>
  </div>

  <!-- Confirm Delete Dialog -->
  <v-dialog
    v-model="confirmDelete"
    max-width="400"
  >
    <v-card>
      <v-card-title class="text-h6">
        Delete Comment
      </v-card-title>

      <v-card-text>
        Are you sure you want to delete your comment? This action cannot be undone.
      </v-card-text>

      <v-card-actions>
        <v-spacer />

        <v-btn
          variant="text"
          @click="confirmDelete = false"
        >
          Cancel
        </v-btn>

        <v-btn
          color="error"
          variant="elevated"
          @click="handleDeleteComment"
        >
          Delete
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Snackbar -->
  <v-snackbar
    v-model="snackbar"
    :color="snackbarColor"
    :timeout="3000"
  >
    {{ snackbarText }}
  </v-snackbar>
</template>
