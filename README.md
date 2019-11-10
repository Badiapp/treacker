# Treacker
The Tracking library for React.

---

## Installation
1. Install it by running `npm i --save treacker` or `yarn add treacker`
2. Use it with [vanilla JS](#for+vainilla) or [React](#for-react)

## Example
You can find an example in [this codesandbox](https://codesandbox.io/s/sharp-rain-jr0m6?fontsize=14).

## Why another tracking library?
Check [my post](https://dev.to/jepser/hello-treacker-a-tracking-library-for-react-59bd) on the practical dev.

# Docs

## For Vainilla

``` js
import { trackingManager } from 'treacker'

const INITIAL_PARAMS = {
  appVersion: 1
}

const onTrackingEvent = (event) => {
  sendEvent(event)
}
const tracking = trackingManager({ id: 'conversation', onTrackingEvent, initialParams: INITIAL_PARAMS })

```

Parameters:
- id `integer|string`: Identifies the instance if you have several, if there not, it fallbacks to the default one.
- onTrackingEvent `function`: This will be the function invoke with the payload [described in this section](#registering-event-callbacks).
- initialParams `object`: Add the initial params to the instance
- ready `bool`: (defaults to `false`), if set to true it will start dispatching tracking events instantly

## Interface

### ready
It's used to let the instance know when the data is ready, and the events tracked by that moment will be flushed.
- params `object` (optional): will append the data passed as the unique argument to the `initialParams` when creating the instance.

``` js
// from the example above
const extraParams = {
  userId: 123
}
tracking.ready(extraParams)
```

Internally it will have the following parameters:

``` js
{
  appVersion: 1,
  userId: 123
}
```

### track
The main function, it is used to track the events. It accepts two arguements with the following signature:
- *eventName* `string`
- *params* `object`

The `params` are going to be appended the internal memoized parameters of the instance.

``` js
tracking.track('user.login')

// will invoke the registered callbacks with the following payload:
{
  eventName: 'user.login',
  timestamp: 1572257317504,
  params: {
    appVersion: 1,
    userId: 123
  }
}
```

With extra parameters on the event:
``` js
// role equals to 'admin' somewhere in the app
tracking.track('user.login', { role })

// will invoke the registered callbacks with the following payload:
{
  eventName: 'user.login',
  timestamp: 1572257317504,
  params: {
    appVersion: 1,
    userId: 123,
    role: 'admin'
  }
}
```

### registerListener
Add more listeners to the events after creating the event.

``` js
const newCallbackFunction = event => {
  sendToOtherTrackingService(event)
}
tracking.registerListener(newCallbackFunction)
```

### getParams
In case you need to get the current params in order to do some computations (which is not recommended, but just in case). You can access to the instance data parameters.

``` js
console.log(tracking.getParams())

// will return
{
  appVersion: 1,
  userId: 123,
}

```

## For React
The library uses internally React's Context architecture.

### 1. Create a provider with `TrackingProvider` 
The provider expects you to let it know when you're are ready by set the `ready` prop to true.

In the following example, we initialise the `TrackingProvider` and we wait for the `getUser` promise to result in order to let the component know that it's ready to flush the events triggered.

``` js
import { useState, useEffect } from 'react'
import { TrackingProvider } from 'treacker'

import UserComponent from './user-component'
import Room from './room'

const INITIAL_PARAMS = {
  locale: 'en',
  app_version: 1
}

const handleOnTrackingEvent = event => {
  // do stuff when the event has been fired.
}

const Layout = ({ getUser, getRoom, rooms }) => {

  const [ready, setReady] = useState(false)
  const [params, setParams] = useState(INITIAL_PARAMS)
  useEffect(() => {
    getUser().then((user) => {
      setParams(state => ({
        ...state,
        userId: user.id,
      })
      setReady(true)
    })

    getRoom()
  }, [])
  return (
    <TrackingProvider params={params} onTrackingEvent={handleOnTrackingEvent} isReady={ready}>
      <UserComponent {...user} />
      {
        rooms.map(room => <Room {...room} />)
      }
    </TrackingProvider>
  )
}
```

2. Connect the children component using `useTracking`, it will connect to the closest `TrackingProvider`, with the same [interface exposed when creating an instance](#interface).

``` js
import { useEffect } from 'react'
import { useTracking } from 'treacker'

const UserComponent = () => {
  const tracking = useTracking()
  useEffect(() => {
    tracking.track('user-component.loaded')
  }, [])

  return (
    // ... the component implementation
  )
}
```
In the case of the rooms, if we want to track when the room has been loaded and pass the roomId:

``` js
import { useEffect } from 'react'
import { useTracking } from 'treacker'

const Room = ({ roomId }) => {
  const tracking = useTracking()
  useEffect(() => {
    tracking.track('room.loaded', { roomId })
  }, [])

  return (
    // ... the component implementation
  )
}
```

### HOC
WIP: `withTracking()`

Using tracking as a prop:

``` js 
import { useEffect } from 'react'
import { withTracking } from 'treacker'

const Component = ({ tracking }) => {
  useEffect(() => {
    tracking.track('my-event')
  }, [])
}

export default withTracking()(Component)

```

Using `useTracking` and a custom provider:

``` js 
import { useEffect } from 'react'
import { withTracking, useTracking } from 'treacker'

const Component = () => {
  const tracking = useTracking()

  useEffect(() => {
    tracking.track('my-event')
  }, [])
}

export default withTracking({ id: 'custom-provider' })(Component)

```

Using `useTracking` and a custom provider and a custom event listener:

``` js 
import { useEffect } from 'react'
import { withTracking, useTracking } from 'treacker'

const customEventListener = event => {
  // do special stuff
}

const Component = () => {
  const tracking = useTracking()

  useEffect(() => {
    tracking.track('my-event')
  }, [])
}

export default withTracking({ id: 'custom-provider', onTrackingEvent: customEventListener })(Component)

```

## Registering event callbacks

There are two ways to register a listener:

1. From an instance:
After creating the instance, a `registerListener` method is exposed, from you need to pass the callback function reference as an argument, like you would to using `addEventListener`.

``` js
const newCallbackFunction = event => {
  sendToOtherTrackingService(event)
}
tracking.registerListener(newCallbackFunction)
```

2. Globally
Another option is, in case you don't have access to the instance to registering using the global function exposed: `registerTrackingListener`. The signature is the following:
- eventListener `function` (required): callback function reference.
- id: is is the id of the already created instance, in case you don't provide one it will fallback to the global one.

``` js
import { registerTrackingListener } from 'treacker'

const newCallbackFunction = event => {
  sendToOtherTrackingService(event)
}
```
In case you want to register it to the global (default):

``` js
registerTrackingListener({ eventListener: newCallbackFunction })
```

Or you have a custom instance somewhere in your app:
``` js
registerTrackingListener({ id: 'my-custom-id', eventListener: newCallbackFunction })
```
