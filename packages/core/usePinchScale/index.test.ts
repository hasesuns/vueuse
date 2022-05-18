import type { PinchScaleOptions } from '.'
import { usePinchScale } from '.'

describe('usePinchScale', () => {
  const pinchTarget = document.createElement('target')
  pinchTarget.id = 'target'
  document.body.appendChild(pinchTarget)

  interface PinchPosition {
    firstFinger: { x: number; y: number; identifier: number }
    secondFinger: { x: number; y: number; identifier: number }
  }

  const mockTouchPinchEventInit = (positions: PinchPosition, pinchStartTarget?: EventTarget): TouchEventInit => ({
    touches: [{
      clientX: positions.firstFinger.x,
      clientY: positions.firstFinger.y,
      force: 0,
      identifier: positions.firstFinger.identifier,
      pageX: positions.firstFinger.x,
      pageY: positions.firstFinger.y,
      radiusX: 0,
      radiusY: 0,
      rotationAngle: 0,
      screenX: positions.firstFinger.x,
      screenY: positions.firstFinger.y,
      target: pinchStartTarget ?? window,
    },
    {
      clientX: positions.secondFinger.x,
      clientY: positions.secondFinger.y,
      force: 0,
      identifier: positions.secondFinger.identifier,
      pageX: positions.secondFinger.x,
      pageY: positions.secondFinger.y,
      radiusX: 0,
      radiusY: 0,
      rotationAngle: 0,
      screenX: positions.secondFinger.x,
      screenY: positions.secondFinger.y,
      target: pinchStartTarget ?? window,
    }],
  })
  const mockTouchPinchStart = (pinchPosition: PinchPosition) =>
    new TouchEvent('touchstart', mockTouchPinchEventInit(pinchPosition, pinchTarget))
  const mockTouchPinchMove = (pinchPosition: PinchPosition) =>
    new TouchEvent('touchmove', mockTouchPinchEventInit(pinchPosition))
  const mockTouchPinchEnd = (pinchPosition: PinchPosition) =>
    new TouchEvent('touchend', mockTouchPinchEventInit(pinchPosition))

  const mockTouchPinchEvents = (target: EventTarget, positions: Array<PinchPosition>) => {
    positions.forEach((pinchPosition, i) => {
      if (i === 0)
        target.dispatchEvent(mockTouchPinchStart(pinchPosition))
      else if (i === positions.length - 1)
        window.dispatchEvent(mockTouchPinchEnd(pinchPosition))
      else
        window.dispatchEvent(mockTouchPinchMove(pinchPosition))
    })
  }

  const mockTrackpadPinchEventInit = (delta: number): WheelEvent => {
    return new WheelEvent('wheel', {
      deltaX: 0,
      deltaY: delta,
      deltaZ: 0,
      deltaMode: WheelEvent.DOM_DELTA_PIXEL,
      ctrlKey: true,
    })
  }
  const mockTrackpadPinchEvent = (target: EventTarget, delta: number) => {
    target.dispatchEvent(mockTrackpadPinchEventInit(delta))
  }

  let onTouchStartCallback: any
  let onTouchMoveCallback: any
  let onTouchEndCallback: any
  let onTrackpadPinchCallback: any

  const options = (): PinchScaleOptions => ({
    target: pinchTarget,
    onTouchStartCallback,
    onTouchMoveCallback,
    onTouchEndCallback,
    onTrackpadPinchCallback,
  })

  beforeEach(() => {
    onTouchStartCallback = vitest.fn((_e: TouchEvent) => { })
    onTouchMoveCallback = vitest.fn((_e: TouchEvent) => { })
    onTouchEndCallback = vitest.fn((_e: TouchEvent) => { })
    onTrackpadPinchCallback = vitest.fn((_e: WheelEvent) => { })
    vitest.resetAllMocks()
  })

  const startPinchPosition: PinchPosition = {
    firstFinger: {
      x: 3,
      y: 0,
      identifier: 0,
    },
    secondFinger: {
      x: 6,
      y: 0,
      identifier: 1,
    },
  }
  const smallPinchPosition: PinchPosition = {
    firstFinger: {
      x: 4,
      y: 0,
      identifier: 0,
    },
    secondFinger: {
      x: 5,
      y: 0,
      identifier: 1,
    },
  }
  const bigPinchPosition: PinchPosition = {
    firstFinger: {
      x: 2,
      y: 0,
      identifier: 0,
    },
    secondFinger: {
      x: 7,
      y: 0,
      identifier: 1,
    },
  }

  it('simple pinch out on touch device', () => {
    const { scale } = usePinchScale(options())

    const startScale = scale.value
    mockTouchPinchEvents(pinchTarget, [startPinchPosition, bigPinchPosition, bigPinchPosition])
    const endScale = scale.value

    expect(onTouchStartCallback).toHaveBeenCalledOnce()
    expect(onTouchMoveCallback).toHaveBeenCalledOnce()
    expect(onTouchEndCallback).toHaveBeenCalledOnce()
    expect(endScale).toBeGreaterThan(startScale)
  })

  it('simple pinch in on touch device', () => {
    const { scale } = usePinchScale(options())

    const startScale = scale.value
    mockTouchPinchEvents(pinchTarget, [startPinchPosition, smallPinchPosition, smallPinchPosition])
    const endScale = scale.value

    expect(onTouchStartCallback).toHaveBeenCalledOnce()
    expect(onTouchMoveCallback).toHaveBeenCalledOnce()
    expect(onTouchEndCallback).toHaveBeenCalledOnce()
    expect(endScale).toBeLessThan(startScale)
  })

  it('simple pinch in and out on touch device', () => {
    const { scale } = usePinchScale(options())

    const startScale = scale.value
    mockTouchPinchEvents(pinchTarget, [startPinchPosition, smallPinchPosition, startPinchPosition, startPinchPosition])
    const endScale = scale.value

    expect(onTouchStartCallback).toHaveBeenCalledOnce()
    expect(onTouchMoveCallback).toHaveBeenCalledOnce
    expect(onTouchEndCallback).toHaveBeenCalledOnce()
    expect(endScale).toBe(startScale)
  })

  it('simple pinch out on trackpad device', () => {
    const { scale } = usePinchScale(options())

    const startScale = scale.value
    mockTrackpadPinchEvent(pinchTarget, -10)
    const endScale = scale.value

    expect(onTrackpadPinchCallback).toHaveBeenCalledOnce()
    expect(endScale).toBeGreaterThan(startScale)
  })

  it('simple pinch in on trackpad device', () => {
    const { scale } = usePinchScale(options())

    const startScale = scale.value
    mockTrackpadPinchEvent(pinchTarget, 10)
    const endScale = scale.value

    expect(onTrackpadPinchCallback).toHaveBeenCalledOnce()
    expect(endScale).toBeLessThan(startScale)
  })

  it('simple pinch in and out on trackpad device', () => {
    const { scale } = usePinchScale(options())

    const startScale = scale.value
    mockTrackpadPinchEvent(pinchTarget, 10)
    mockTrackpadPinchEvent(pinchTarget, -10)
    const endScale = scale.value

    expect(onTrackpadPinchCallback).toHaveBeenCalledTimes(2)
    expect(endScale).toBe(startScale)
  })
})
