<script setup lang="ts">
// SEO
useSeo({
  title: 'Home',
  description: 'Discover your next favorite book through emotional reading profiles and book influence networks.',
})
</script>

<template>
  <v-container class="fill-height">
    <v-row
      align="center"
      justify="center"
    >
      <v-col
        cols="12"
        md="8"
        lg="6"
        class="text-center"
      >
        <v-icon
          icon="mdi-snowflake"
          size="80"
          color="primary"
          class="mb-6"
        />

        <h1 class="text-h3 text-md-h2 font-weight-bold mb-4">
          Discover Your Next Favorite Book
        </h1>

        <p class="text-h6 text-md-h5 text-secondary mb-8">
          Recommendations coming soon...
        </p>

        <v-btn
          to="/search"
          color="primary"
          size="large"
          prepend-icon="mdi-magnify"
        >
          Start Searching
        </v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>
