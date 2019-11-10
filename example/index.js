import React, { useState } from 'react'
import ReactDOM from 'react-dom'

import { TrackingProvider } from '../dist/bundle-esm'
import ChildComponent from './child-components'

function App () {
  const [ready, isReady] = useState(false)
  const [events, addEvent] = useState([])
  const onTrackingEvent = (event) => {
    addEvent(state => ([
      event,
      ...state
    ]))
  }
  const params = {
    app_id: 1,
    user_id: 3
  }
  return (
    <TrackingProvider
      params={params}
      onTrackingEvent={onTrackingEvent}
      isReady={ready}
    >
      <div className="App" params={params}>
        <h1>Tracking events</h1>
        <ChildComponent />
        <button onClick={() => isReady(true)}>Ready to flush events</button>
        <ul>
          {events.map(event => (
            <li key={event.timestamp}>
              <div>eventName: {event.eventName}</div>
              <div>params: {JSON.stringify(event.params)}</div>
              <div>timestamp: {event.timestamp}</div>
            </li>
          ))}
        </ul>
      </div>
    </TrackingProvider>
  )
}

const rootElement = document.getElementById('root')
ReactDOM.render(<App />, rootElement)
