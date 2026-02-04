<script setup lang="ts">
const router = useRouter()

function goHome() {
  router.push('/')
}
</script>

<template>
  <v-app-bar
    elevation="3"
    color="primary"
  >
    <v-app-bar-title
      class="logo-container"
      @click="goHome"
    >
      <div class="logo-wrapper">
        <v-icon
          icon="mdi-snowflake"
          size="x-large"
          class="logo-icon"
        />

        <span class="logo-text">Minsik</span>
      </div>
    </v-app-bar-title>

    <v-spacer />

    <div class="flex-1-1 mx-4 max-w-600px">
      <SearchBar variant="appbar" />
    </div>

    <v-spacer />

    <ThemeToggle />

    <UserMenu />
  </v-app-bar>
</template>

<style scoped>
.logo-container {
  cursor: pointer;
  display: inline-block;
}

.logo-wrapper {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  padding: 4px 8px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}

.logo-icon {
  color: white;
  filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.4));
  animation: snowflakeRotate 30s linear infinite, iconPulse 2s ease-in-out infinite;
  transition: all 0.3s ease;
  position: relative;
  z-index: 1;
}

@keyframes snowflakeRotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes iconPulse {
  0%, 100% {
    filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.4));
  }
  50% {
    filter: drop-shadow(0 0 15px rgba(255, 255, 255, 0.6));
  }
}

.logo-text {
  font-size: 1.5rem;
  font-weight: 800;
  letter-spacing: 0.5px;
  background: linear-gradient(135deg, #ffffff 0%, #f0f0f0 50%, #ffffff 100%);
  background-size: 200% 200%;
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 2px 10px rgba(255, 255, 255, 0.3);
  animation: gradientShift 3s ease infinite;
  position: relative;
  z-index: 1;
}

@keyframes gradientShift {
  0%, 100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}

.logo-wrapper:hover {
  transform: scale(1.05);
}

.logo-wrapper:hover .logo-icon {
  filter: drop-shadow(0 0 20px rgba(255, 255, 255, 0.8));
  animation: snowflakeRotate 20s linear infinite, iconPulse 1s ease-in-out infinite;
}

.logo-wrapper:active {
  transform: scale(0.98);
  transition: transform 0.1s ease;
}
</style>
