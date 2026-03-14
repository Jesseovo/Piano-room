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

export interface ReservationSettings {
  /** 最长提前预约天数（默认7天） */
  maxAdvanceDays: number
  /** 签到宽限时间（分钟，默认10分钟） */
  signInGrace: number
  /** 最大爽约次数（默认3次） */
  maxNoShow: number
}

export interface PenaltyRule {
  id: number
  violationCount: number
  banDays: number
  description: string
}

export const useSettingsStore = defineStore('settings', () => {
  const basicSettings = ref<BasicSettings | null>(
    localStorage.getItem('basicSettings')
      ? JSON.parse(localStorage.getItem('basicSettings')!)
      : null
  )

  const reservationSettings = ref<ReservationSettings | null>(
    localStorage.getItem('reservationSettings')
      ? JSON.parse(localStorage.getItem('reservationSettings')!)
      : null
  )

  const penaltyRules = ref<PenaltyRule[]>(
    localStorage.getItem('penaltyRules')
      ? JSON.parse(localStorage.getItem('penaltyRules')!)
      : []
  )

  function setBasicSettings(settings: BasicSettings) {
    basicSettings.value = settings
    localStorage.setItem('basicSettings', JSON.stringify(settings))
  }

  function setReservationSettings(settings: ReservationSettings) {
    reservationSettings.value = settings
    localStorage.setItem('reservationSettings', JSON.stringify(settings))
  }

  function setPenaltyRules(rules: PenaltyRule[]) {
    penaltyRules.value = rules
    localStorage.setItem('penaltyRules', JSON.stringify(rules))
  }

  return {
    basicSettings,
    setBasicSettings,
    reservationSettings,
    setReservationSettings,
    penaltyRules,
    setPenaltyRules,
  }
})
