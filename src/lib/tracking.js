const DEFAULT_PROVIDER_NAME = "__default";
const TRACKING_BASE_NAME = "tracking";
const registeredTrackingProviders = new Set();

const createEventName = (name = DEFAULT_PROVIDER_NAME) => {
  return `${TRACKING_BASE_NAME}:${name}`;
};

const trackWithEvent = ({ eventName, params, id }) => {
  const eventSpaceName = createEventName(id);
  const trackingEvent = new CustomEvent(eventSpaceName, {
    detail: {
      eventName,
      params
    }
  });

  window.dispatchEvent(trackingEvent);
};

const handleTrackEvent = onTrackingEvent => event => {
  const { eventName, params } = event.detail;

  onTrackingEvent({ eventName, params });
};

export const registerTrackingListener = ({
  eventListener,
  id = DEFAULT_PROVIDER_NAME
}) => {
  const eventName = createEventName(id);
  window.addEventListener(eventName, handleTrackEvent(eventListener));
};

const STATUS = {
  INITIAL: 0,
  INITIALIZED: 1,
  READY: 2
};
const EVENT_TYPES = {
  INIT: "init",
  TRACK: "track"
};

export const trackingManager = ({
  id: instanceId = DEFAULT_PROVIDER_NAME,
  onTrackingEvent = () => {},
  initialParams = {}
}) => {
  let queue = [];
  let memoizedParams = initialParams;
  let status = STATUS.INITIAL;

  function registerInstance(id) {
    registeredTrackingProviders.add(id, this);
  }

  function instanceExists(id) {
    return registeredTrackingProviders.has(id);
  }

  function init() {
    if (instanceExists(instanceId)) return;

    registerInstance(instanceId);

    if (typeof window === "undefined") _queueEvent({ type: EVENT_TYPES.INIT });
    _init();
  }

  function _init() {
    registerListener({
      eventListener: onTrackingEvent,
      id: instanceId
    });
    status = STATUS.INITIALIZED;
  }

  function _flushQueue() {
    queue.forEach(event => {
      switch (event.type) {
        case EVENT_TYPES.INIT:
          _init();
          break;
        case EVENT_TYPES.TRACK:
        default:
          const { eventName, params } = event.payload;
          _track(eventName, params);
          break;
      }
    });

    // clears the queue
    queue = [];
  }

  function _track(eventName, eventParams) {
    const params = {
      ...memoizedParams,
      ...eventParams
    };

    trackWithEvent({ eventName, params, id: instanceId });
  }

  function _queueEvent({ payload = {}, type = EVENT_TYPES.TRACK }) {
    if (type === EVENT_TYPES.INIT) {
      return queue.unshift({ type, payload });
    }

    queue.push({
      type,
      payload
    });
  }

  function ready(extraParams) {
    if (status === STATUS.READY) return;

    memoizedParams = extraParams;
    _flushQueue();

    status = STATUS.READY;
  }

  function track(eventName, params) {
    const payload = {
      eventName,
      params
    };

    if (status === STATUS.READY) {
      _track(eventName, params);
      return;
    }

    _queueEvent({ payload }, EVENT_TYPES.TRACK);
  }

  function replaceParams(params) {
    memoizedParams = {
      ...memoizedParams,
      ...params
    };
  }

  function getParams() {
    return memoizedParams;
  }

  function registerListener(listener) {
    return registerTrackingListener({
      eventListener: listener,
      id: instanceId
    });
  }

  init();

  return {
    ready,
    track,
    replaceParams,
    getParams,
    registerListener,
  };
};
