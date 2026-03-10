import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface UserInfo {
  id: number
  username: string
  realName: string
  studentId: string
  email: string
  phone: string
  userType: 'student' | 'teacher' | 'admin' | 'super_admin'
  avatarUrl: string
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string>(localStorage.getItem('token') || '')
  const user = ref<UserInfo | null>(
    localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null
  )

  const isLoggedIn = computed(() => !!token.value)
  const isAdmin = computed(() =>
    user.value?.userType === 'admin' || user.value?.userType === 'super_admin'
  )
  const isSuperAdmin = computed(() => user.value?.userType === 'super_admin')

  function login(authToken: string, userInfo: UserInfo) {
    token.value = authToken
    user.value = userInfo
    localStorage.setItem('token', authToken)
    localStorage.setItem('user', JSON.stringify(userInfo))
  }

  function updateUser(userInfo: UserInfo) {
    user.value = userInfo
    localStorage.setItem('user', JSON.stringify(userInfo))
  }

  function logout() {
    token.value = ''
    user.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  return { token, user, isLoggedIn, isAdmin, isSuperAdmin, login, updateUser, logout }
})
