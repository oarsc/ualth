const { BrowserWindow } = require('electron');
const path = require('path');

module.exports = {
	openSettings: () => {
		const win = new BrowserWindow({
			width: 800,
			height: 600,
			webPreferences: {
				preload: path.join(__dirname, '../src-front/settings.js'),
			},
		});

		win.loadFile('view/settings.html');
		return win;
	},

	openLauncher: () => {
		const win = new BrowserWindow({
			width: 800,
			height: 50,
			frame: false,
			resizable: false,
			center: true,
			alwaysOnTop: true,
			skipTaskbar: true,
			autoHideMenuBar: true,
			movable: false,
			transparent: true,
			webPreferences: {
				preload: path.join(__dirname, '../src-front/launcher.js'),
			},
		});

		// needed in some linux distributions
		win.setSkipTaskbar(true);
		win.setAlwaysOnTop(true);
		const [ x, y ] = win.getPosition();
		win.setPosition(x, y - 200);
		win.loadFile('view/main.html');
		return win;
	},
}
