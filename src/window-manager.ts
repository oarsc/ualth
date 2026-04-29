import { BrowserWindow, NativeImage, screen } from 'electron';
import { join } from 'path';
import isDev from 'electron-is-dev';
import { ClaudeResponsePayload, NotificationPayload } from './shared-models/models';

const NOTIFICATION_WIDTH = 320;
const NOTIFICATION_HEIGHT = 90;
const NOTIFICATION_MARGIN = 20;

const CLAUDE_RESPONSE_WIDTH = 640;
const CLAUDE_RESPONSE_HEIGHT = 420;

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

export function createNotificationWindow(payload: NotificationPayload): Promise<BrowserWindow> {
  const { bounds } = screen.getPrimaryDisplay();
  const x = bounds.x + bounds.width - NOTIFICATION_WIDTH - NOTIFICATION_MARGIN;
  const y = bounds.y + bounds.height - NOTIFICATION_HEIGHT - NOTIFICATION_MARGIN;

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

  return openWindow(win, () => {
    win.webContents.send('show-notification', payload);
  });
}

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

function openWindow(window: BrowserWindow, onLoad: () => void, startHidden: boolean = false): Promise<BrowserWindow> {
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