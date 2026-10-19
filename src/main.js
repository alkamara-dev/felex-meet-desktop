const { app, BrowserWindow, Menu, shell, session, dialog } = require('electron');
const { autoUpdater } = require('electron-updater');
const { setupScreenShare } = require('./screenShare');

// FELEX Meet desktop: meet.felexuss.com in its own window, plus what a browser tab can't
// do well: a screen/window picker for screen sharing, a taskbar icon, and auto-updates.
// The app holds no secrets and stores nothing but the site's own sign-in cookie.
const APP_ORIGIN = 'https://meet.felexuss.com';
const START_URL = `${APP_ORIGIN}/app`;

// Installed from the Microsoft Store (an MSIX/AppX package)? Then the Store signs it, updates it and gives it its taskbar identity, so
// the updater and the app ID below must stay out of the way. Electron sets process.windowsStore in that case.
const FROM_STORE = !!process.windowsStore;

let mainWindow;

function isAppOrigin(url) {
  try {
    return new URL(url).origin === APP_ORIGIN;
  } catch {
    return false;
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 900,
    minHeight: 600,
    title: 'FELEX Meet',
    backgroundColor: '#020617',
    autoHideMenuBar: true,
    webPreferences: { contextIsolation: true, nodeIntegration: false, sandbox: true },
  });
  mainWindow.loadURL(START_URL);

  // Stay on FELEX Meet; every other link (help pages, COMMAND meetings, a link pasted
  // in chat) opens in the person's normal browser.
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (isAppOrigin(url)) return { action: 'allow' };
    if (/^https?:/i.test(url)) shell.openExternal(url);
    return { action: 'deny' };
  });
  mainWindow.webContents.on('will-navigate', (event, url) => {
    if (isAppOrigin(url)) return;
    event.preventDefault();
    if (/^https?:/i.test(url)) shell.openExternal(url);
  });

  // No network yet (laptop just woke up, Wi-Fi joining): offer a retry instead of a blank window.
  mainWindow.webContents.on('did-fail-load', async (_e, code, _desc, url, isMainFrame) => {
    if (!isMainFrame || code === -3) return; // -3: navigation aborted (normal)
    const { response } = await dialog.showMessageBox(mainWindow, {
      type: 'warning',
      buttons: ['Try again', 'Quit'],
      message: "Can't reach FELEX Meet",
      detail: 'Check your internet connection, then try again.',
    });
    if (response === 0) mainWindow.loadURL(url || START_URL);
    else app.quit();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function setupPermissions() {
  // Camera, microphone, screen sharing and notifications: FELEX Meet only, never other sites.
  const allowed = ['media', 'display-capture', 'notifications', 'fullscreen', 'clipboard-sanitized-write'];
  session.defaultSession.setPermissionRequestHandler((webContents, permission, callback) => {
    callback(isAppOrigin(webContents.getURL()) && allowed.includes(permission));
  });
  setupScreenShare({ isAppOrigin, getWindow: () => mainWindow });
}

function buildMenu() {
  const go = (path) => () => mainWindow?.loadURL(`${APP_ORIGIN}${path}`);
  Menu.setApplicationMenu(
    Menu.buildFromTemplate([
      {
        label: 'FELEX Meet',
        submenu: [
          { label: 'My meetings', accelerator: 'CmdOrCtrl+M', click: go('/app') },
          { label: 'Team', click: go('/app/team') },
          { label: 'Account', click: go('/app/account') },
          { type: 'separator' },
          ...(FROM_STORE ? [] : [{ label: 'Check for updates', click: () => autoUpdater.checkForUpdatesAndNotify() }, { type: 'separator' }]),
          { role: 'quit' },
        ],
      },
      { label: 'Edit', submenu: [{ role: 'undo' }, { role: 'redo' }, { type: 'separator' }, { role: 'cut' }, { role: 'copy' }, { role: 'paste' }, { role: 'selectAll' }] },
      {
        label: 'View',
        submenu: [
          { role: 'reload' },
          { type: 'separator' },
          { role: 'resetZoom' },
          { role: 'zoomIn' },
          { role: 'zoomOut' },
          { type: 'separator' },
          { role: 'togglefullscreen' },
        ],
      },
      { label: 'Help', submenu: [{ label: 'FELEX Meet support', click: () => shell.openExternal('mailto:info@felexuss.com') }] },
    ])
  );
}

// One running copy: launching it again brings the existing window forward.
if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (!mainWindow) return createWindow();
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
  });

  app.whenReady().then(() => {
    if (!FROM_STORE) app.setAppUserModelId('com.felexuss.meet');
    setupPermissions();
    buildMenu();
    createWindow();
    // New versions are published as GitHub releases; they download in the background
    // and install the next time the app is closed.
    if (app.isPackaged && !FROM_STORE) autoUpdater.checkForUpdatesAndNotify().catch(() => {});
    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
  });

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
  });
}
