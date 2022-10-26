const { config : { resolve } , commands } = require('./config-load');
const { SEARCH_LEVEL : { NOT_MATCH } } = require('./search/search-model');
const { sortSearchResults } = require('./search/search-service');

module.exports.match = inputText => {
	const results = commands
		.map(command => ({ value: command, level: command.match(inputText) }))
		.filter(({ level }) => level !== NOT_MATCH );

	return sortSearchResults(results);
}

module.exports.perform = (id, input) => {
	const [ command ] = commands.filter(command => command.id === id);

	if (command) {
		command.perform(input.split(' ').slice(1));
		return command;
	}
}

module.exports.resolve = value => {
	for (const resolveKey in resolve) {
		if (resolveKey === value) {
			return resolve[resolveKey];
		}
	}
	return value;
}
