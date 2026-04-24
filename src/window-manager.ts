import { BrowserWindow, NativeImage, screen } from 'electron';
import { join } from 'path';
import isDev from 'electron-is-dev';
import { NotificationPayload } from './shared-models/models';

export function createCaptureWindow(nativeImage: NativeImage, width: number, height: number) {
  const window = new BrowserWindow({
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

  window.loadURL(
    isDev
      ? "http://localhost:3000"
      : `file://${join(__dirname, "../build/index.html")}`
  );
	window.minimize();
	window.hide();
  //secondWindow.loadFile('public/index.html');

  window.webContents.on('did-finish-load', () => {
    window.webContents.send('set-image', nativeImage.toDataURL());
    window.show();
  });
}

const NOTIFICATION_WIDTH = 320;
const NOTIFICATION_HEIGHT = 90;
const NOTIFICATION_MARGIN = 20;

export function createNotificationWindow(payload: NotificationPayload): BrowserWindow {
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

  win.loadURL(
    isDev
      ? 'http://localhost:3000'
      : `file://${join(__dirname, '../build/index.html')}`
  );

  win.webContents.on('did-finish-load', () => {
    win.webContents.send('show-notification', payload);
    win.show();
  });

  return win;
}