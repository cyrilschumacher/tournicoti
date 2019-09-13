const electron = require('electron');

function onUrlChange(url, currentWindow, intervalForProgress, intervalForScroll, interval) {
  clearInterval(intervalForProgress);

  intervalForProgress = updateProgressBar(intervalForProgress, currentWindow.timeout);

  const webview = document.getElementById('rotate-page');
  webview.setAttribute('src', url);
  webview.addEventListener('did-finish-load', () => {
    clearTimeout(intervalForScroll);

    webview.setZoomLevel(currentWindow.zoom);
    intervalForScroll = setTimeout(scroll, interval / 4, webview, interval / 4);
  });
}

function scroll(webview, interval) {
  webview.executeJavaScript(`
    function easeInOutQuint(t) {
      return t<.5 ? 16*t*t*t*t*t : 1+16*(--t)*t*t*t*t;
    }

    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    let i = 0;
    let intervalId = setInterval(() => {
      let t = i++ / height;
      let y = easeInOutQuint(t) * i;
      window.scrollTo(0, y);

      if (y > height) {
        clearInterval(intervalId);
        intervalId = setTimeout(() => {
          clearTimeout(intervalId);

          i = 0;
          intervalId = setInterval(() => {
            t =  i++ / height;
            y = height - easeInOutQuint(t) * i;

            window.scrollTo(0, y);
            if (y < 0) {
              clearInterval(intervalId);
            }
          }, 1);
        }, ${interval});
      }
    }, 1);
  `);
}

function updateProgressBar(intervalForProgress, timeout) {
  const progress = document.getElementById('progress');
  const endDate = new Date().setMilliseconds(timeout);

  let i = 1;
  return setInterval(() => {
    const date = new Date();
    if (date > endDate) {
      clearInterval(intervalForProgress);
    }

    const value = (100 / (timeout / 1000)) * i;
    i += 1;
    progress.style.width = `${value}%`;
  }, 1000);
}

window.onload = () => {
  let intervalForProgress = -1;
  let intervalForScroll = -1;

  const currentWindow = electron.remote.getCurrentWindow();

  let interval = (currentWindow.timeout / 10) * 2;
  interval = interval > 2 ? interval : 2;

  electron.ipcRenderer.on('url', (event, url) =>
    onUrlChange(url, currentWindow, intervalForProgress, intervalForScroll, interval),
  );
};
