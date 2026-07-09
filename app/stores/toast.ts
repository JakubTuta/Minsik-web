import { defineStore } from 'pinia'

export interface ToastMessage {
  id: number
  text: string
  color: 'error' | 'success' | 'info' | 'warning'
  timeout: number
}

let nextId = 0

export const useToastStore = defineStore('toast', () => {
  const messages = ref<ToastMessage[]>([])

  const show = (text: string, color: ToastMessage['color'] = 'info', timeout = 5000) => {
    const id = nextId++
    messages.value.push({ id, text, color, timeout })

    return id
  }

  const error = (text: string) => show(text, 'error', 6000)
  const success = (text: string) => show(text, 'success', 4000)

  const dismiss = (id: number) => {
    const idx = messages.value.findIndex(m => m.id === id)
    if (idx !== -1)
      messages.value.splice(idx, 1)
  }

  return {
    messages,
    show,
    error,
    success,
    dismiss,
  }
})
