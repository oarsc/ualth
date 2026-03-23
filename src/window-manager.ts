import { BrowserWindow, NativeImage } from 'electron';
import { join } from 'path';
import isDev from 'electron-is-dev';

export function createCaptureWindow(nativeImage: NativeImage, width: number, height: number, callback: () => string) {
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