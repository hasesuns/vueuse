import type { MaybeRef } from '@vueuse/shared'
import { clamp } from '@vueuse/shared'
import { computed, ref, unref } from 'vue-demi'
import type { MaybeElementRef } from '../unrefElement'
import { unrefElement } from '../unrefElement'
import { useEventListener } from '../useEventListener'
import type { ConfigurableWindow } from '../_configurable'
import { defaultWindow } from '../_configurable'

export interface PinchScaleOptions extends ConfigurableWindow {
  /**
   * Prevent events defaults on pinch gesture
   *
   * @default true
   */
  preventDefault?: MaybeRef<boolean>

  /**
   * Element target to be capture the pinch start
   *
   * @default window
   */
  target?: MaybeElementRef
}

const getTouchDistance = (event: TouchEvent): number => {
  return Math.sqrt(
    Math.pow(event.touches[0].pageX - event.touches[1].pageX, 2)
      + Math.pow(event.touches[0].pageY - event.touches[1].pageY, 2),
  )
}

/**
 * Pinch Scale detection.
 *
 * @see https://vueuse.org/usePinchScale
 * @param options
 */
export function usePinchScale(options: PinchScaleOptions) {
  const {
    preventDefault = true,
    window = defaultWindow,
  } = options

  const scale = ref(1)

  if (!window)
    return { scale }
  const target = computed(() => unrefElement(options.target) || window)

  const startTouchDistance = ref(1)
  const currentTouchDistance = ref(1)
  const startTouchScale = ref(1)
  const isTouchPinching = ref(false)
  const onTouchStart = (event: TouchEvent) => {
    if (event.touches.length >= 2) {
      if (unref(preventDefault))
        event.preventDefault()
      isTouchPinching.value = true
      startTouchDistance.value = getTouchDistance(event)
      currentTouchDistance.value = startTouchDistance.value
      startTouchScale.value = scale.value
    }
  }
  const onTouchMove = (event: TouchEvent) => {
    if (isTouchPinching.value) {
      if (unref(preventDefault))
        event.preventDefault()
      currentTouchDistance.value = getTouchDistance(event)
      const proportion = currentTouchDistance.value / startTouchDistance.value
      scale.value = startTouchScale.value * proportion
    }
  }
  const onTouchEnd = (_event: TouchEvent) => {
    if (isTouchPinching.value)
      isTouchPinching.value = false
  }

  const MIN_FACTOR = 0.125
  const MAX_FACTOR = 4
  const onTrackpadPinch = (event: WheelEvent) => {
    // Event ctrlKey detects if touchpad action is executing scroll gesture or pinch gesture
    if (event.ctrlKey) {
      if (unref(preventDefault))
        event.preventDefault()
      let factor = event.deltaY <= 0
        ? 1 - event.deltaY / 100
        : 1 / (1 + event.deltaY / 100)
      factor = clamp(factor, MIN_FACTOR, MAX_FACTOR)
      scale.value *= factor
    }
  }

  if (target) {
    // For touch device
    useEventListener(target, 'touchstart', onTouchStart, { passive: !unref(preventDefault) })
    useEventListener(window, 'touchmove', onTouchMove, { passive: !unref(preventDefault) })
    useEventListener(window, 'touchend', onTouchEnd, { passive: !unref(preventDefault) })
    // For trackpad device
    useEventListener(target, 'wheel', onTrackpadPinch, { passive: !unref(preventDefault) })
  }
  return { scale }
}

