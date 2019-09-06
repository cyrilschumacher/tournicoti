// eslint-disable-next-line import/no-extraneous-dependencies
const electron = require('electron');

const WINDOW_OPTIONS = {
  kiosk: true,
  webPreferences: {
    devTools: false,
    nodeIntegration: true,
  },
};

function rotate(webContents, url, index) {
  const nextIndex = index < url.length ? index : 0;
  webContents.send('url', url[nextIndex]);

  return nextIndex + 1;
}

function onBrowserWindowCreated(e, window) {
  window.setMenu(null);
}

function onReady(options, config) {
  const mainWindow = new electron.BrowserWindow(WINDOW_OPTIONS);

  if (options.preventSleep) {
    config.powerSaveBlockerId = electron.powerSaveBlocker.start('prevent-display-sleep');
  }

  mainWindow.loadURL(`file://${__dirname}/assets/index.html`);
  mainWindow.timeout = options.timeout;
  mainWindow.zoom = options.zoom;

  let index = options.randomUrl ? Math.floor(Math.random() * (options.url.length - 0 + 1)) + 0 : 0;
  mainWindow.webContents.on('did-finish-load', () => {
    index = rotate(mainWindow.webContents, options.url, index);

    setInterval(() => {
      index = rotate(mainWindow.webContents, options.url, index);
    }, options.timeout);
  });
}

function onWindowAllClosed(config) {
  if (config && config.powerSaveBlockerId && electron.powerSaveBlocker.isStarted(config.powerSaveBlockerId)) {
    electron.powerSaveBlocker.stop(config.powerSaveBlockerId);
  }

  if (process.platform !== 'darwin') {
    electron.app.quit();
  }
}

module.exports.start = (options) => {
  const config = {};

  electron.app.once('ready', () => onReady(options, config));
  electron.app.once('window-all-closed', () => onWindowAllClosed(config));
  electron.app.once('browser-window-created', onBrowserWindowCreated);
};
