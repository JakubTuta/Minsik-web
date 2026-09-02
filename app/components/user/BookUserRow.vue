<script setup lang="ts">
import type { BookshelfStatus } from '~/types/user'
import { useDisplay, useTheme } from 'vuetify'
import { hashColor } from '~/utils/coverColor'
import { formatDisplayDate, formatRelativeTime } from '~/utils/format'

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
  // eslint-disable-next-line vue/no-boolean-default -- actions are shown unless a caller opts out
  showActions: true,
})

const { t, locale } = useI18n()
const { mobile } = useDisplay()
const theme = useTheme()

const isDark = computed(() => theme.global.current.value.dark)
const statusChipVariant = computed(() => (isDark.value
  ? 'tonal'
  : 'elevated'))

const statusConfig = computed<Record<BookshelfStatus, { label: string, color: string }>>(() => ({
  want_to_read: { label: t('bookshelf.wantToRead'), color: 'orange' },
  reading: { label: t('bookshelf.reading'), color: 'blue' },
  read: { label: t('bookshelf.read'), color: 'green' },
  abandoned: { label: t('bookshelf.abandoned'), color: 'grey' },
}))

const coverBg = computed(() => hashColor(props.title, props.authorNames.join(','), props.seriesName),
)

const relativeTime = computed(() => formatRelativeTime(props.updatedAt, t, locale.value))
const fullDate = computed(() => formatDisplayDate(props.updatedAt, locale.value))
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
      <NuxtLinkLocale
        :to="`/books/${slug}`"
        class="flex-shrink-0"
        style="width: 90px; height: 120px; display: block;"
      >
        <BookCover
          :title="title"
          :src="coverUrl"
          :width="90"
          :height="120"
          fit="cover"
          rounded
          :fallback-color="coverBg"
        />
      </NuxtLinkLocale>

      <div class="flex-grow-1 pl-3">
        <NuxtLinkLocale
          :to="`/books/${slug}`"
          class="text-decoration-none text-primary"
        >
          <div class="text-body-1 font-weight-bold">
            {{ title }}
          </div>
        </NuxtLinkLocale>

        <div class="text-body-2 text-medium-emphasis mt-1">
          <template
            v-for="(author, i) in authorNames"
            :key="author"
          >
            <NuxtLinkLocale
              :to="`/authors/${authorSlugs[i]}`"
              class="text-decoration-none text-medium-emphasis"
            >
              {{ author }}
            </NuxtLinkLocale>

            <span v-if="i < authorNames.length - 1">, </span>
          </template>
        </div>

        <slot name="details" />
      </div>

      <div
        class="d-flex flex-column flex-shrink-0 gap-1 align-start"
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
          <template #activator="{'props': tooltipProps}">
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
        class="d-flex align-center flex-shrink-0 gap-1"
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
      <NuxtLinkLocale
        :to="`/books/${slug}`"
        class="flex-shrink-0"
        style="width: 72px; height: 108px; display: block;"
      >
        <BookCover
          :title="title"
          :src="coverUrl"
          :width="72"
          :height="108"
          fit="cover"
          rounded
          :fallback-color="coverBg"
        />
      </NuxtLinkLocale>

      <div class="d-flex flex-column min-w-0 flex-grow-1 gap-1">
        <NuxtLinkLocale
          :to="`/books/${slug}`"
          class="text-decoration-none text-primary"
        >
          <div class="text-body-1 font-weight-bold">
            {{ title }}
          </div>
        </NuxtLinkLocale>

        <div class="text-body-2 text-medium-emphasis mt-1">
          <template
            v-for="(author, i) in authorNames"
            :key="author"
          >
            <NuxtLinkLocale
              :to="`/authors/${authorSlugs[i]}`"
              class="text-decoration-none text-medium-emphasis"
            >
              {{ author }}
            </NuxtLinkLocale>

            <span v-if="i < authorNames.length - 1">, </span>
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
          <template #activator="{'props': tooltipProps}">
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
          class="d-flex mt-1 gap-1"
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
