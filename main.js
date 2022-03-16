const { app, ipcMain, globalShortcut } = require('electron');
const path = require('path');

const { openLauncher, openSettings } = require('./src/window-definitions');
const config = require('./src/config-load');

// set hotkey
app.whenReady().then(() => {
	globalShortcut.register(config.defaultHotkey, () => openLauncher());
});

// Do nothing when all windows are closed.
app.on('window-all-closed', () => {});

// set ipc events
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


ipcMain.on('commands', (event, arg) => {
	event.returnValue = config.commands;
});
ipcMain.on('replacer', (event, arg) => {
	event.returnValue = config.replace;
});
