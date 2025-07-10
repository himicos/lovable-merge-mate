import { app, BrowserWindow, ipcMain, screen, desktopCapturer } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import EventSource from 'eventsource';
// Node 20 ships global fetch; if not, uncomment next line
// import fetch from 'node-fetch';

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

let overlayWin: BrowserWindow | null = null;

function createOverlayWindow() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;

  overlayWin = new BrowserWindow({
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

  overlayWin.setIgnoreMouseEvents(true);

  const devServer = process.env.VITE_DEV_SERVER_URL;
  if (devServer) {
    overlayWin.loadURL(devServer + '#overlay');
  } else {
    overlayWin.loadFile(path.join(__dirname, 'overlay.html'));
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

// Gmail handlers
ipcMain.handle('gmail:listInbox', async (_event, userId: string) => {
  try {
    const url = `${process.env.API_URL || 'http://localhost:13337'}/api/gmail/messages/${userId}`;
    const r = await fetch(url);
    if (!r.ok) throw new Error(await r.text());
    return await r.json();
  } catch (e) {
    console.error('Error fetching inbox', e);
    return [];
  }
});

ipcMain.handle('gmail:getUnread', async (_event, userId: string) => {
  try {
    const url = `${process.env.API_URL || 'http://localhost:13337'}/api/gmail/status/${userId}`;
    const r = await fetch(url);
    const data = await r.json();
    return data.unread || 0;
  } catch (e) {
    console.error('Error fetching unread', e);
    return 0;
  }
});

ipcMain.on('gmail:subscribe', (event, userId: string) => {
  const api = process.env.API_URL || 'http://localhost:13337';
  const es = new EventSource(`${api}/api/gmail/stream/${userId}`);
  es.onmessage = ev => {
    const data = JSON.parse(ev.data);
    event.sender.send('inbox:update', data);
  };
  es.onerror = err => {
    console.error('SSE error', err);
  };
});

// -------- Vision capture helpers --------

async function captureScreenPNG(): Promise<Buffer> {
  const sources = await desktopCapturer.getSources({ types: ['screen'] });
  const primary = sources[0];
  // Electron returns a thumbnail as nativeImage already scaled (~150px).
  // We get full screen PNG via toPNG()
  return primary.thumbnail.resize({ width: 1024 }).toPNG();
}

async function analyseFrame(buf: Buffer): Promise<any[]> {
  try {
    // TODO: send to real vision endpoint
    const api = process.env.API_URL || 'http://localhost:13337';
    const r = await fetch(`${api}/api/vision/analyse`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/octet-stream' },
      body: buf,
    });
    if (!r.ok) throw new Error(await r.text());
    return await r.json(); // expecting [{x,y,w,h,label,score}]
  } catch (e) {
    console.error('Vision analysis failed', e);
    return [];
  }
}

ipcMain.handle('vision:capture', async () => {
  const png = await captureScreenPNG();
  const boxes = await analyseFrame(png);
  if (overlayWin) {
    overlayWin.webContents.send('overlay-boxes', boxes);
  }
  return boxes;
});

let visionInterval: NodeJS.Timeout | null = null;
ipcMain.on('vision:start', async (_e, fps: number = 1) => {
  if (visionInterval) return;
  const intervalMs = Math.max(200, 1000 / fps);
  visionInterval = setInterval(async () => {
    const png = await captureScreenPNG();
    const boxes = await analyseFrame(png);
    if (overlayWin) overlayWin.webContents.send('overlay-boxes', boxes);
  }, intervalMs);
});

ipcMain.on('vision:stop', () => {
  if (visionInterval) clearInterval(visionInterval);
  visionInterval = null;
});

// Demo: emit random overlay boxes every 3s
setInterval(() => {
  if (!overlayWin) return;
  const boxes = Array.from({ length: Math.floor(Math.random()*3)+1 }, () => ({
    x: Math.random() * 400,
    y: Math.random() * 400,
    w: 120 + Math.random()*100,
    h: 80 + Math.random()*80,
  }));
  overlayWin.webContents.send('overlay-boxes', boxes);
}, 3000);