<template>
  <v-app>
    <IconSprite />

    <AppBar />

    <AuthDialog />

    <AppToast />

    <v-main>
      <div class="page-content">
        <slot />
      </div>

      <AppFooter />
    </v-main>
  </v-app>
</template>

<style>
:root {
  --app-bar-height: 56px;
}
</style>

<style scoped>
.page-content {
  min-height: calc(100dvh - var(--app-bar-height));
}
</style>
