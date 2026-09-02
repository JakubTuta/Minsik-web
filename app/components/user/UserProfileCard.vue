<script setup lang="ts">
const props = withDefaults(defineProps<{
  displayName: string
  username: string
  avatarUrl?: string | null
  bio?: string | null
  copyUrl?: string
  copyDisplay?: string
}>(), {
  avatarUrl: null,
  bio: null,
})

const { t } = useI18n()

const copyFeedback = ref(false)

const { copy } = useClipboard({ source: computed(() => props.copyUrl ?? '') })

async function copyProfileUrl() {
  if (!props.copyUrl)
    return
  await copy(props.copyUrl)
  copyFeedback.value = true
  setTimeout(() => {
    copyFeedback.value = false
  }, 2000)
}
</script>

<template>
  <v-card
    color="surface"
    variant="elevated"
    class="mb-6"
  >
    <div class="pa-6">
      <div class="d-flex align-center flex-wrap gap-4">
        <UserAvatar
          :name="displayName || username"
          :src="avatarUrl"
          :size="90"
        />

        <div class="flex-1-1">
          <div class="text-h4 font-weight-bold">
            {{ displayName || username }}
          </div>

          <div class="text-body-1 text-medium-emphasis">
            @{{ username }}
          </div>

          <div
            v-if="bio"
            class="text-body-2 text-medium-emphasis mt-1"
          >
            {{ bio }}
          </div>
        </div>

        <v-btn
          v-if="copyUrl && copyDisplay"
          variant="tonal"
          size="small"
          :color="copyFeedback
            ? 'success'
            : 'default'"
          :prepend-icon="copyFeedback
            ? 'mdi-check'
            : 'mdi-link-variant'"
          class="text-none"
          @click="copyProfileUrl"
        >
          {{ copyFeedback
            ? t('common.copied')
            : copyDisplay }}
        </v-btn>
      </div>
    </div>
  </v-card>
</template>
