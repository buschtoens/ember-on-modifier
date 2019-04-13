/**
 * Internet Explorer 11 does not support `once` and also does not support
 * passing `eventOptions`. In some situations it then throws a weird script
 * error, like:
 *
 * ```
 * Could not complete the operation due to error 80020101
 * ```
 *
 * This flag determines, whether `{ once: true }` and thus also event options in
 * general are supported.
 */
export const SUPPORTS_EVENT_OPTIONS = (() => {
  try {
    const div = document.createElement('div');
    let counter = 0;
    div.addEventListener('click', () => counter++);

    let event;
    if (typeof Event === 'function') {
      event = new Event('click');
    } else {
      event = document.createEvent('Event');
      event.initEvent('click', true, true);
    }

    div.dispatchEvent(event);
    div.dispatchEvent(event);

    return counter === 1;
  } catch (error) {
    return false;
  }
})();

/**
 * Registers an event for an `element` that is called exactly once and then
 * unregistered again. This is effectively a polyfill for `{ once: true }`.
 *
 * It also accepts a fourth optional argument `useCapture`, that will be passed
 * through to `addEventListener`.
 *
 * @param {Element} element
 * @param {string} eventName
 * @param {Function} callback
 * @param {boolean} [useCapture=false]
 */
export function addEventListenerOnce(
  element,
  eventName,
  callback,
  useCapture = false
) {
  function listener() {
    element.removeEventListener(eventName, listener, useCapture);
    callback();
  }
  element.addEventListener(eventName, listener, useCapture);
}

/**
 * Safely invokes `addEventListener` for IE11 and also polyfills the
 * `{ once: true }` and `{ capture: true }` options.
 *
 * All other options are discarded for IE11. Currently this is only `passive`.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener
 *
 * @param {Element} element
 * @param {string} eventName
 * @param {Function} callback
 * @param {object} [eventOptions]
 */
export function addEventListener(element, eventName, callback, eventOptions) {
  if (SUPPORTS_EVENT_OPTIONS) {
    element.addEventListener(eventName, callback, eventOptions);
  } else if (eventOptions && eventOptions.once) {
    addEventListenerOnce(
      element,
      eventName,
      callback,
      Boolean(eventOptions.capture)
    );
  } else {
    element.addEventListener(
      eventName,
      callback,
      Boolean(eventOptions && eventOptions.capture)
    );
  }
}

/**
 * Since the same `capture` event option that was used to add the event listener
 * needs to be used when removing the listener, it needs to be polyfilled as
 * `useCapture` for IE11.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/removeEventListener
 *
 * @param {Element} element
 * @param {string} eventName
 * @param {Function} callback
 * @param {object} [eventOptions]
 */
export function removeEventListener(
  element,
  eventName,
  callback,
  eventOptions
) {
  if (SUPPORTS_EVENT_OPTIONS) {
    element.removeEventListener(eventName, callback, eventOptions);
  } else {
    element.removeEventListener(
      eventName,
      callback,
      Boolean(eventOptions && eventOptions.capture)
    );
  }
}
