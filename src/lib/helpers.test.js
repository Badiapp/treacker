import { createEventName, registerTrackingListener, trackWithEvent } from './helpers'

describe('createEventName', () => {
  it('should create an event name with default name', () => {
    expect(createEventName()).toBe('tracking:__default')
  })

  it('should create an event name with a custom name', () => {
    const customName = 'super-name'
    expect(createEventName(customName)).toBe(`tracking:${customName}`)
  })
})

describe('custom events abstraction', () => {
  it('should invoke the event callback correctly', () => {
    const mock = jest.fn()
    const eventName = 'test'
    const params = {
      key: 'name'
    }

    registerTrackingListener({ eventListener: mock })
    trackWithEvent({ eventName, params })

    expect(mock).toBeCalledWith(expect.objectContaining({
      eventName,
      params
    }))
  })

  it('should invoke the event callback correctly with a custom id', () => {
    const mock = jest.fn()
    const eventName = 'test'
    const params = {
      key: 'name'
    }
    const id = 'custom'

    registerTrackingListener({ id, eventListener: mock })
    trackWithEvent({ eventName, params, id })

    expect(mock).toBeCalledWith(expect.objectContaining({
      eventName,
      params
    }))
  })
})
