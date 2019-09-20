const electron = require('electron');

function onUrlChange(url, zoom, duration) {
  const webview = document.getElementById('rotate-page');
  webview.setAttribute('src', url);
  webview.addEventListener('did-finish-load', function onDidFinishLoad () {
    webview.removeEventListener('did-finish-load', onDidFinishLoad);
    webview.setZoomLevel(zoom);
    injectScrollBehavior(webview, duration);
  });
}

function injectScrollBehavior(webview, duration) {
  webview.executeJavaScript(`
    function easeInOutQuint(t, b, _c, d) {
      const c = _c - b
    
      if ((t /= d / 2) < 1) {
        return c / 2 * t * t * t * t * t + b
      } else {
        return c / 2 * ((t -= 2) * t * t * t * t + 2) + b
      }
    }

    function scroll() {
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const duration = ${duration};

      let startTime = Date.now();
      let reverse = reverseInitiated = false;
      let y = 0;

      let intervalId = setInterval(() => {
        const now = Date.now();
        const time = now - startTime;
        
        if (!reverseInitiated && (y >= (height - 1))) {
          reverseInitiated = true;

          setTimeout(() => {
            startTime = Date.now();
            y = 0;
            reverse = true;
          }, duration / 5);
        }

        y = easeInOutQuint(time, y, height, duration);

        if (reverse && ((height - y) < 1)) {
          clearInterval(intervalId);
        } else {
          window.scrollTo(0, reverse ? (height - y) : y);
        }
      }, 1);
    }
    
    document.body.style.overflow = 'hidden';
    setTimeout(() => scroll(), ${duration / 5})
  `);
}

function updateProgressBar(timeout) {
  const progress = document.getElementById('progress');
  let i = 1;

  return setInterval(() => {
    const value = (100 / (timeout / 1000)) * i++;
    progress.style.width = `${value}%`;
  }, 1000);
}

function onClick() {
  const url = electron.ipcRenderer.sendSync('get-next-url');
  const webview = document.getElementById('rotate-page');
  webview.setAttribute('src', url);
}

window.onload = () => {
  let intervalId = -1;

  const currentWindow = electron.remote.getCurrentWindow();
  if (currentWindow.previewMode) {
    const previewModeButton = document.getElementById('preview-mode');
    previewModeButton.style.display = "block";
    previewModeButton.onclick = onClick;
  }

  electron.ipcRenderer.on('url', (event, url) => {
    clearInterval(intervalId);
    
    intervalId = updateProgressBar(currentWindow.timeout);
    onUrlChange(url, currentWindow.zoom, currentWindow.timeout);
  });
};