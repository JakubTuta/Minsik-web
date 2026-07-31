export default defineNuxtPlugin({
  name: 'auth',
  parallel: true,
  setup() {
    const authStore = useAuthStore()
    authStore.autoLogin()
  },
})
