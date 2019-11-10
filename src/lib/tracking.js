import { DEFAULT_PROVIDER_NAME, STATUS, EVENT_TYPES } from './constants'
import { trackWithEvent, registerTrackingListener } from './helpers'

const registeredTrackingProviders = new Set()

export const trackingManager = ({
  id: instanceId = DEFAULT_PROVIDER_NAME,
  onTrackingEvent = () => {},
  initialParams = {},
  ready: isReady = false
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

    if (typeof window === 'undefined') {
      _queueEvent({ type: EVENT_TYPES.INIT })
      return
    }

    _init()
  }

  function _init () {
    registerListener(onTrackingEvent)
    status = isReady ? STATUS.READY : STATUS.INITIALIZED
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
          _track(eventName, params, event.timestamp)
          break
      }
    })

    // clears the queue
    queue = []
  }

  function _track (eventName, eventParams, timestamp = Date.now()) {
    const params = {
      ...memoizedParams,
      ...eventParams
    }

    trackWithEvent({ eventName, params, id: instanceId, timestamp })
  }

  function _queueEvent ({ payload = {}, type = EVENT_TYPES.TRACK }) {
    const timestamp = Date.now()

    const eventPayload = {
      type,
      payload,
      timestamp
    }

    if (type === EVENT_TYPES.INIT) {
      return queue.unshift(eventPayload)
    }

    queue.push(eventPayload)
  }

  function ready (extraParams) {
    if (status === STATUS.READY) return

    memoizedParams = {
      ...memoizedParams,
      ...extraParams
    }
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
    memoizedParams = params
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
