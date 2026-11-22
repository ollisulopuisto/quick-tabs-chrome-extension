'use strict';

/**
 * Geometry for opening the Quick Tabs popup page in a centered,
 * Alfred-like floating window (chrome.windows.create, type "popup").
 *
 * Pure functions, loadable in Node for unit tests and in the MV3
 * service worker via importScripts.
 */
var CenteredWindow = (function() {
  var DEFAULT_WIDTH = 640;
  var DEFAULT_HEIGHT = 520;
  /* Alfred sits above the optical center: ~22% from the top of the host window */
  var VERTICAL_RATIO = 0.22;

  /**
   * Compute left/top/width/height for the floating window inside a host
   * window ({left, top, width, height}). Clamps to the host's size and
   * keeps the window on-screen.
   */
  function computeBounds(host, width, height) {
    width = Math.min(width || DEFAULT_WIDTH, host.width);
    height = Math.min(height || DEFAULT_HEIGHT, host.height);
    var left = Math.round(host.left + (host.width - width) / 2);
    var top = Math.round(host.top + (host.height - height) * VERTICAL_RATIO);
    return { left: Math.max(left, host.left), top: Math.max(top, host.top), width: width, height: height };
  }

  /**
   * Find an already-open centered Quick Tabs window among popup-type
   * windows (as returned by chrome.windows.getAll with populate: true),
   * by matching a tab URL. Stateless: no stored window id that a service
   * worker restart could lose. Returns the window or null.
   */
  function findPopupWindow(windows, popupUrl) {
    for (var i = 0; i < windows.length; i++) {
      var tabs = windows[i].tabs || [];
      for (var j = 0; j < tabs.length; j++) {
        if (tabs[j].url === popupUrl) {
          return windows[i];
        }
      }
    }
    return null;
  }

  /**
   * The open shortcut pressed again closes the floating window: Cmd+D on
   * macOS (his binding). Matched by event.code so layout does not matter;
   * any extra modifier (Shift/Option/Ctrl) makes it a different shortcut.
   */
  function isToggleKey(e) {
    if (!e) {
      return false;
    }
    return e.metaKey === true && e.ctrlKey !== true && e.altKey !== true &&
           e.shiftKey !== true && e.code === 'KeyD';
  }

  return {
    DEFAULT_WIDTH: DEFAULT_WIDTH,
    DEFAULT_HEIGHT: DEFAULT_HEIGHT,
    VERTICAL_RATIO: VERTICAL_RATIO,
    computeBounds: computeBounds,
    findPopupWindow: findPopupWindow,
    isToggleKey: isToggleKey
  };
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = CenteredWindow;
}
