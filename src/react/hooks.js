import { useContext } from 'react'
import { TrackingContext } from './context'

export const useTracking = () => {
  return useContext(TrackingContext)
}
