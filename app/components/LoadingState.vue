<script setup lang="ts">
interface Props {
  type: 'card' | 'list' | 'detail' | 'grid'
  count?: number
}

const props = withDefaults(defineProps<Props>(), {
  count: 1,
})

const skeletonType = computed(() => {
  switch (props.type) {
    case 'card':
      return 'image, article'
    case 'list':
      return 'list-item-avatar-three-line'
    case 'detail':
      return 'card'
    case 'grid':
      return 'image, article'
    default:
      return 'card'
  }
})

const items = computed(() => Array.from({ length: props.count }, (_, i) => i))
</script>

<template>
  <template v-if="type === 'grid'">
    <v-row>
      <v-col
        v-for="item in items"
        :key="item"
        cols="12"
        sm="6"
        md="4"
        lg="3"
      >
        <v-skeleton-loader :type="skeletonType" />
      </v-col>
    </v-row>
  </template>

  <template v-else-if="type === 'list'">
    <v-card
      v-for="item in items"
      :key="item"
      class="mb-3"
    >
      <v-skeleton-loader :type="skeletonType" />
    </v-card>
  </template>

  <template v-else>
    <v-skeleton-loader
      v-for="item in items"
      :key="item"
      :type="skeletonType"
      class="mb-3"
    />
  </template>
</template>
