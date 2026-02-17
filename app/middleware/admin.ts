export default defineNuxtRouteMiddleware(async (_to, _from) => {
  if (import.meta.server)
    return

  const authStore = useAuthStore()

  if (!authStore.authInitialized) {
    await authStore.autoLogin()
  }

  if (!authStore.isAuthenticated) {
    return navigateTo('/')
  }

  if (authStore.user?.role !== 'admin') {
    return navigateTo('/')
  }
})
