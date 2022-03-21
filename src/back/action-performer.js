const { commands } = require('./config-load');
const pluginLoader = require('./plugin/loader');
const { paramsSplitter } = require('./common');

module.exports.match = inputText => {
	return commands
		.filter(commandDef => {
			const plugin = pluginLoader.findByType(commandDef.type);
			return plugin.match(commandDef, inputText);
		})
		.sort((co1, co2) => {
			const is1 = keyStartsWith(co1, inputText);
			const is2 = keyStartsWith(co2, inputText);
			return is1? (is2? 0 : -1) : (is2? 1 : 0);
		});
}

module.exports.perform = inputValue => {
	const firstSpace = inputValue.indexOf(' ');
	const keyword = inputValue.slice(0, firstSpace);
	const args = paramsSplitter(inputValue.slice(firstSpace).trim());

	const [ action ] = commands
		.filter(commandDef => commandDef.requiresParams && commandDef.key == keyword && args.length);

	if (action) {
		performAction(action, args);
		return true;
	}
	return false;
}

module.exports.performId = id => {
	const [ action ] = commands
		.filter(commandDef => !commandDef.requiresParams && commandDef.id === id)

	if (action) {
		performAction(action);
		return true;
	}
	return false;
}


function keyStartsWith(commandDef, inputText) {
	const plugin = pluginLoader.findByType(commandDef.type);

	const key = commandDef.requiresParams
		? inputText.split(' ')[0]
		: inputText;

	return plugin.caseInsensitive
		? commandDef.key.toLowerCase().indexOf(key.toLowerCase()) === 0
		: commandDef.key.indexOf(key) === 0;
}

function performAction(action, args) {
	if (action.type) {
		const plugin = pluginLoader.findByType(action.type);
		plugin.perform(action, args);
	}
}
