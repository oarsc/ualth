const pluginLoader = require('../src/plugin/loader');
const { ipcRenderer } = require('electron');

const commands = ipcRenderer.sendSync('commands');
const replacer = ipcRenderer.sendSync('replacer');

module.exports.perform = (inputValue) => {
	const [keyword, ...args] = splitInput(inputValue);

	const action = commands[keyword];

	if (action !== undefined) {
		performAction(action, args);
	}
}

function performAction(action, args) {
	if (action === '_EXIT_')
		ipcRenderer.invoke('quit-app');

	else if (action === '_SETTINGS_')
		ipcRenderer.invoke('open-settings');

	else if (action.type) {
		const plugin = pluginLoader.findByType(action.type);
		plugin.perform(action, args, replacer);
	}
}


module.exports.matches = (keyword) => {
	if (keyword.indexOf(" ") < 0) {
		return Object.keys(commands).filter(key => key.indexOf(keyword) == 0);
	}
	return [];
}


function splitInput(inputValue) {
	const split = inputValue.split(' ');

	if (split[split.length-1] === '') {
		split.splice(-1);
		split[split.length-1] = split[split.length-1]+' ';
	}

	return split.filter(a => a);
}