export default defineNuxtRouteMiddleware(async (_to, _from) => {
  if (import.meta.server)
    return

  const authStore = useAuthStore()
  const localePath = useLocalePath()

  if (!authStore.authInitialized) {
    await authStore.autoLogin()
  }

  if (!authStore.isAuthenticated) {
    return navigateTo(localePath('index'))
  }

  if (authStore.user?.role !== 'admin') {
    return navigateTo(localePath('index'))
  }
})
