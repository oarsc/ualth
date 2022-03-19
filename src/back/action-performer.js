const { app } = require('electron');
const { commands, replace : replacer } = require('./config-load');
const pluginLoader = require('./plugin/loader');

module.exports.perform = (inputValue) => {
	const [keyword, ...args] = splitInput(inputValue);

	const action = commands[keyword];

	if (action !== undefined) {
		performAction(action, args);
	}
}

function performAction(action, args) {
	if (action === '_EXIT_')
		app.quit();

	else if (action.type) {
		const plugin = pluginLoader.findByType(action.type);
		plugin.perform(action, args, replacer);
	}
}

function splitInput(inputValue) {
	const split = inputValue.split(' ');

	if (split[split.length-1] === '') {
		split.splice(-1);
		split[split.length-1] = split[split.length-1]+' ';
	}

	return split.filter(a => a);
}
