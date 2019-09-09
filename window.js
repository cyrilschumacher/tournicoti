// eslint-disable-next-line import/no-extraneous-dependencies
const electron = require('electron');
const createDebug = require('debug');

const DEBUG = createDebug('tournicoti:window');

const WINDOW_OPTIONS = {
  kiosk: true,
  webPreferences: {
    devTools: false,
    nodeIntegration: true,
  },
};

function rotate(webContents, url, index) {
  const nextIndex = index < url.length ? index : 0;
  const currentUrl = url[nextIndex];
  DEBUG('Next URL address: %s', currentUrl);

  webContents.send('url', currentUrl);
  return nextIndex + 1;
}

function onBrowserWindowCreated(e, window) {
  DEBUG('Browser window created.');
  window.setMenu(null);
}

function onReady(options, config) {
  DEBUG('Window initialized.');

  const mainWindow = new electron.BrowserWindow(WINDOW_OPTIONS);

  if (options.preventSleep) {
    config.powerSaveBlockerId = electron.powerSaveBlocker.start('prevent-display-sleep');
    DEBUG('`powerSaveBlocker` module enabled (id=%s).', config.powerSaveBlockerId);
  }

  mainWindow.loadURL(`file://${__dirname}/assets/index.html`);
  mainWindow.timeout = options.timeout;
  mainWindow.zoom = options.zoom;

  let index = options.randomUrl ? Math.floor(Math.random() * (options.url.length - 0 + 1)) + 0 : 0;
  mainWindow.webContents.on('did-finish-load', () => {
    DEBUG('Page loaded.');
    index = rotate(mainWindow.webContents, options.url, index);

    setInterval(() => {
      index = rotate(mainWindow.webContents, options.url, index);
    }, options.timeout);
  });
}

function onWindowAllClosed(config) {
  DEBUG('All window closed.');

  if (config && config.powerSaveBlockerId && electron.powerSaveBlocker.isStarted(config.powerSaveBlockerId)) {
    DEBUG('Stopping `powerSaveBlocker` module.');
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
