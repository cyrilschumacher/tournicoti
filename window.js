// eslint-disable-next-line import/no-extraneous-dependencies
const electron = require('electron');
const createDebug = require('debug');

const DEBUG = createDebug('tournicoti:window');

const WINDOW_OPTIONS = {
  kiosk: false,
  webPreferences: {
    devTools: true,
    nodeIntegration: true,
  },
};

function getNextUrl(url, index) {
  const nextIndex = index < url.length ? index : 0;
  const currentUrl = url[nextIndex];
  DEBUG('Next URL address: %s', currentUrl);

  return currentUrl;
}

function createWindow(event, window) {
  DEBUG('Browser window created.');
  window.setMenu(null);
}

function initWindow(options, config) {
  DEBUG('Window initialized.');

  const mainWindow = new electron.BrowserWindow(WINDOW_OPTIONS);

  if (options.preventSleep) {
    config.powerSaveBlockerId = electron.powerSaveBlocker.start('prevent-display-sleep');
    DEBUG('`powerSaveBlocker` module enabled (id=%s).', config.powerSaveBlockerId);
  }

  mainWindow.loadURL(`file://${__dirname}/assets/index.html`);
  mainWindow.timeout = options.timeout;
  mainWindow.zoom = options.zoom;
  mainWindow.previewMode = options.previewMode;

  let index = options.randomUrl ? Math.floor(Math.random() * (options.url.length - 0 + 1)) + 0 : 0;
  mainWindow.webContents.on('did-finish-load', function onDidFinishLoad() {
    DEBUG('Page loaded.');
    mainWindow.webContents.removeListener('did-finish-load', onDidFinishLoad);

    if (options.previewMode) {
      electron.ipcMain.on('get-next-url', (event, arg) => {
        event.returnValue = getNextUrl(options.url, index++);
      });
    } else {
      mainWindow.webContents.send('url', getNextUrl(options.url, index++));
      setInterval(() => mainWindow.webContents.send('url', getNextUrl(options.url, index++)), options.timeout);
    }
  });
}

function destroyWindow(config) {
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

  electron.app.once('ready', function onReady(launchInfo) {
    electron.app.removeListener('ready', onReady);
    initWindow(options, config);
  });

  electron.app.once('window-all-closed', function onWindowAllClosed() {
    electron.app.removeListener('window-all-closed', onWindowAllClosed);
    destroyWindow(config);
  });

  electron.app.once('browser-window-created', function onWindowAllClosed(event, window) {
    electron.app.removeListener('window-all-closed', onWindowAllClosed);
    createWindow(event, window);
  });
};
