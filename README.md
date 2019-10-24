# Treacker
The Tracking library for React.

---

*Work in Progress*

## What's the challenge to solve?

Tracking solutions like [React tracker](https://github.com/faouzioudouh/react-tracker#readme) or [React tracking](https://github.com/nytimes/react-tracking) solve the tracking the challenge coming for a perspective that data is present at the moment the tracking event is being triggered, meaning that the data needed to track an event is available from time 0.

``` jsx
const Component = ({ userId, roomId }) => {
  const tracking = useTracking()
  useEffect(() => {
    tracking.trackEvent({ action: 'invite_sent', userId, roomId })
  }, [])
  
  // the rest of my component
}
```

But, what if because of the architecture of the application, the asyncronous nature of nowadays applications (or any other reason) you don't have `userId` or `roomId` values when mouting the component, the tracking event won't be triggered with the correct data.

Having a condition could fix the problem:

``` jsx
const Component = ({ userId, roomId }) => {
  const tracking = useTracking()
  useEffect(() => {
    if(!userId || !roomId) return
    tracking.trackEvent({ action: 'invite_sent', userId, roomId })
  }, [userId, roomId])
  
  // the rest of my component
}
```

But it will needed to do this do it over and over across the application, this starts to be unmaintainable and too verbose. Instead, what if there could be a way to let the "tracking system" manage that for us, what if the data integrity is part of the responsibilities of this "tracking system".

## The proposal

I want to create a tool that:
- Works with vainilla JS and React is just an abstraction, so it's not dependant of React architecture constrains.
- Its responsibility is to ensure the tracking data integrity
- Provides a declarative interface
- It is agnostic of the transport service is used on the project to track the events
- Has an extensive, yet consistant interface

