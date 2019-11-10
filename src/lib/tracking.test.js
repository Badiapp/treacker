import { advanceTo } from 'jest-date-mock'
import { trackingManager } from './tracking'

const INITIAL_PARAMS = {
  environment: 'test',
  version: 1
}

advanceTo(1598565600000)

describe('trackingManager', () => {
  const onTrack = jest.fn()
  const tracker = trackingManager({ initialParams: INITIAL_PARAMS, onTrackingEvent: onTrack })

  it('should return the initial tracker params', () => {
    expect(tracker.getParams()).toMatchObject(INITIAL_PARAMS)
  })

  it('should track the events correctly but not dispatch it', () => {
    tracker.track('first')
    expect(onTrack).not.toBeCalled()
  })

  it('should dispatch the events correctly', () => {
    tracker.track('second', { user_id: 5 })
    tracker.ready()

    expect(onTrack).toBeCalledTimes(2)
    expect(onTrack).toHaveBeenNthCalledWith(1, expect.objectContaining({ eventName: 'first', params: INITIAL_PARAMS }))
    expect(onTrack).toHaveBeenNthCalledWith(2, expect.objectContaining({ eventName: 'second', params: { user_id: 5, ...INITIAL_PARAMS } }))
  })

  it('should dispatch the event inmediately', () => {
    tracker.track('third')

    expect(onTrack).lastCalledWith({ eventName: 'third', params: INITIAL_PARAMS, id: '__default', timestamp: 1598565600000 })
  })
})

describe('trackingManager ready', () => {
  const tracker = trackingManager({ id: 'ready', initialParams: INITIAL_PARAMS, onTrackingEvent: jest.fn() })

  it('should get the correct params', () => {
    tracker.ready({ user_id: 3 })

    expect(tracker.getParams()).toMatchObject({
      ...INITIAL_PARAMS,
      user_id: 3
    })
  })
})

describe('trackingManager event listener', () => {
  const onTrack = jest.fn()
  const onTrackingEvent2 = jest.fn()
  const tracker = trackingManager({ id: 'test', initialParams: INITIAL_PARAMS, onTrackingEvent: onTrack, ready: true })

  it('should register extra callbacks', () => {
    tracker.track('first')

    expect(onTrack).toBeCalled()
    expect(onTrackingEvent2).not.toBeCalled()

    tracker.registerListener(onTrackingEvent2)

    tracker.track('another-event')

    expect(onTrack).toBeCalledTimes(2)
    expect(onTrackingEvent2).toBeCalled()
  })
})
