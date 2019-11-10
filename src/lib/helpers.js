import { DEFAULT_PROVIDER_NAME, TRACKING_BASE_NAME } from './constants'

const handleTrackEvent = onTrackingEvent => event => {
  const { eventName, params } = event.detail

  onTrackingEvent({ eventName, params })
}

export const createEventName = (name = DEFAULT_PROVIDER_NAME) => {
  return `${TRACKING_BASE_NAME}:${name}`
}

export const trackWithEvent = ({ eventName, params, id = DEFAULT_PROVIDER_NAME }) => {
  const timestamp = Date.now()
  const eventSpaceName = createEventName(id)
  const trackingEvent = new CustomEvent(eventSpaceName, {
    detail: {
      eventName,
      params,
      timestamp
    }
  })

  window.dispatchEvent(trackingEvent)
}

export const registerTrackingListener = ({
  eventListener,
  id = DEFAULT_PROVIDER_NAME
}) => {
  const eventName = createEventName(id)
  window.addEventListener(eventName, handleTrackEvent(eventListener))
}
