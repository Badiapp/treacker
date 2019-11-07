import React from 'react'
import { TrackingProvider } from './provider-consumer'

export const withTracking = ({ id, isReady = true, onTrackingEvent }) => Component => props => {
  const { ready: componentReady, ...rest } = props
  return (
    <TrackingProvider id={id} isReady={isReady || componentReady} onTrackingEvent={onTrackingEvent}>
      <Component {...rest} />
    </TrackingProvider>
  )
}
