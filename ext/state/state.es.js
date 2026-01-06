const createState = (initialState, options = {}) => {
  let _state = initialState;
  const _subscribers = /* @__PURE__ */ new Set();
  const { onSubscriberError } = options;
  const notifySubscribers = () => {
    const subscribers = Array.from(_subscribers);
    subscribers.forEach((callback) => {
      try {
        callback(_state);
      } catch (error) {
        if (onSubscriberError) {
          onSubscriberError(error);
        } else {
          console.error("State subscriber error:", error);
        }
      }
    });
  };
  function get(path) {
    if (!path) {
      return _state;
    }
    const keys = path.split(".");
    let current = _state;
    for (const key of keys) {
      if (current == null || typeof current !== "object") {
        return void 0;
      }
      if (!Object.prototype.hasOwnProperty.call(current, key)) {
        return void 0;
      }
      current = current[key];
    }
    return current;
  }
  const set = (newState) => {
    if (Object.is(_state, newState)) {
      return;
    }
    if (newState === null || newState === void 0) {
      return;
    }
    _state = newState;
    notifySubscribers();
  };
  const update = (partialState) => {
    const newState = { ..._state, ...partialState };
    set(newState);
  };
  const subscribe = (callback, immediate = true) => {
    _subscribers.add(callback);
    if (immediate) {
      callback(_state);
    }
    return () => {
      _subscribers.delete(callback);
    };
  };
  const getState = () => {
    return _state;
  };
  const getSubscriberCount = () => {
    return _subscribers.size;
  };
  const hasSubscriber = (callback) => {
    return _subscribers.has(callback);
  };
  return {
    get,
    set,
    update,
    subscribe,
    getState,
    getSubscriberCount,
    hasSubscriber
  };
};
export {
  createState
};
