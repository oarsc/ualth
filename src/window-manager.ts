import { BrowserWindow, NativeImage, screen } from 'electron';
import { join } from 'path';
import isDev from 'electron-is-dev';
import { ClaudeResponsePayload, NotificationPayload } from './shared-models/models';


// [#] LOADING WINDOW

const LOADING_SIZE = 85;
const LOADING_RIGHT_MARGIN = 50;
const LOADING_BOTTOM_MARGIN = 50;

let loadingCount = 0;
let activeLoadingWindow: BrowserWindow | undefined = undefined;

export function createLoadingWindow(): Promise<BrowserWindow> {
  if (activeLoadingWindow) {
    loadingCount++;
    return Promise.resolve(activeLoadingWindow);
  }

  const { bounds } = screen.getPrimaryDisplay();
  const x = bounds.x + bounds.width - LOADING_SIZE - LOADING_RIGHT_MARGIN;
  const y = bounds.y + bounds.height - LOADING_SIZE - LOADING_BOTTOM_MARGIN;

  loadingCount = 1;
  activeLoadingWindow = new BrowserWindow({
    width: LOADING_SIZE,
    height: LOADING_SIZE,
    x,
    y,
    frame: false,
    resizable: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    autoHideMenuBar: true,
    movable: false,
    focusable: false,
    show: false,
    transparent: true,
    webPreferences: {
      sandbox: false,
      nodeIntegration: false,
      contextIsolation: true,
      preload: join(__dirname, './bridge.js'),
      additionalArguments: ['--mode=loading'],
    },
  });

  return openWindow(activeLoadingWindow);
}

export function stopLoadingWindow() {
  if (activeLoadingWindow && (--loadingCount <= 0)) {
    activeLoadingWindow.webContents.send('stop-loading');

    activeLoadingWindow.on('closed', () => {
      activeLoadingWindow?.destroy();
      activeLoadingWindow = undefined;
      loadingCount = 0;
    });
  }
}

// [#] NOTIFICATION WINDOW

const NOTIFICATION_WIDTH = 500;
const NOTIFICATION_HEIGHT = 70;
const NOTIFICATION_MARGIN = 20;
const NOTIFICATION_BOTTOM_MARGIN = 50;

const activeNotificationWindows: BrowserWindow[] = [];

function computeNotificationY(index: number): number {
  const { bounds } = screen.getPrimaryDisplay();
  return bounds.y + bounds.height - NOTIFICATION_HEIGHT - NOTIFICATION_BOTTOM_MARGIN - index * (NOTIFICATION_HEIGHT + NOTIFICATION_MARGIN);
}

function reflowNotificationWindows(): void {
  const { bounds } = screen.getPrimaryDisplay();
  const x = bounds.x + bounds.width - NOTIFICATION_WIDTH;
  activeNotificationWindows.forEach((win, i) => {
    win.setPosition(x, computeNotificationY(i));
  });
}

export function createNotificationWindow(payload: NotificationPayload): Promise<BrowserWindow> {
  const { bounds } = screen.getPrimaryDisplay();
  const x = bounds.x + bounds.width - NOTIFICATION_WIDTH;
  const index = activeNotificationWindows.length;
  const y = computeNotificationY(index);

  const win = new BrowserWindow({
    width: NOTIFICATION_WIDTH,
    height: NOTIFICATION_HEIGHT,
    x,
    y,
    frame: false,
    resizable: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    autoHideMenuBar: true,
    movable: false,
    focusable: false,
    show: false,
    transparent: true,
    webPreferences: {
      sandbox: false,
      nodeIntegration: false,
      contextIsolation: true,
      preload: join(__dirname, './bridge.js'),
      additionalArguments: ['--mode=notification'],
    },
  });

  activeNotificationWindows.push(win);
  win.on('closed', () => {
    const idx = activeNotificationWindows.indexOf(win);
    if (idx !== -1) activeNotificationWindows.splice(idx, 1);
    reflowNotificationWindows();
  });

  return openWindow(win, () => {
    win.webContents.send('show-notification', payload);
  });
}

// [#] EYEDROPPER WINDOW

export function createCaptureWindow(nativeImage: NativeImage, width: number, height: number): Promise<BrowserWindow> {
  const win = new BrowserWindow({
    width: width,
    height: height,

    frame: false,
    resizable: false,
    center: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    autoHideMenuBar: true,
    movable: false,

    webPreferences: {
      preload: __dirname + '/bridge.js',
      additionalArguments: ['--mode=capture']
    }
  });

  return openWindow(win, () => {
    win.webContents.send('set-image', nativeImage.toDataURL());
  }, true);
}

// [#] CLAUDE RESPONSE WINDOW

const CLAUDE_RESPONSE_WIDTH = 640;
const CLAUDE_RESPONSE_HEIGHT = 420;

export function createClaudeResponseWindow(payload: ClaudeResponsePayload): Promise<BrowserWindow> {
  const { bounds } = screen.getPrimaryDisplay();
  const x = bounds.x + Math.round((bounds.width - CLAUDE_RESPONSE_WIDTH) / 2);
  const y = bounds.y + Math.round((bounds.height - CLAUDE_RESPONSE_HEIGHT) / 2);

  const win = new BrowserWindow({
    width: CLAUDE_RESPONSE_WIDTH,
    height: CLAUDE_RESPONSE_HEIGHT,
    x,
    y,
    frame: false,
    resizable: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    autoHideMenuBar: true,
    movable: true,
    show: false,
    transparent: true,
    webPreferences: {
      sandbox: false,
      nodeIntegration: false,
      contextIsolation: true,
      preload: join(__dirname, './bridge.js'),
      additionalArguments: ['--mode=claude-response'],
    },
  });

  return openWindow(win, () => {
    win.webContents.send('claude-response-init', payload);
  });
}

// [#] COMMON

function openWindow(window: BrowserWindow, onLoad: () => void = () => {}, startHidden: boolean = false): Promise<BrowserWindow> {
  window.loadURL(
    isDev
      ? 'http://localhost:3000'
      : `file://${join(__dirname, '../build/index.html')}`
  );
  if (startHidden) {
    window.minimize();
    window.hide();
  }

  return new Promise(resolve => {
    window.webContents.on('did-finish-load', () => {
      onLoad();
      window.show();
      resolve(window);
    });
  });
}