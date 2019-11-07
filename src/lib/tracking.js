import { DEFAULT_PROVIDER_NAME, STATUS, EVENT_TYPES } from './constants'
import { createEventName, trackWithEvent, registerEventListener } from './browser-helpers'

const registeredTrackingProviders = new Set()

export const registerTrackingListener = ({
  eventListener,
  id = DEFAULT_PROVIDER_NAME
}) => {
  const eventName = createEventName(id)
  registerEventListener({ eventName, eventListener })
}

export const trackingManager = ({
  id: instanceId = DEFAULT_PROVIDER_NAME,
  onTrackingEvent = () => {},
  initialParams = {}
}) => {
  let queue = []
  let memoizedParams = initialParams
  let status = STATUS.INITIAL

  function registerInstance (id) {
    registeredTrackingProviders.add(id, this)
  }

  function instanceExists (id) {
    return registeredTrackingProviders.has(id)
  }

  function init () {
    if (instanceExists(instanceId)) return

    registerInstance(instanceId)

    if (typeof window === 'undefined') _queueEvent({ type: EVENT_TYPES.INIT })
    _init()
  }

  function _init () {
    registerListener({
      eventListener: onTrackingEvent,
      id: instanceId
    })
    status = STATUS.INITIALIZED
  }

  function _flushQueue () {
    queue.forEach(event => {
      const { eventName, params } = event.payload
      switch (event.type) {
        case EVENT_TYPES.INIT:
          _init()
          break
        case EVENT_TYPES.TRACK:
        default:
          _track(eventName, params)
          break
      }
    })

    // clears the queue
    queue = []
  }

  function _track (eventName, eventParams) {
    const params = {
      ...memoizedParams,
      ...eventParams
    }

    trackWithEvent({ eventName, params, id: instanceId })
  }

  function _queueEvent ({ payload = {}, type = EVENT_TYPES.TRACK }) {
    if (type === EVENT_TYPES.INIT) {
      return queue.unshift({ type, payload })
    }

    queue.push({
      type,
      payload
    })
  }

  function ready (extraParams) {
    if (status === STATUS.READY) return

    memoizedParams = extraParams
    _flushQueue()

    status = STATUS.READY
  }

  function track (eventName, params) {
    const payload = {
      eventName,
      params
    }

    if (status === STATUS.READY) {
      _track(eventName, params)
      return
    }

    _queueEvent({ payload }, EVENT_TYPES.TRACK)
  }

  function replaceParams (params) {
    memoizedParams = {
      ...memoizedParams,
      ...params
    }
  }

  function getParams () {
    return memoizedParams
  }

  function registerListener (listener) {
    return registerTrackingListener({
      eventListener: listener,
      id: instanceId
    })
  }

  init()

  return {
    ready,
    track,
    replaceParams,
    getParams,
    registerListener
  }
}
