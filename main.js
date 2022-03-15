const { app, BrowserWindow, ipcMain, globalShortcut } = require('electron');
const path = require('path')

function openSettings() {
	const win = new BrowserWindow({
		width: 800,
		height: 600,
		webPreferences: {
			preload: path.join(__dirname, 'src/preload.js'),
		},
	});

	win.loadFile('view/settings.html');
	return win;
}

function openLauncher() {
	const win = new BrowserWindow({
		width: 800,
		height: 50,
		frame: false,
		//resizable: false,
		center: true,
		alwaysOnTop: true,
		skipTaskbar: true,
		autoHideMenuBar: true,
		movable: false,
		transparent: true,
		webPreferences: {
			preload: path.join(__dirname, 'src/launcher.js'),
		},
	});

	// needed in some linux distributions
	win.setSkipTaskbar(true);
	win.setAlwaysOnTop(true);

	win.loadFile('view/main.html');
	return win;
}

app.whenReady().then(() => {
    globalShortcut.register('Alt+Space', openLauncher);
});

// Do nothing when all windows are closed.
app.on('window-all-closed', () => {});

let settingsWindow;
ipcMain.handle('open-settings', () => {
	if (settingsWindow) {
		settingsWindow.show();
		return;
	}

	settingsWindow = openSettings();
	settingsWindow.on('close', () => settingsWindow = undefined);
});

ipcMain.handle('quit-app', () => {
	app.quit();
});