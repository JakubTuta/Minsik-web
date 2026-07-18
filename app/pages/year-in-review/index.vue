<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const yearInReviewStore = useYearInReviewStore()

useSeo({
  title: 'Year in Review',
  description: 'Your reading journey this year, so far.',
})

onMounted(() => {
  yearInReviewStore.fetch()
})

const review = computed(() => yearInReviewStore.review)

const isEmpty = computed(() => {
  const r = review.value
  if (!r)
    return false

  return r.total_books_finished === 0 && r.ratings_given === 0
})
</script>

<template>
  <v-container>
    <UserProfileTabs />

    <ErrorState
      v-if="yearInReviewStore.error"
      message="Could not load your year in review."
      @retry="yearInReviewStore.fetch(true)"
    />

    <LoadingState
      v-else-if="yearInReviewStore.isLoading && !review"
      type="detail"
    />

    <template v-else-if="review">
      <div
        v-if="isEmpty"
        class="py-16 text-center"
      >
        <v-icon
          icon="mdi-calendar-star"
          size="64"
          color="secondary"
          class="mb-4"
        />

        <div class="text-h5 font-weight-bold">
          Your {{ review.year }} is still a blank page
        </div>

        <div class="text-body-1 text-medium-emphasis mb-6 mt-2">
          Finish a book or leave a rating to start your year in review.
        </div>

        <div class="d-flex ga-4 flex-wrap justify-center">
          <v-btn
            to="/discover"
            color="primary"
            variant="elevated"
            prepend-icon="mdi-compass"
          >
            Discover books
          </v-btn>

          <v-btn
            to="/bookshelf"
            variant="tonal"
            prepend-icon="mdi-bookshelf"
          >
            Go to bookshelf
          </v-btn>
        </div>
      </div>

      <template v-else>
        <YearReviewHero
          :year="review.year"
          :months-elapsed="review.months_elapsed"
          :total-books-finished="review.total_books_finished"
          :cover-urls="review.finished_cover_urls"
        />

        <YearReviewKpiRow
          class="mb-6"
          :total-books-finished="review.total_books_finished"
          :total-pages-read="review.total_pages_read"
          :total-hours-read="review.total_hours_read"
          :ratings-given="review.ratings_given"
          :currently-reading-count="review.currently_reading_count"
          :added-to-shelf-count="review.added_to_shelf_count"
        />

        <v-row>
          <v-col
            cols="12"
            md="8"
          >
            <YearReviewMonthlyChart
              class="mb-6"
              :monthly="review.monthly"
            />

            <YearReviewMonthCards
              class="mb-6"
              :monthly="review.monthly"
            />

            <YearReviewFunFacts
              class="mb-6"
              :longest-book="review.longest_book"
              :shortest-book="review.shortest_book"
              :first-finished="review.first_finished"
              :highest-rated="review.highest_rated"
              :average-pages-per-book="review.average_pages_per_book"
              :busiest-month="review.busiest_month"
              :busiest-month-count="review.busiest_month_count"
              :average-days-to-finish="review.average_days_to_finish"
            />
          </v-col>

          <v-col
            cols="12"
            md="4"
          >
            <YearReviewRatings
              class="mb-6"
              :average-rating-given="review.average_rating_given"
              :ratings-given="review.ratings_given"
              :rating-distribution="review.rating_distribution"
              :reviews-written="review.reviews_written"
            />

            <TopGenresCard :genres="review.top_genres" />

            <FavouriteAuthorsCard :authors="review.top_authors" />
          </v-col>
        </v-row>
      </template>
    </template>
  </v-container>
</template>
