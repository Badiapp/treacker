import React, { useContext, createContext, useEffect, useMemo } from "react";
import { trackingManager } from "./tracking";

export const TrackingContext = createContext({
  ready: () => {},
  track: () => {}
});

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
  );

  useEffect(() => {
    if (!isReady) return;

    tracking.ready(params);
  }, [params, isReady]);

  return (
    <TrackingContext.Provider value={tracking}>
      {children}
    </TrackingContext.Provider>
  );
};

export const withTracking = ({ id, isReady = true, onTrackingEvent }) => Component => props => {
  const { ready: componentReady, ...rest } = props;
  return (
    <TrackingProvider id={id} isReady={isReady || componentReady} onTrackingEvent={onTrackingEvent}>
      <Component {...rest} />
    </TrackingProvider>
  );
};

export const useTracking = () => {
  return useContext(TrackingContext);
};
