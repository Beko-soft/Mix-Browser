
import { app, BrowserWindow, session } from 'electron'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

process.env.APP_ROOT = path.join(__dirname, '..')

// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, 'public') : RENDERER_DIST

let win: BrowserWindow | null

function createWindow() {
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, 'electron-vite.svg'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
      webviewTag: true,
      nodeIntegration: true, // Optional: might be needed depending on use case, but start with secure defaults + webview
    },
  })

  // Test active push message to Renderer-process.
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', (new Date).toLocaleString())
  })

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL)
  } else {
    win.loadFile(path.join(RENDERER_DIST, 'index.html'))
  }

  // Session Download Handler
  const sess = session.defaultSession; // Use default session for now unless partitioned explicitly everywhere

  sess.on('will-download', (_event, item, _webContents) => {
    const fileName = item.getFilename();
    const savePath = path.join(app.getPath('downloads'), fileName);
    win?.webContents.send('download-started', { filename: fileName, path: savePath });
    item.setSavePath(savePath);
    item.once('done', (_event, state) => {
      if (state === 'completed') {
        win?.webContents.send('download-complete', { filename: fileName, path: savePath });
      }
    })
  });
}

// -- Data Persistence --
import { ipcMain } from 'electron';
import fs from 'node:fs';

const USER_DATA_PATH = app.getPath('userData');
const PASSWORD_FILE = path.join(USER_DATA_PATH, 'passwords.json');
const SETTINGS_FILE = path.join(USER_DATA_PATH, 'settings.json');
const STATS_FILE = path.join(USER_DATA_PATH, 'stats.json');

// Helper generic load/save
const loadJson = (filePath: string, defaultValue: any) => {
  try {
    if (!fs.existsSync(filePath)) return defaultValue;
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch {
    return defaultValue;
  }
};

const saveJson = (filePath: string, data: any) => {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
};

app.whenReady().then(() => {
  // Load initial settings into memory for synchronous access in webRequest
  let currentSettings = loadJson(SETTINGS_FILE, { doNotTrack: true, httpsOnly: false, statsEnabled: true });

  const ses = session.defaultSession;

  // 1. HTTPS Only Enforcement
  ses.webRequest.onBeforeRequest({ urls: ['http://*/*'] }, (details, callback) => {
    if (currentSettings.httpsOnly) {
      const url = details.url.replace(/^http:\/\//i, 'https://');
      callback({ redirectURL: url });
    } else {
      callback({});
    }
  });

  // 2. Do Not Track Enforcement
  ses.webRequest.onBeforeSendHeaders((details, callback) => {
    if (currentSettings.doNotTrack) {
      details.requestHeaders['DNT'] = '1';
    }
    callback({ requestHeaders: details.requestHeaders });
  });


  // Passwords
  ipcMain.handle('passwords:get-all', () => loadJson(PASSWORD_FILE, []));
  ipcMain.handle('passwords:save', (_, { url, username, password }) => {
    const passwords = loadJson(PASSWORD_FILE, []);
    const idx = passwords.findIndex((p: any) => p.url === url && p.username === username);
    if (idx >= 0) passwords[idx].password = password;
    else passwords.push({ id: Date.now(), url, username, password });
    saveJson(PASSWORD_FILE, passwords);
    return true;
  });
  ipcMain.handle('passwords:delete', (_, id) => {
    const passwords = loadJson(PASSWORD_FILE, []);
    saveJson(PASSWORD_FILE, passwords.filter((p: any) => p.id !== id));
    return true;
  });

  // Settings (Privacy, etc)
  ipcMain.handle('settings:get', () => currentSettings);

  ipcMain.handle('settings:save', (_, newSettings) => {
    currentSettings = { ...currentSettings, ...newSettings };
    saveJson(SETTINGS_FILE, currentSettings);
    return true;
  });

  // Stats
  ipcMain.handle('stats:get', () => loadJson(STATS_FILE, []));
  ipcMain.handle('stats:record', (_, { domain }) => {
    // Only record if enabled
    if (!currentSettings.statsEnabled) return false;

    const stats = loadJson(STATS_FILE, []);
    const entry = stats.find((s: any) => s.domain === domain);
    if (entry) {
      entry.visits += 1;
      entry.lastVisit = Date.now();
    } else {
      stats.push({ domain, visits: 1, lastVisit: Date.now(), time: '0m' });
    }
    // Sort by visits
    stats.sort((a: any, b: any) => b.visits - a.visits);
    saveJson(STATS_FILE, stats);
    return true;
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
    win = null
  }
})

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

app.whenReady().then(createWindow)
