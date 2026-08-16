<script setup lang="ts">
// Mounted once in app/layouts/default.vue. Holds <symbol> defs for the icons
// that repeat per-item in the card hot path (BookPreviewCard,
// AuthorPreviewCard — up to 90 instances per page). A <v-icon> inlines its
// full SVG path on every instance; referencing one shared <symbol> via
// <use> costs a few bytes per card instead of the full path each time.
// Paths copied from @mdi/js (mdiStar, mdiAccountMultiple) — same source
// vuetify/iconsets/mdi-svg draws from, so they render identically.
</script>

<template>
  <svg
    width="0"
    height="0"
    style="position: absolute;"
    aria-hidden="true"
  >
    <symbol
      id="icon-star"
      viewBox="0 0 24 24"
    >
      <path d="M12,17.27L18.18,21L16.54,13.97L22,9.24L14.81,8.62L12,2L9.19,8.62L2,9.24L7.45,13.97L5.82,21L12,17.27Z" />
    </symbol>

    <symbol
      id="icon-account-multiple"
      viewBox="0 0 24 24"
    >
      <path d="M16 17V19H2V17S2 13 9 13 16 17 16 17M12.5 7.5A3.5 3.5 0 1 0 9 11A3.5 3.5 0 0 0 12.5 7.5M15.94 13A5.32 5.32 0 0 1 18 17V19H22V17S22 13.37 15.94 13M15 4A3.39 3.39 0 0 0 13.07 4.59A5 5 0 0 1 13.07 10.41A3.39 3.39 0 0 0 15 11A3.5 3.5 0 0 0 15 4Z" />
    </symbol>
  </svg>
</template>
