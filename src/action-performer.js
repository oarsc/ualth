const { ipcRenderer } = require('electron');


module.exports.perform = (inputValue) => {
	if (inputValue == 'settings') {
		ipcRenderer.invoke('open-settings');

	} else if (inputValue == 'exit') {
		ipcRenderer.invoke('quit-app');

	}
}