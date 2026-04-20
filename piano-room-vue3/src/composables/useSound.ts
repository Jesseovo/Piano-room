import { ref, readonly } from 'vue'

const isMuted = ref(true)
const isInitialized = ref(true)
const masterVolume = ref(0)

function initAudioContext(): null {
  return null
}

function toggleMute(): boolean {
  isMuted.value = true
  return true
}

function setMasterVolume(volume: number): void {
  masterVolume.value = Math.max(0, Math.min(1, volume))
}

function noop(): void {
  // School deployment removes all sound effects and audio controls.
}

export function playHoverSound(): void { noop() }
export function playClickSound(): void { noop() }
export function playConfirmSound(): void { noop() }
export function playErrorSound(): void { noop() }
export function playTransitionSound(): void { noop() }
export function playFocusSound(): void { noop() }
export function startAmbientSound(): void { noop() }
export function stopAmbientSound(): void { noop() }

export function useSound() {
  return {
    isMuted: readonly(isMuted),
    isInitialized: readonly(isInitialized),
    masterVolume: readonly(masterVolume),
    init: initAudioContext,
    toggleMute,
    setMasterVolume,
    startAmbient: startAmbientSound,
    stopAmbient: stopAmbientSound,
    hover: playHoverSound,
    click: playClickSound,
    confirm: playConfirmSound,
    error: playErrorSound,
    transition: playTransitionSound,
    focus: playFocusSound,
  }
}

export default useSound
