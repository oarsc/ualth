const { commands } = require('./config-load');
const pluginLoader = require('./plugin/loader');

module.exports.match = inputText => {
	return commands
		.filter(command => {
			const text = command.requiresParams
				? inputText.split(' ')[0]
				: inputText;

			const key = command.key;
			if (command.caseInsensitive) {
				return key.toLowerCase().indexOf(text.toLowerCase()) >= 0;
			} else {
				return key.indexOf(text) === 0;
			}
		})
		.sort((co1, co2) => {
			const is1 = keyStartsWith(co1, inputText);
			const is2 = keyStartsWith(co2, inputText);
			return is1? (is2? 0 : -1) : (is2? 1 : 0);
		});
}

module.exports.perform = inputValue => {
	const [ keyword, ...args ] = splitInput(inputValue);
	const [ action ] = commands
		.filter(command => command.requiresParams && command.key == keyword && args.length);

	if (action) {
		performAction(action, args);
		return true;
	}
	return false;
}

module.exports.performId = id => {
	const [ action ] = commands
		.filter(command => !command.requiresParams && command.id === id)

	if (action) {
		performAction(action);
		return true;
	}
	return false;
}


function keyStartsWith(command, inputText) {
	const key = command.requiresParams
		? inputText.split(' ')[0]
		: inputText;

	return command.caseInsensitive
		? command.key.toLowerCase().indexOf(key.toLowerCase()) === 0
		: command.key.indexOf(key) === 0;
}

function performAction(action, args) {
	if (action.type) {
		const plugin = pluginLoader.findByType(action.type);
		plugin.perform(action, args);
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
