import { app, BrowserWindow, ipcMain, screen } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function createMainWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // In dev we load the Vite dev server; in prod we load the built index.html
  const devServer = process.env.VITE_DEV_SERVER_URL;
  if (devServer) {
    win.loadURL(devServer);
  } else {
    // Re-use the existing "app" build for UI consistency
    win.loadFile(path.join(__dirname, '../app/dist/index.html'));
  }
}

function createOverlayWindow() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  const overlay = new BrowserWindow({
    width,
    height,
    x: 0,
    y: 0,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    hasShadow: false,
    focusable: false,
    fullscreen: false,
    skipTaskbar: true,
    webPreferences: {
      preload: path.join(__dirname, 'overlayPreload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      backgroundThrottling: false,
    },
  });

  overlay.setIgnoreMouseEvents(true);

  const devServer = process.env.VITE_DEV_SERVER_URL;
  if (devServer) {
    overlay.loadURL(devServer + '#overlay');
  } else {
    overlay.loadFile(path.join(__dirname, 'overlay.html'));
  }
}

app.whenReady().then(() => {
  createMainWindow();
  createOverlayWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
      createOverlayWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// Example: forward unread-email count from backend (to be implemented)
ipcMain.handle('get-unread-count', async () => {
  // TODO: call Verby API or Supabase channel to fetch unread count
  return 0;
});