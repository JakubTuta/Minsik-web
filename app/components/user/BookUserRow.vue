<script setup lang="ts">
import { useDisplay, useTheme } from 'vuetify'
import type { BookshelfStatus } from '~/types/user'
import { formatDisplayDate, formatRelativeTime } from '~/utils/format'
import { hashColor } from '~/utils/coverColor'

const props = withDefaults(defineProps<{
  slug: string
  title: string
  coverUrl?: string | null
  authorNames: string[]
  authorSlugs: string[]
  seriesName?: string | null
  status?: BookshelfStatus | null
  updatedAt: string
  showActions?: boolean
}>(), {
  status: null,
  showActions: true,
})

const { mobile } = useDisplay()
const theme = useTheme()

const isDark = computed(() => theme.global.current.value.dark)
const statusChipVariant = computed(() => isDark.value ? 'tonal' : 'elevated')

const statusConfig: Record<BookshelfStatus, { label: string, color: string }> = {
  want_to_read: { label: 'Want to Read', color: 'orange' },
  reading: { label: 'Reading', color: 'blue' },
  read: { label: 'Read', color: 'green' },
  abandoned: { label: 'Abandoned', color: 'grey' },
}

const coverBg = computed(() =>
  hashColor(props.title, props.authorNames.join(','), props.seriesName),
)

const relativeTime = computed(() => formatRelativeTime(props.updatedAt))
const fullDate = computed(() => formatDisplayDate(props.updatedAt))
</script>

<template>
  <v-card
    variant="elevated"
    color="surface"
  >
    <!-- Desktop layout -->
    <div
      v-if="!mobile"
      class="d-flex align-center gap-3 px-3 py-3"
    >
      <NuxtLink
        :to="`/books/${slug}`"
        class="flex-shrink-0"
        style="width: 90px; height: 120px; display: block;"
      >
        <v-img
          :src="coverUrl || undefined"
          :alt="title"
          width="90"
          height="120"
          cover
          rounded="sm"
          lazy-src="/placeholder-book-lazy.jpg"
        >
          <template #placeholder>
            <HashedFill :color="coverBg" />
          </template>
        </v-img>
      </NuxtLink>

      <div class="flex-grow-1 pl-3">
        <NuxtLink
          :to="`/books/${slug}`"
          class="text-decoration-none text-primary"
        >
          <div class="text-body-1 font-weight-bold">
            {{ title }}
          </div>
        </NuxtLink>

        <div class="text-body-2 text-medium-emphasis mt-1">
          <template
            v-for="(author, i) in authorNames"
            :key="author"
          >
            <NuxtLink
              :to="`/authors/${authorSlugs[i]}`"
              class="text-decoration-none text-medium-emphasis"
            >{{ author }}</NuxtLink><span v-if="i < authorNames.length - 1">, </span>
          </template>
        </div>

        <slot name="details" />
      </div>

      <div
        class="flex-shrink-0 d-flex flex-column align-start gap-1"
        style="width: 160px;"
      >
        <v-chip
          v-if="status"
          :color="statusConfig[status].color"
          :variant="statusChipVariant"
          size="small"
          label
        >
          {{ statusConfig[status].label }}
        </v-chip>

        <v-tooltip location="bottom">
          <template #activator="{ props: tooltipProps }">
            <span
              v-bind="tooltipProps"
              class="text-caption text-medium-emphasis cursor-default"
            >{{ relativeTime }}</span>
          </template>
          {{ fullDate }}
        </v-tooltip>

        <slot name="dateExtra" />
      </div>

      <slot name="meta" />

      <div
        v-if="showActions"
        class="flex-shrink-0 d-flex align-center gap-1"
        style="width: 120px; justify-content: flex-end;"
      >
        <slot name="actions" />
      </div>
    </div>

    <!-- Mobile layout -->
    <div
      v-else
      class="d-flex flex-row gap-3 pa-3"
    >
      <NuxtLink
        :to="`/books/${slug}`"
        class="flex-shrink-0"
        style="width: 72px; height: 108px; display: block;"
      >
        <v-img
          :src="coverUrl || undefined"
          :alt="title"
          width="72"
          height="108"
          cover
          rounded="sm"
          lazy-src="/placeholder-book-lazy.jpg"
        >
          <template #placeholder>
            <HashedFill :color="coverBg" />
          </template>
        </v-img>
      </NuxtLink>

      <div class="d-flex flex-column min-w-0 flex-grow-1 gap-1">
        <NuxtLink
          :to="`/books/${slug}`"
          class="text-decoration-none text-primary"
        >
          <div class="text-body-1 font-weight-bold">
            {{ title }}
          </div>
        </NuxtLink>

        <div class="text-body-2 text-medium-emphasis mt-1">
          <template
            v-for="(author, i) in authorNames"
            :key="author"
          >
            <NuxtLink
              :to="`/authors/${authorSlugs[i]}`"
              class="text-decoration-none text-medium-emphasis"
            >{{ author }}</NuxtLink><span v-if="i < authorNames.length - 1">, </span>
          </template>
        </div>

        <slot name="details" />

        <v-chip
          v-if="status"
          :color="statusConfig[status].color"
          :variant="statusChipVariant"
          size="small"
          label
          class="align-self-start"
        >
          {{ statusConfig[status].label }}
        </v-chip>

        <v-tooltip location="bottom">
          <template #activator="{ props: tooltipProps }">
            <span
              v-bind="tooltipProps"
              class="text-caption text-medium-emphasis cursor-default"
            >{{ relativeTime }}</span>
          </template>
          {{ fullDate }}
        </v-tooltip>

        <slot name="dateExtra" />

        <slot name="meta" />

        <div
          v-if="showActions"
          class="d-flex gap-1 mt-1"
        >
          <slot name="actions" />
        </div>
      </div>
    </div>

    <div
      v-if="$slots.footer"
      class="px-3 pb-3"
    >
      <slot name="footer" />
    </div>
  </v-card>
</template>
