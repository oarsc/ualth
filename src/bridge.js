const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
	'ipcRenderer', {
		send: (channel, data) => {
			const validChannels = ['hide', 'height'];
			if (validChannels.includes(channel)) {
				ipcRenderer.send(channel, data);
			}
		},
		sendSync: (channel, data) => {
			const validChannels = ['find', 'perform', 'performId'];
			if (validChannels.includes(channel)) {
				return ipcRenderer.sendSync(channel, data);
			}
		},
		receive: (channel, func) => {
			const validChannels = ['show', 'blur'];
			if (validChannels.includes(channel)) {
				// Deliberately strip event as it includes `sender` 
				ipcRenderer.on(channel, (event, ...args) => func(...args));
			}
		}
	}
);
