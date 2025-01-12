import platformAdapter from '../../../../common/global/PlatformAdapter';
import './Window';
import './Document';
import utils from '../../../../common/utils/Utils';

declare global {
  const wx: any;
  const GameGlobal: any;
}

(function inject () {
  GameGlobal.platformAdapter = platformAdapter;
  Object.assign(platformAdapter.window, {
    addEventListener: (type, listener) => {
      // @ts-ignore
      platformAdapter.document.addEventListener(type, listener);
    },
    removeEventListener: (type, listener) => {
      // @ts-ignore
      platformAdapter.document.removeEventListener(type, listener);
    }
  });
  Object.assign(platformAdapter.window.canvas, {
    // @ts-ignore
    addEventListener: platformAdapter.window.addEventListener,
    // @ts-ignore
    removeEventListener: platformAdapter.window.removeEventListener
  })
  utils.cloneProperty(platformAdapter, platformAdapter.window);

  if (!GameGlobal.__isAdapterInjected) {
    GameGlobal.__isAdapterInjected = true;
  }
})();
