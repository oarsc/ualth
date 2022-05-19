const { config : { autocomplete} , commands } = require('./config-load');
const { paramsSplitter } = require('./common');

module.exports.match = inputText => {
	return commands
		.filter(command => command.match(inputText))
		.sort((co1, co2) => {
			const is1 = keyStartsWith(co1, inputText);
			const is2 = keyStartsWith(co2, inputText);
			return is1? (is2? 0 : -1) : (is2? 1 : 0);
		});
}

module.exports.perform = (id, input) => {
	const [ command ] = commands.filter(command => command.id === id)

	if (command) {
		command.perform(input.split(' ').slice(1))
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


function keyStartsWith(command, inputText) {
	const key = command.requiresParams
		? inputText.split(' ')[0]
		: inputText;

	return command.caseInsensitive
		? command.keyword.toLowerCase().indexOf(key.toLowerCase()) === 0
		: command.keyword.indexOf(key) === 0;
}
