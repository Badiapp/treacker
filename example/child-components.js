import React, { useEffect, useState } from 'react'

import { useTracking } from '../dist/bundle-esm'

const ChildComponent = () => {
  const tracking = useTracking()
  const [total, setTotal] = useState(0)

  useEffect(() => {
    tracking.track('component.onload')
  }, [])

  const handleSum = () => {
    const newTotal = total + 1
    setTotal(newTotal)
    tracking.track('click.plus', { total: newTotal })
  }

  const handleRest = () => {
    const newTotal = total - 1
    setTotal(newTotal)
    tracking.track('click.minus', { total: newTotal })
  }
  return (
    <div>
      <button onClick={handleSum}>Add 1</button>
      <button onClick={handleRest}>Rest 1</button>
      <p>Total: {total}</p>
    </div>
  )
}

export default ChildComponent
