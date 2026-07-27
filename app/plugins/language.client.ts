/**
 * Keeps the interface language in step with the signed-in account. Watching the
 * user rather than calling this from each auth entry point covers autoLogin,
 * email login, registration and the Google callback in one place.
 */
export default defineNuxtPlugin(() => {
  const authStore = useAuthStore()
  const { syncOnLogin } = useUserLanguage()

  watch(
    () => authStore.user?.preferred_language,
    (preferred) => {
      if (preferred)
        syncOnLogin()
    },
    { immediate: true },
  )
})
