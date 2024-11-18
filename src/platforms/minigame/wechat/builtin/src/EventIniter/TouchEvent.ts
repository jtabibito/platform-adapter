import window from 'common/web/Window'
import document from 'common/web/Document'
import TouchEvent from 'common/web/EventIniter/TouchEvent';

function touchEventHandlerFactory(type: string) {
  return (event) => {
    const touchEvent = new TouchEvent(type);
    touchEvent.target = window.canvas;
    touchEvent.currentTarget = window.canvas;
    touchEvent.touches = event.touches;
    touchEvent.targetTouches = Array.prototype.slice.call(event.touches);
    touchEvent.changedTouches = event.changedTouches;
    touchEvent.timeStamp = event.timeStamp;
    document.dispatchEvent(touchEvent);
  }
};

wx.onTouchStart(touchEventHandlerFactory('touchstart'));
wx.onTouchMove(touchEventHandlerFactory('touchmove'));
wx.onTouchEnd(touchEventHandlerFactory('touchend'));
wx.onTouchCancel(touchEventHandlerFactory('touchcancel'));
