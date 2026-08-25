<script setup lang="ts">
interface Props {
  /** Shown as the alt text, and its first letter is the fallback initial. */
  name: string
  src?: string | null
  size?: number
}

const props = withDefaults(defineProps<Props>(), {
  src: null,
  size: 40,
})

const initials = computed(() => props.name.charAt(0).toUpperCase())

const initialsSize = computed(() => `${Math.max(12, Math.round(props.size * 0.36))}px`)
</script>

<template>
  <!--
    `<v-avatar :image>` renders a VImg internally, which emits no <img> during
    SSR and carries an upstream crash in its size polling. AppImage is the
    project's remote-image primitive: a real <img>, retry with backoff, and a
    fallback tile when the avatar is genuinely gone.
  -->
  <v-avatar
    :size="size"
    color="secondary"
  >
    <AppImage
      v-if="src"
      :src="src"
      :alt="name"
      :width="size"
      :height="size"
      fit="cover"
      circle
    >
      <template #fallback>
        <span
          class="font-weight-bold"
          :style="{'fontSize': initialsSize}"
        >{{ initials }}</span>
      </template>
    </AppImage>

    <span
      v-else
      class="font-weight-bold"
      :style="{'fontSize': initialsSize}"
    >{{ initials }}</span>
  </v-avatar>
</template>
