import React, { useEffect, useMemo } from 'react'
import PropTypes from 'prop-types'

import { trackingManager } from './tracking'
import { TrackingContext } from './context'

export const TrackingProvider = ({
  id,
  children,
  params,
  onTrackingEvent,
  isReady = false
}) => {
  const tracking = useMemo(
    () => trackingManager({ id, onTrackingEvent, initialParams: params }),
    []
  )

  useEffect(() => {
    if (!isReady) return

    tracking.ready(params)
  }, [params, isReady])

  return (
    <TrackingContext.Provider value={tracking}>
      {children}
    </TrackingContext.Provider>
  )
}

TrackingProvider.propTypes = {
  id: PropTypes.string,
  children: PropTypes.node,
  params: PropTypes.object,
  onTrackingEvent: PropTypes.func,
  isReady: PropTypes.bool
}
