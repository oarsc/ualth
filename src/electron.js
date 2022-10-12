const { app, BrowserWindow, ipcMain, globalShortcut, dialog } = require("electron");
const path = require("path");
const isDev = require("electron-is-dev");

const { config : { defaultHotkey }, error: loadError } = require('./back/config-load');
const { perform, performId, match, resolve } = require('./back/action-performer');

const DIMENSIONS = [800, 50];

// Conditionally include the dev tools installer to load React Dev Tools
let installExtension, REACT_DEVELOPER_TOOLS;

if (isDev) {
	const devTools = require("electron-devtools-installer");
	installExtension = devTools.default;
	REACT_DEVELOPER_TOOLS = devTools.REACT_DEVELOPER_TOOLS;
}

// Handle creating/removing shortcuts on Windows when installing/uninstalling
if (require("electron-squirrel-startup")) {
	app.quit();
}

function createWindow() {
	// Create the browser window.
	const win = new BrowserWindow({
		width: DIMENSIONS[0],
		height: DIMENSIONS[1],
		frame: false,
		resizable: false,
		center: true,
		alwaysOnTop: true,
		skipTaskbar: true,
		autoHideMenuBar: true,
		movable: false,
		transparent: true,
		webPreferences: {
			nodeIntegration: false, // is default value after Electron v5
			contextIsolation: true, // protect against prototype pollution
			enableRemoteModule: false, // turn off remote
			preload: path.join(__dirname, './bridge.js') // use bridge as a preload script
		}
	});

	// needed in some linux distributions
	win.setSkipTaskbar(true);
	win.setAlwaysOnTop(true);
	const [ x, y ] = win.getPosition();
	win.setPosition(x, y - 200);

	// and load the index.html of the app.
	win.loadURL(
		isDev
			? "http://localhost:3000"
			: `file://${path.join(__dirname, "../build/index.html")}`
	);

	//if (isDev) {
	//	win.webContents.openDevTools({ mode: "detach" });
	//}

	return win;
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {

	if (loadError) {
		dialog.showErrorBox('An error occurred and the app will close', loadError.stack);
		app.quit();
		return;
	}

	const win = createWindow();
	win.minimize();
	globalShortcut.register(defaultHotkey, () => {
		win.show();
		win.webContents.send('show');
	});

	win.on('blur', () => win.webContents.send('blur'));

	ipcMain.on('hide',    (event) => { win.minimize(); win.hide(); });
	ipcMain.on('height',  (event, arg) => win.setBounds({ height: arg, width: DIMENSIONS[0] }));
	ipcMain.on('perform', (event, arg, params) => event.returnValue = perform(arg, params));
	ipcMain.on('resolve', (event, arg) => event.returnValue = resolve(arg));
	ipcMain.on('find',    (event, arg) => event.returnValue = match(arg));
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
	app.quit();
});
