import { createContext } from 'react'

export const TrackingContext = createContext({
  ready: () => {},
  track: () => {}
})
