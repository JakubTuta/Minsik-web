import { defineStore } from 'pinia'

export const useAuthDialogStore = defineStore('authDialog', () => {
  const show = ref(false)
  const mode = ref<'login' | 'register'>('login')
  const redirectTo = ref<string | null>(null)

  const openLogin = (redirect?: string) => {
    mode.value = 'login'
    redirectTo.value = redirect ?? null
    show.value = true
  }

  const openRegister = () => {
    mode.value = 'register'
    redirectTo.value = null
    show.value = true
  }

  const close = () => {
    show.value = false
  }

  const switchMode = () => {
    mode.value = mode.value === 'login' ? 'register' : 'login'
  }

  return { show, mode, redirectTo, openLogin, openRegister, close, switchMode }
})
