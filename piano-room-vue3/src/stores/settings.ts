import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface BasicSettings {
  systemName: string
  systemLogo: string
  contactEmail: string
  contactPhone: string
  announcement: string
  /** 时段开始小时（默认8） */
  slotStartHour: number
  /** 时段结束小时（默认22） */
  slotEndHour: number
  /** 每段时长（分钟，默认120） */
  slotDurationMinutes: number
  /** 每日几点开放次日预约（0-23，默认0） */
  bookingResetHour: number
}

export const useSettingsStore = defineStore('settings', () => {
  const basicSettings = ref<BasicSettings | null>(
    localStorage.getItem('basicSettings')
      ? JSON.parse(localStorage.getItem('basicSettings')!)
      : null
  )

  function setBasicSettings(settings: BasicSettings) {
    basicSettings.value = settings
    localStorage.setItem('basicSettings', JSON.stringify(settings))
  }

  return { basicSettings, setBasicSettings }
})
