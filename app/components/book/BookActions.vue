<script setup lang="ts">
interface Props {
  slug: string
}

defineProps<Props>()

const authStore = useAuthStore()
const authDialogStore = useAuthDialogStore()
const bookPageStore = useBookPageStore()

const showBookshelfDialog = ref(false)
const showRatingDialog = ref(false)

const snackbar = ref(false)
const snackbarText = ref('')
const snackbarColor = ref('success')

function showSnackbar(text: string, color = 'success') {
  snackbarText.value = text
  snackbarColor.value = color
  snackbar.value = true
}

const statusLabels: Record<string, string> = {
  want_to_read: 'Want to Read',
  reading: 'Reading',
  read: 'Read',
  abandoned: 'Abandoned',
}

const statusColors: Record<string, string> = {
  want_to_read: 'orange',
  reading: 'blue',
  read: 'green',
  abandoned: 'grey',
}

function handleBookshelfClick() {
  if (!authStore.isAuthenticated) {
    authDialogStore.openLogin()

    return
  }
  showBookshelfDialog.value = true
}

function handleRateClick() {
  if (!authStore.isAuthenticated) {
    authDialogStore.openLogin()

    return
  }
  showRatingDialog.value = true
}

async function handleFavouriteClick(slug: string) {
  if (!authStore.isAuthenticated) {
    authDialogStore.openLogin()

    return
  }
  try {
    const wasFav = bookPageStore.isFavourite
    await bookPageStore.toggleFavourite(slug)
    showSnackbar(wasFav
      ? 'Removed from favourites'
      : 'Added to favourites')
  }
  catch {
    showSnackbar('Failed to update favourites', 'error')
  }
}

function handleBookshelfSaved() {
  showSnackbar('Bookshelf updated')
}

function handleRatingSaved() {
  showSnackbar('Rating saved')
}
</script>

<template>
  <div class="d-flex align-center flex-wrap gap-3">
    <!-- Bookshelf Button -->
    <v-btn
      variant="elevated"
      :color="bookPageStore.bookshelfStatus
        ? statusColors[bookPageStore.bookshelfStatus]
        : 'primary'"
      :prepend-icon="bookPageStore.bookshelfStatus
        ? 'mdi-bookmark'
        : 'mdi-bookmark-outline'"
      :loading="bookPageStore.statusLoading"
      @click="handleBookshelfClick"
    >
      {{ bookPageStore.bookshelfStatus
        ? statusLabels[bookPageStore.bookshelfStatus]
        : 'Add to Bookshelf' }}
    </v-btn>

    <!-- Favourite Button -->
    <v-btn
      :icon="bookPageStore.isFavourite
        ? 'mdi-heart'
        : 'mdi-heart-outline'"
      :variant="bookPageStore.isFavourite
        ? 'elevated'
        : 'outlined'"
      color="warning"
      rounded="circle"
      size="small"
      @click="handleFavouriteClick(slug)"
    />

    <!-- Rate This Book -->
    <v-btn
      variant="elevated"
      color="primary"
      prepend-icon="mdi-star-outline"
      @click="handleRateClick"
    >
      {{ bookPageStore.userRating
        ? 'Edit Rating'
        : 'Rate this book' }}
    </v-btn>

    <!-- Bookshelf Dialog -->
    <BookshelfStatusDialog
      v-model="showBookshelfDialog"
      :current-status="bookPageStore.bookshelfStatus"
      :slug="slug"
      @saved="handleBookshelfSaved"
    />

    <!-- Rating Dialog -->
    <RatingDialog
      v-model="showRatingDialog"
      :slug="slug"
      @saved="handleRatingSaved"
    />

    <!-- Snackbar -->
    <v-snackbar
      v-model="snackbar"
      :color="snackbarColor"
      :timeout="3000"
    >
      {{ snackbarText }}
    </v-snackbar>
  </div>
</template>
