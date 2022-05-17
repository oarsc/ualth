const { commands, autocomplete } = require('./config-load');
const pluginLoader = require('./plugin/loader');
const { paramsSplitter } = require('./common');

module.exports.match = inputText => {
	return commands
		.filter(commandDef => {
			const plugin = pluginLoader.findByType(commandDef.type);
			return commandDef.type === plugin.type && plugin.match(commandDef, inputText);
		})
		.sort((co1, co2) => {
			const is1 = keyStartsWith(co1, inputText);
			const is2 = keyStartsWith(co2, inputText);
			return is1? (is2? 0 : -1) : (is2? 1 : 0);
		});
}

module.exports.perform = (id, input) => {
	const [ action ] = commands.filter(def => def.id === id)

	if (action) {
		performAction(action, input.split(' ').slice(1));
		return true;
	}
	return false;
}

module.exports.autocomplete = value => {
	for (const autocompleteKey in autocomplete) {
		if (autocompleteKey === value) {
			return autocomplete[autocompleteKey];
		}
	}
	return value;
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
