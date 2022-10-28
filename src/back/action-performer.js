const { config : { resolve } , commands } = require('./config-load');
const { saveHistory, searchHistory } = require('./history/history-service');
const { SEARCH_LEVEL : { NOT_FOUND }, SEARCH_LEVEL } = require('./search/search-model');
const { sortSearchResults } = require('./search/search-service');

module.exports.match = inputText => {
	const results = commands
		.map(command => ({ value: { ...command, id: command.id}, ...command.match(inputText) }))
		.filter(({ level }) => level !== NOT_FOUND );

	const historic = searchHistory(inputText);
	historic.filter(command => !command.value.requiresParams)
		.forEach(command => {
			results.every(com => {
				if (command.value.id === com.value.id) {
					com.priority = command.priority;
					return false;
				}
				return true;
			})
		})

	return sortSearchResults(results);
}

module.exports.perform = (id, input) => {
	const [ command ] = commands.filter(command => command.id === id);

	if (command) {
		command.perform(input.split(' ').slice(1));
		saveHistory(command, input);
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
