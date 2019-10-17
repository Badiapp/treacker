const TRACKING_BASE_NAME = "tracking";
const registeredTrackingProviders = new Set();

const trackWithEvent = (eventName, params) => {
  const trackingEvent = new CustomEvent(TRACKING_BASE_NAME, {
    detail: {
      eventName,
      params
    }
  });

  document.dispatchEvent(trackingEvent);
};

const handleTrackEvent = onTrackingEvent => event => {
  const { eventName, params } = event.detail;

  onTrackingEvent({ eventName, params });
};

const initializeTracking = (onTrackingEvent = () => {}) => {
  document.addEventListener(
    TRACKING_BASE_NAME,
    handleTrackEvent(onTrackingEvent)
  );
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
  id: instanceId,
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
    if (!instanceExists(instanceId)) registerInstance(instanceId);

    if (typeof window === "undefined") _queueEvent({ type: EVENT_TYPES.INIT });
    _init();
  }

  function _init() {
    initializeTracking(onTrackingEvent);
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
      queue.shift();
    });
  }

  function _track(eventName, eventParams) {
    const params = {
      ...memoizedParams,
      ...eventParams
    };

    trackWithEvent(eventName, params);
  }

  function _queueEvent({ payload = {}, type = EVENT_TYPES.TRACK }) {
    if (EVENT_TYPES.INIT) {
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

    if (status !== STATUS.READY) _queueEvent({ payload }, EVENT_TYPES.TRACK);

    _track(eventName, params);
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

  init();

  return {
    ready,
    track,
    replaceParams,
    getParams
  };
};
