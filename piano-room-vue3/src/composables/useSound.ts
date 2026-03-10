/**
 * Y2K 风格音效系统 - useSound Composable
 * 使用 Web Audio API 生成 8-bit 合成音效，无需外部文件
 */

import { ref, readonly } from 'vue'

// ===== 音频上下文管理 =====
let audioContext: AudioContext | null = null
const isMuted = ref(false)
const isInitialized = ref(false)
const masterVolume = ref(0.3)

// 音效开关（用于防止音频上下文未初始化时的播放）
const pendingSounds: Array<() => void> = []

/**
 * 初始化音频上下文
 * 必须在用户首次交互后调用（浏览器自动播放策略）
 */
export function initAudioContext(): AudioContext {
  if (!audioContext) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
    audioContext = new AudioContextClass()
  }

  if (audioContext.state === 'suspended') {
    audioContext.resume()
  }

  isInitialized.value = true

  // 播放待处理的音效
  while (pendingSounds.length > 0) {
    const playSound = pendingSounds.shift()
    playSound?.()
  }

  return audioContext
}

/**
 * 获取或创建音频上下文
 */
function getAudioContext(): AudioContext | null {
  if (!isInitialized.value) {
    return null
  }
  return audioContext
}

/**
 * 确保音频上下文已初始化
 * 如果未初始化，将音效加入队列等待
 */
function ensureContext(callback: () => void): void {
  if (!isInitialized.value || !audioContext) {
    pendingSounds.push(callback)
    return
  }
  callback()
}

// ===== 音效生成器 =====

/**
 * 创建振荡器节点
 */
function createOscillator(
  type: OscillatorType,
  frequency: number,
  duration: number,
  startTime: number
): OscillatorNode {
  const ctx = getAudioContext()!
  const osc = ctx.createOscillator()
  osc.type = type
  osc.frequency.setValueAtTime(frequency, startTime)
  osc.frequency.exponentialRampToValueAtTime(frequency * 0.01, startTime + duration)
  return osc
}

/**
 * 创建增益节点（音量包络）
 */
function createGainNode(
  volume: number,
  attack: number,
  decay: number,
  startTime: number
): GainNode {
  const ctx = getAudioContext()!
  const gain = ctx.createGain()
  gain.gain.setValueAtTime(0, startTime)
  gain.gain.linearRampToValueAtTime(volume, startTime + attack)
  gain.gain.exponentialRampToValueAtTime(0.001, startTime + attack + decay)
  return gain
}

/**
 * 创建噪声缓冲（用于点击音效）
 */
function createNoiseBuffer(): AudioBuffer {
  const ctx = getAudioContext()!
  const bufferSize = ctx.sampleRate * 0.1 // 100ms buffer
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
  const data = buffer.getChannelData(0)

  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1
  }

  return buffer
}

// ===== 具体音效实现 =====

/**
 * 悬停音效：8-bit 短促上升音
 * 80ms, 400Hz → 600Hz, square wave
 */
export function playHoverSound(): void {
  if (isMuted.value) return

  ensureContext(() => {
    const ctx = getAudioContext()!
    const now = ctx.currentTime
    const duration = 0.08

    const osc = ctx.createOscillator()
    osc.type = 'square'
    osc.frequency.setValueAtTime(400, now)
    osc.frequency.linearRampToValueAtTime(600, now + duration)

    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0, now)
    gain.gain.linearRampToValueAtTime(masterVolume.value * 0.4, now + 0.01)
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start(now)
    osc.stop(now + duration)
  })
}

/**
 * 点击音效：清脆的"咔哒"声
 * 50ms, noise burst + 600Hz sine decay
 */
export function playClickSound(): void {
  if (isMuted.value) return

  ensureContext(() => {
    const ctx = getAudioContext()!
    const now = ctx.currentTime

    // 噪声部分（短促 burst）
    const noise = ctx.createBufferSource()
    noise.buffer = createNoiseBuffer()

    const noiseFilter = ctx.createBiquadFilter()
    noiseFilter.type = 'highpass'
    noiseFilter.frequency.value = 1000

    const noiseGain = ctx.createGain()
    noiseGain.gain.setValueAtTime(masterVolume.value * 0.5, now)
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.03)

    noise.connect(noiseFilter)
    noiseFilter.connect(noiseGain)
    noiseGain.connect(ctx.destination)

    noise.start(now)
    noise.stop(now + 0.05)

    // 正弦波部分（600Hz decay）
    const osc = ctx.createOscillator()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(600, now)

    const oscGain = ctx.createGain()
    oscGain.gain.setValueAtTime(masterVolume.value * 0.3, now)
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05)

    osc.connect(oscGain)
    oscGain.connect(ctx.destination)

    osc.start(now)
    osc.stop(now + 0.05)
  })
}

/**
 * 切换/确认音效：愉快的"叮"声
 * 120ms, 1.2kHz sine wave 带轻微颤音
 */
export function playConfirmSound(): void {
  if (isMuted.value) return

  ensureContext(() => {
    const ctx = getAudioContext()!
    const now = ctx.currentTime
    const duration = 0.12

    const osc = ctx.createOscillator()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(1200, now)

    // 添加轻微颤音
    const lfo = ctx.createOscillator()
    lfo.type = 'sine'
    lfo.frequency.value = 15 // 15Hz 颤音
    const lfoGain = ctx.createGain()
    lfoGain.gain.value = 20 // ±20Hz 频率偏移

    lfo.connect(lfoGain)
    lfoGain.connect(osc.frequency)

    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0, now)
    gain.gain.linearRampToValueAtTime(masterVolume.value * 0.5, now + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start(now)
    lfo.start(now)
    osc.stop(now + duration)
    lfo.stop(now + duration)
  })
}

/**
 * 错误/取消音效：低沉的"嘟"声
 * 150ms, 200Hz sawtooth 快速降频
 */
export function playErrorSound(): void {
  if (isMuted.value) return

  ensureContext(() => {
    const ctx = getAudioContext()!
    const now = ctx.currentTime
    const duration = 0.15

    const osc = ctx.createOscillator()
    osc.type = 'sawtooth'
    osc.frequency.setValueAtTime(200, now)
    osc.frequency.exponentialRampToValueAtTime(50, now + duration)

    // 低通滤波器柔化音色
    const filter = ctx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.setValueAtTime(400, now)
    filter.frequency.exponentialRampToValueAtTime(100, now + duration)

    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0, now)
    gain.gain.linearRampToValueAtTime(masterVolume.value * 0.4, now + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration)

    osc.connect(filter)
    filter.connect(gain)
    gain.connect(ctx.destination)

    osc.start(now)
    osc.stop(now + duration)
  })
}

/**
 * 页面切换音效：滑动的"嗖"声
 * 200ms, white noise 带高通滤波 + 音高下滑
 */
export function playTransitionSound(): void {
  if (isMuted.value) return

  ensureContext(() => {
    const ctx = getAudioContext()!
    const now = ctx.currentTime
    const duration = 0.2

    // 噪声源
    const noise = ctx.createBufferSource()
    noise.buffer = createNoiseBuffer()

    // 高通滤波器
    const filter = ctx.createBiquadFilter()
    filter.type = 'highpass'
    filter.frequency.setValueAtTime(2000, now)
    filter.frequency.exponentialRampToValueAtTime(200, now + duration)

    // Q值变化产生"嗖"的感觉
    filter.Q.setValueAtTime(1, now)
    filter.Q.linearRampToValueAtTime(10, now + duration * 0.5)
    filter.Q.linearRampToValueAtTime(1, now + duration)

    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0, now)
    gain.gain.linearRampToValueAtTime(masterVolume.value * 0.3, now + 0.05)
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration)

    noise.connect(filter)
    filter.connect(gain)
    gain.connect(ctx.destination)

    noise.start(now)
    noise.stop(now + duration)
  })
}

/**
 * 聚焦音效：微妙的确认音
 * 用于输入框聚焦等
 */
export function playFocusSound(): void {
  if (isMuted.value) return

  ensureContext(() => {
    const ctx = getAudioContext()!
    const now = ctx.currentTime

    const osc = ctx.createOscillator()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(800, now)

    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0, now)
    gain.gain.linearRampToValueAtTime(masterVolume.value * 0.15, now + 0.01)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start(now)
    osc.stop(now + 0.06)
  })
}

// ===== 背景氛围音（可选） =====

let bgmOscillator: OscillatorNode | null = null
let bgmGain: GainNode | null = null

/**
 * 启动 CRT 嗡嗡背景音
 * volume 0.05, loop，随时可静音
 */
export function startAmbientSound(): void {
  if (isMuted.value) return

  ensureContext(() => {
    const ctx = getAudioContext()!

    if (bgmOscillator) return // 已在播放

    // 创建两个低频振荡器模拟 CRT 嗡嗡声
    const osc1 = ctx.createOscillator()
    osc1.type = 'sawtooth'
    osc1.frequency.value = 50 // 50Hz 电网频率

    const osc2 = ctx.createOscillator()
    osc2.type = 'sine'
    osc2.frequency.value = 60 // 60Hz 拍频

    // 增益控制（极小声）
    bgmGain = ctx.createGain()
    bgmGain.gain.value = masterVolume.value * 0.05

    // 滤波器柔化
    const filter = ctx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.value = 150

    osc1.connect(filter)
    osc2.connect(filter)
    filter.connect(bgmGain)
    bgmGain.connect(ctx.destination)

    osc1.start()
    osc2.start()

    bgmOscillator = osc1
  })
}

/**
 * 停止背景氛围音
 */
export function stopAmbientSound(): void {
  if (bgmOscillator) {
    bgmOscillator.stop()
    bgmOscillator = null
  }
  bgmGain = null
}

// ===== 全局控制 =====

/**
 * 切换静音状态
 */
export function toggleMute(): boolean {
  isMuted.value = !isMuted.value

  if (isMuted.value && bgmGain) {
    bgmGain.gain.setValueAtTime(0, getAudioContext()!.currentTime)
  } else if (!isMuted.value && bgmGain) {
    bgmGain.gain.setValueAtTime(masterVolume.value * 0.05, getAudioContext()!.currentTime)
  }

  return isMuted.value
}

/**
 * 设置主音量
 */
export function setMasterVolume(volume: number): void {
  masterVolume.value = Math.max(0, Math.min(1, volume))
}

// ===== Composable 导出 =====

export function useSound() {
  return {
    // 状态
    isMuted: readonly(isMuted),
    isInitialized: readonly(isInitialized),
    masterVolume: readonly(masterVolume),

    // 控制方法
    init: initAudioContext,
    toggleMute,
    setMasterVolume,
    startAmbient: startAmbientSound,
    stopAmbient: stopAmbientSound,

    // 音效方法
    hover: playHoverSound,
    click: playClickSound,
    confirm: playConfirmSound,
    error: playErrorSound,
    transition: playTransitionSound,
    focus: playFocusSound,
  }
}

export default useSound
