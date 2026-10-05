const { BrowserWindow, desktopCapturer, ipcMain, session } = require('electron');
const path = require('path');

// Electron has no built-in "choose what to share" dialog: without a handler, a meeting's
// "Share screen" fails with "Not supported". This shows our own picker (screens and
// windows with thumbnails) and only for pages on the COMMAND origin.
//
// Screen-share sound is not captured here: Windows "loopback" would also send the
// meeting's own audio back to everyone (echo). Share sound from Chrome/Edge instead.

let picker = null;

function pickSource(parent, sources) {
  return new Promise((resolve) => {
    if (picker && !picker.isDestroyed()) picker.close();
    picker = new BrowserWindow({
      parent,
      modal: true,
      width: 760,
      height: 560,
      minWidth: 520,
      minHeight: 400,
      title: 'Share your screen',
      backgroundColor: '#0a0e17',
      autoHideMenuBar: true,
      webPreferences: {
        preload: path.join(__dirname, 'pickerPreload.js'),
        contextIsolation: true,
        nodeIntegration: false,
        sandbox: true,
      },
    });

    let settled = false;
    const finish = (id) => {
      if (settled) return;
      settled = true;
      ipcMain.removeHandler('picker:sources');
      ipcMain.removeAllListeners('picker:choose');
      resolve(sources.find((s) => s.id === id) || null);
      if (picker && !picker.isDestroyed()) picker.close();
    };

    ipcMain.handle('picker:sources', () =>
      sources.map((s) => ({ id: s.id, name: s.name, kind: s.id.startsWith('screen:') ? 'screen' : 'window', thumb: s.thumbnail.toDataURL() }))
    );
    ipcMain.on('picker:choose', (_e, id) => finish(id));
    picker.on('closed', () => {
      picker = null;
      finish(null); // closed without choosing = cancel
    });
    picker.loadFile(path.join(__dirname, 'picker.html'));
  });
}

function setupScreenShare({ isAppOrigin, getWindow }) {
  session.defaultSession.setDisplayMediaRequestHandler(async (request, callback) => {
    // callback() with no arguments is Electron's clean "no" (the page gets an AbortError);
    // callback({}) throws. The callback may only be called once.
    const deny = () => callback();
    const from = request.securityOrigin || request.frame?.url || '';
    if (!isAppOrigin(from)) return deny();
    let chosen = null;
    try {
      const sources = await desktopCapturer.getSources({ types: ['screen', 'window'], thumbnailSize: { width: 320, height: 180 } });
      chosen = await pickSource(getWindow(), sources);
    } catch {
      chosen = null;
    }
    if (chosen) callback({ video: chosen });
    else deny();
  });
}

module.exports = { setupScreenShare };
