const { app, BrowserWindow } = require('electron');
const path = require('path')

function createWindow() {
	const win = new BrowserWindow({
		width: 800,
		height: 600,
		webPreferences: {
			preload: path.join(__dirname, 'view/preload.js'),
		},
	});

	win.loadFile('view/index.html');
}

app.whenReady().then(() => {
	createWindow();

    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
	app.on('activate', () => {
		if (!BrowserWindow.getAllWindows().length)
			createWindow();
	})
});

app.on('window-all-closed', () => {
	// Quit when all windows are closed, except on macOS.
	if (process.platform != 'darwin')
		app.quit();
});