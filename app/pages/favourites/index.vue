<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

useSeo({ title: 'My Favourites', description: 'Books you have marked as favourites.' })

const favouritesStore = useFavouritesStore()

const sortOptions = [
  { label: 'Date Added', value: 'created_at' },
]

const order = ref<'asc' | 'desc'>('desc')
const titleFilter = ref('')

const filteredItems = computed(() => {
  if (!titleFilter.value)
    return favouritesStore.items
  const q = titleFilter.value.toLowerCase()

  return favouritesStore.items.filter(e => e.book_title.toLowerCase().includes(q))
})

watch(order, () => favouritesStore.fetch(true))

onMounted(() => favouritesStore.fetch(true))

useInfiniteScroll(
  () => favouritesStore.loadMore(),
  {
    threshold: 400,
    enabled: computed(() => favouritesStore.hasMore && !favouritesStore.isLoading),
  },
)
</script>

<template>
  <v-container>
    <UserProfileTabs />

    <v-row>
      <v-col
        cols="12"
        md="3"
      >
        <UserFilterPanel
          v-model:order="order"
          v-model:title-filter="titleFilter"
          :sort-options="sortOptions"
          sort="created_at"
        />
      </v-col>

      <v-col
        cols="12"
        md="9"
      >
        <div class="d-flex flex-column gap-2">
          <FavouriteItem
            v-for="entry in filteredItems"
            :key="entry.book_id"
            :entry="entry"
          />
        </div>

        <div
          v-if="favouritesStore.isLoading && !favouritesStore.hasData"
          class="d-flex flex-column gap-2"
        >
          <v-skeleton-loader
            v-for="i in 5"
            :key="i"
            type="list-item-avatar-three-line"
          />
        </div>

        <div
          v-if="favouritesStore.isLoading && favouritesStore.hasData"
          class="py-6 text-center"
        >
          <v-progress-circular
            indeterminate
            color="primary"
          />
        </div>

        <div
          v-if="favouritesStore.isEmpty"
          class="py-12 text-center"
        >
          <v-icon
            icon="mdi-heart-outline"
            size="64"
            color="secondary"
            class="mb-4"
          />

          <div class="text-h6 text-secondary">
            No favourite books yet
          </div>

          <div class="text-caption text-secondary mt-2">
            Mark books as favourites while browsing
          </div>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>
