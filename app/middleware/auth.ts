export default defineNuxtRouteMiddleware(async (_to, _from) => {
  // Auth lives in httpOnly cookies, invisible to SSR — resolve client-side only
  if (import.meta.server)
    return

  const authStore = useAuthStore()

  if (!authStore.authInitialized) {
    await authStore.autoLogin()
  }

  if (!authStore.isAuthenticated) {
    const authDialogStore = useAuthDialogStore()
    authDialogStore.openLogin(_to.fullPath)

    return false
  }
})
