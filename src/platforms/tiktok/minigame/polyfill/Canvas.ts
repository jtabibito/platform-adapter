import { innerWidth, innerHeight } from './WindowProperties';
import $HTMLElement from './HTMLElement'
import EventTarget from '../../../../common/polyfill/EventTarget';

import utils from '../../../../common/utils/Utils';

export default function Canvas() {
  const canvas = tt.createCanvas();
  canvas.type = 'canvas';
  canvas.__proto__.__proto__ = new $HTMLElement('canvas');

  canvas.getBoundingClientRect = () => {
    return {
      top: 0,
      left: 0,
      width: innerWidth,
      height: innerHeight
    };
  };

  Object.defineProperty(canvas, 'clientWidth', {
    get() {
      return innerWidth;
    }
  });

  Object.defineProperty(canvas, 'clientHeight', {
    get() {
      return innerHeight;
    }
  });

  // Copy prototype from EventTarget to canvas
  const old = Object.getPrototypeOf(canvas);
  Object.setPrototypeOf(canvas, {});
  const newProto = Object.getPrototypeOf(canvas);
  Object.setPrototypeOf(newProto, old);
  utils.cloneProperty(Object.getPrototypeOf(canvas), EventTarget.prototype);

  return canvas;
}
