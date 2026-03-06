<script setup lang="ts">
useSeoMeta({
  title: 'About - Minsik',
  description: 'Minsik is a community-driven book discovery and tracking platform that combines community ratings with Open Library data to help you find your next great read.',
})
</script>

<template>
  <v-container
    class="py-12"
    max-width="900"
  >
    <v-row justify="center">
      <v-col cols="12">
        <!-- Hero -->
        <div class="mb-10 text-center">
          <v-icon
            size="72"
            color="primary"
            class="mb-4"
          >
            mdi-bookshelf
          </v-icon>

          <h1 class="text-h3 font-weight-bold mb-4">
            About Minsik
          </h1>

          <p
            class="text-h6 text-medium-emphasis mx-auto"
            style="max-width: 620px;"
          >
            A community-driven book discovery and tracking platform for readers who love to explore, rate, and share great books.
          </p>
        </div>

        <!-- What is Minsik -->
        <v-card
          variant="outlined"
          class="mb-6 pa-6"
        >
          <h2 class="text-h6 font-weight-bold mb-3">
            What is Minsik?
          </h2>

          <p class="text-body-2 mb-3">
            Minsik is a book platform built for curious readers. It combines powerful discovery tools with a personal reading tracker, community ratings, and a unique collectible book experience — all in one place.
          </p>

          <p class="text-body-2">
            What sets Minsik apart is its rating system: every book's score is a weighted combination of Minsik community reviews and Open Library data, giving you the most comprehensive view of a book's quality before you commit to reading it.
          </p>
        </v-card>

        <!-- Features -->
        <h2 class="text-h5 font-weight-bold mb-4">
          Key Features
        </h2>

        <v-row class="mb-8">
          <v-col
            cols="12"
            sm="6"
          >
            <v-card
              variant="tonal"
              class="h-100 pa-5"
            >
              <div class="d-flex align-center mb-2 gap-3">
                <v-icon color="primary">
                  mdi-bookshelf
                </v-icon>

                <span class="text-subtitle-1 font-weight-bold">Reading Tracker</span>
              </div>

              <p class="text-body-2 text-medium-emphasis">
                Organize your reading life with three lists: Want to Read, Currently Reading, and Already Read. Your personal library is always a tap away.
              </p>
            </v-card>
          </v-col>

          <v-col
            cols="12"
            sm="6"
          >
            <v-card
              variant="tonal"
              class="h-100 pa-5"
            >
              <div class="d-flex align-center mb-2 gap-3">
                <v-icon color="warning">
                  mdi-star
                </v-icon>

                <span class="text-subtitle-1 font-weight-bold">Ratings & Reviews</span>
              </div>

              <p class="text-body-2 text-medium-emphasis">
                Rate books with nuanced sub-ratings covering writing style, plot, characters, and more. Write reviews that help the community discover great reads.
              </p>
            </v-card>
          </v-col>

          <v-col
            cols="12"
            sm="6"
          >
            <v-card
              variant="tonal"
              class="h-100 pa-5"
            >
              <div class="d-flex align-center mb-2 gap-3">
                <v-icon color="deep-purple">
                  mdi-treasure-chest
                </v-icon>

                <span class="text-subtitle-1 font-weight-bold">Book Cases</span>
              </div>

              <p class="text-body-2 text-medium-emphasis">
                Open mystery cases to reveal random books with collectible rarity tiers — from Common all the way to the coveted Legendary. A fun, surprise-driven way to find your next read.
              </p>
            </v-card>
          </v-col>

          <v-col
            cols="12"
            sm="6"
          >
            <v-card
              variant="tonal"
              class="h-100 pa-5"
            >
              <div class="d-flex align-center mb-2 gap-3">
                <v-icon color="info">
                  mdi-compass
                </v-icon>

                <span class="text-subtitle-1 font-weight-bold">Smart Discovery</span>
              </div>

              <p class="text-body-2 text-medium-emphasis">
                Filter by book length, mood, era, quality threshold, and more. Minsik surfaces the perfect match from thousands of titles based on exactly what you're in the mood for.
              </p>
            </v-card>
          </v-col>

          <v-col
            cols="12"
            sm="6"
          >
            <v-card
              variant="tonal"
              class="h-100 pa-5"
            >
              <div class="d-flex align-center mb-2 gap-3">
                <v-icon color="success">
                  mdi-brain
                </v-icon>

                <span class="text-subtitle-1 font-weight-bold">Personalized Recommendations</span>
              </div>

              <p class="text-body-2 text-medium-emphasis">
                Receive book and author recommendations tailored to your reading history. The more you rate and read, the more precise your suggestions become.
              </p>
            </v-card>
          </v-col>

          <v-col
            cols="12"
            sm="6"
          >
            <v-card
              variant="tonal"
              class="h-100 pa-5"
            >
              <div class="d-flex align-center mb-2 gap-3">
                <v-icon color="pink">
                  mdi-account-group
                </v-icon>

                <span class="text-subtitle-1 font-weight-bold">Community Profiles</span>
              </div>

              <p class="text-body-2 text-medium-emphasis">
                Explore other readers' public bookshelves, browse their ratings and reviews, and discover what the community is reading right now.
              </p>
            </v-card>
          </v-col>
        </v-row>

        <!-- Ratings -->
        <v-card
          variant="outlined"
          class="mb-6 pa-6"
        >
          <h2 class="text-h6 font-weight-bold mb-3">
            How Ratings Work
          </h2>

          <p class="text-body-2 mb-5">
            Every book on Minsik displays a combined rating — a weighted average from two independent sources:
          </p>

          <v-row class="mb-4">
            <v-col
              cols="12"
              sm="6"
            >
              <div class="d-flex items-start gap-3">
                <v-icon
                  color="primary"
                  class="mt-1"
                >
                  mdi-star-circle
                </v-icon>

                <div>
                  <p class="text-body-2 font-weight-bold mb-1">
                    Minsik Community
                  </p>

                  <p class="text-body-2 text-medium-emphasis">
                    Ratings and detailed reviews submitted by Minsik users, weighted by the number of submissions.
                  </p>
                </div>
              </div>
            </v-col>

            <v-col
              cols="12"
              sm="6"
            >
              <div class="d-flex items-start gap-3">
                <v-icon
                  color="secondary"
                  class="mt-1"
                >
                  mdi-library
                </v-icon>

                <div>
                  <p class="text-body-2 font-weight-bold mb-1">
                    Open Library
                  </p>

                  <p class="text-body-2 text-medium-emphasis">
                    Ratings from the Open Library community — a vast open catalog maintained by the Internet Archive.
                  </p>
                </div>
              </div>
            </v-col>
          </v-row>

          <p class="text-body-2">
            The two sources are combined proportionally by review count, so books with more ratings carry a more reliable score. On each book's detail page you can always see both scores independently alongside the combined result.
          </p>
        </v-card>

        <!-- Data sources -->
        <v-card
          variant="outlined"
          class="mb-6 pa-6"
        >
          <h2 class="text-h6 font-weight-bold mb-3">
            Data Sources
          </h2>

          <p class="text-body-2">
            Book metadata, author biographies, and series information on Minsik are sourced from <strong>Open Library</strong> — a free, community-maintained catalog run by the Internet Archive containing millions of titles across every genre and language. The Minsik community continuously enriches this foundation with ratings, comments, and reading records.
          </p>
        </v-card>

        <!-- CTA -->
        <v-card
          color="primary"
          variant="tonal"
          class="mb-6 pa-6 text-center"
        >
          <h2 class="text-h6 font-weight-bold mb-2">
            Start Your Reading Journey
          </h2>

          <p class="text-body-2 text-medium-emphasis mb-5">
            Create a free account to unlock personalized recommendations, track your reading, and become part of the Minsik community.
          </p>

          <div class="d-flex flex-wrap justify-center gap-3">
            <v-btn
              color="primary"
              variant="elevated"
              to="/"
              prepend-icon="mdi-home"
            >
              Browse Books
            </v-btn>

            <v-btn
              variant="outlined"
              to="/discover"
              prepend-icon="mdi-compass"
            >
              Discover a Book
            </v-btn>
          </div>
        </v-card>

        <div class="d-flex mt-2 justify-center">
          <v-btn
            variant="text"
            to="/"
            prepend-icon="mdi-arrow-left"
          >
            Back to Home
          </v-btn>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>
