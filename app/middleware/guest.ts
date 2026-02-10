export default defineNuxtRouteMiddleware(async (_to, _from) => {
  // Auth uses localStorage — skip on server, handle client-side only
  if (import.meta.server)
    return

  const authStore = useAuthStore()

  if (!authStore.authInitialized) {
    await authStore.autoLogin()
  }

  if (authStore.isAuthenticated) {
    return navigateTo('/panel')
  }
})
