const Plugin = require('./plugin');
const homedir = require('os').homedir();
const { spawn } = require("child_process");
const { paramsSplitter } = require('../common');

const PARAMS_REGEX = /\{(?:\*|\d+|\d*\:\d+|\d+\:)\}/g;

class RunnerPlugin extends Plugin {
	keyName = 'runner'
	type = 'RUN';

	match(definition, inputText) {
		if (definition.type !== this.type)
			return false;

		const [ key ] = definition.key.split(' ');
		const [ value, params ] = definition.requiresParams
			? inputText.split(' ')
			: [ inputText ];

		return params === undefined
			? key.indexOf(value) === 0
			: key === value;
	}

	load() {
		this.generateCommandDefinitions((data) => ({
			... data,
			title: data.key,
			//id: `${this.type}_${data.key}`,
			requiresParams: data.arguments?.match(PARAMS_REGEX)? true : false,
			icon: data.icon || 'terminal',
		}));
	}

	perform(entry, argsList) {
		const options = { detached: true };

		if (entry.workingDir) {
			options.cwd = entry.workingDir.replace('~', homedir);
		}

		const [command, params] = !entry.requiresParams
			? [entry.command, entry.arguments]
			: entry.singleCommand && !argsList.length
				? [entry.singleCommand, '']
				: [entry.command, resolveArguments(entry.arguments, argsList)];

		spawn(this.cleanCommand(command), paramsSplitter(params), options);
	}
}


function resolveArguments(definition, argsList) {
	return argsList.length == 0
		? definition
		: definition.match(PARAMS_REGEX)
		.map(s => {
			const range = s.slice(1, -1);

			if (range === '*' ||  range === ':')
				return [s, argsList.join(' ')];

			if (range.indexOf(':') < 0)
				return [s, argsList[range]];

			const [ firstIndex, secondIndex ] = range.split(':');

			if (firstIndex) {
				return secondIndex
					? [s, argsList.slice(firstIndex, secondIndex).join(' ')]
					: [s, argsList.slice(firstIndex).join(' ')]
			} else if (secondIndex) {
				return [s, argsList.slice(0, secondIndex).join(' ')]
			}
		})
		.reduce((finalResult, [ initialValue, replacement ]) => 
			finalResult.replace(initialValue, replacement.replace(/(\"|\')/g,"\\$1")),
			definition);
}

module.exports = RunnerPlugin;