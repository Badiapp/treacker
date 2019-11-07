import { DEFAULT_PROVIDER_NAME, TRACKING_BASE_NAME } from './constants'

export const createEventName = (name = DEFAULT_PROVIDER_NAME) => {
  return `${TRACKING_BASE_NAME}:${name}`
}

export const trackWithEvent = ({ eventName, params, id }) => {
  const eventSpaceName = createEventName(id)
  const trackingEvent = new CustomEvent(eventSpaceName, {
    detail: {
      eventName,
      params
    }
  })

  window.dispatchEvent(trackingEvent)
}

export const handleTrackEvent = onTrackingEvent => event => {
  const { eventName, params } = event.detail

  onTrackingEvent({ eventName, params })
}

export const registerEventListener = ({ eventName, eventListener }) => {
  window.addEventListener(eventName, handleTrackEvent(eventListener))
}
