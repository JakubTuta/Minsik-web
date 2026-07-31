<script setup lang="ts">
const localePath = useLocalePath()
definePageMeta({ middleware: 'auth' })

const { t } = useI18n()
const yearInReviewStore = useYearInReviewStore()

useSeo({
  title: t('nav.yearInReview'),
  description: t('yearReview.seoDescription'),
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
  <div>
    <v-container>
      <UserProfileTabs />
    </v-container>

    <ErrorState
      v-if="yearInReviewStore.error"
      :message="t('yearReview.loadFailed')"
      @retry="yearInReviewStore.fetch(true)"
    />

    <v-container v-else-if="yearInReviewStore.isLoading && !review">
      <LoadingState type="detail" />
    </v-container>

    <template v-else-if="review">
      <v-container v-if="isEmpty">
        <div class="py-16 text-center">
          <v-icon
            icon="mdi-calendar-star"
            size="64"
            color="secondary"
            class="mb-4"
          />

          <div class="text-h5 font-weight-bold">
            {{ t('yearReview.blankPage', {"year": review.year}) }}
          </div>

          <div class="text-body-1 text-medium-emphasis mb-6 mt-2">
            {{ t('yearReview.blankPageHint') }}
          </div>

          <div class="d-flex ga-4 flex-wrap justify-center">
            <v-btn
              :to="localePath('/discover')"
              color="primary"
              variant="elevated"
              prepend-icon="mdi-compass"
            >
              {{ t('yearReview.discoverBooks') }}
            </v-btn>

            <v-btn
              :to="localePath('/bookshelf')"
              variant="tonal"
              prepend-icon="mdi-bookshelf"
            >
              {{ t('yearReview.goToBookshelf') }}
            </v-btn>
          </div>
        </div>
      </v-container>

      <template v-else>
        <YearReviewHero
          :year="review.year"
          :months-elapsed="review.months_elapsed"
          :total-books-finished="review.total_books_finished"
          :cover-urls="review.finished_cover_urls"
        />

        <v-container class="py-10">
          <YearReviewKpiRow
            class="mb-12"
            :total-books-finished="review.total_books_finished"
            :total-pages-read="review.total_pages_read"
            :total-hours-read="review.total_hours_read"
            :ratings-given="review.ratings_given"
            :currently-reading-count="review.currently_reading_count"
            :added-to-shelf-count="review.added_to_shelf_count"
          />

          <YearReviewFunFacts
            class="mb-12"
            :longest-book="review.longest_book"
            :shortest-book="review.shortest_book"
            :first-finished="review.first_finished"
            :highest-rated="review.highest_rated"
            :average-pages-per-book="review.average_pages_per_book"
            :busiest-month="review.busiest_month"
            :busiest-month-count="review.busiest_month_count"
            :average-days-to-finish="review.average_days_to_finish"
          />

          <v-row class="mb-12">
            <v-col
              cols="12"
              md="7"
            >
              <LazyYearReviewMonthlyChart
                hydrate-on-visible
                :monthly="review.monthly"
              />
            </v-col>

            <v-col
              cols="12"
              md="5"
            >
              <YearReviewRatings
                :average-rating-given="review.average_rating_given"
                :ratings-given="review.ratings_given"
                :rating-distribution="review.rating_distribution"
                :reviews-written="review.reviews_written"
              />
            </v-col>
          </v-row>

          <YearReviewTimeline
            v-if="review.total_books_finished > 0"
            :monthly="review.monthly"
          />
        </v-container>
      </template>
    </template>
  </div>
</template>
