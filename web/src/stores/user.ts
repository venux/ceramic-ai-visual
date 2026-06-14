import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getMe } from '@/api/modules/users'
import type { UserInfo } from '@/api/modules/users'

export const useUserStore = defineStore('user', () => {
  const user = ref<UserInfo | null>(null)
  const isLoggedIn = computed(() => !!localStorage.getItem('token'))
  const credits = computed(() => user.value?.credits ?? 0)
  const plan = computed(() => user.value?.plan ?? 'free')

  async function fetchUser() {
    if (!isLoggedIn.value) return
    try {
      user.value = await getMe()
    } catch {
      localStorage.removeItem('token')
      user.value = null
    }
  }

  function logout() {
    localStorage.removeItem('token')
    user.value = null
  }

  return { user, isLoggedIn, credits, plan, fetchUser, logout }
})
