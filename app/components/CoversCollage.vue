<script setup lang="ts">
interface Props {
  covers: string[]
  width?: string
  height?: string
}

const props = withDefaults(defineProps<Props>(), {
  width: '100%',
  height: undefined,
})

const containerStyle = computed(() => {
  if (props.height) {
    return { position: 'relative' as const, width: props.width, height: props.height }
  }

  return { position: 'relative' as const, width: props.width, paddingBottom: '150%' }
})
</script>

<template>
  <div
    :style="containerStyle"
    :class="`covers-count-${covers.length}`"
  >
    <div
      v-for="(cover, index) in covers"
      :key="index"
      class="cover-item"
      :class="`cover-${index + 1}`"
    >
      <v-img
        :src="cover.startsWith('#') ? undefined : cover"
        :alt="`Book cover ${index + 1}`"
        aspect-ratio="0.67"
        cover
        class="rounded"
        :style="cover.startsWith('#') ? { backgroundColor: cover } : undefined"
      >
        <template #placeholder>
          <HashedFill :color="cover.startsWith('#') ? cover : '#e0e0e0'" />
        </template>
      </v-img>
    </div>
  </div>
</template>

<style scoped>
.cover-item {
  position: absolute;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  transition: transform 0.2s;
}

.cover-item:hover {
  transform: scale(1.05);
  z-index: 10;
}

/* 1 Book */
.covers-count-1 .cover-1 {
  width: 90%;
  height: 90%;
  top: 5%;
  left: 5%;
  z-index: 1;
}

/* 2 Books - Split horizontally */
.covers-count-2 .cover-1 {
  width: 85%;
  height: 45%;
  top: 5%;
  left: 7.5%;
  z-index: 2;
}

.covers-count-2 .cover-2 {
  width: 85%;
  height: 45%;
  bottom: 5%;
  left: 7.5%;
  z-index: 1;
}

/* 3 Books - First on left, 2 stacked on right */
.covers-count-3 .cover-1 {
  width: 55%;
  height: 85%;
  top: 7.5%;
  left: 5%;
  z-index: 3;
}

.covers-count-3 .cover-2 {
  width: 35%;
  height: 40%;
  top: 7.5%;
  right: 5%;
  z-index: 2;
}

.covers-count-3 .cover-3 {
  width: 35%;
  height: 40%;
  bottom: 7.5%;
  right: 5%;
  z-index: 1;
}

/* 4 Books - All corners */
.covers-count-4 .cover-1 {
  width: 55%;
  height: 40%;
  top: 5%;
  left: 5%;
  z-index: 4;
}

.covers-count-4 .cover-2 {
  width: 45%;
  height: 35%;
  top: 15%;
  right: 5%;
  z-index: 3;
}

.covers-count-4 .cover-3 {
  width: 50%;
  height: 38%;
  bottom: 15%;
  left: 10%;
  z-index: 2;
}

.covers-count-4 .cover-4 {
  width: 40%;
  height: 32%;
  bottom: 5%;
  right: 10%;
  z-index: 1;
}
</style>
