const Plugin = require('./plugin');
const homedir = require('os').homedir();
const { spawn } = require("child_process");
const { paramsSplitter } = require('../common');

const PARAMS_REGEX = /\{(?:\*|\d+|\d*\:\d+|\d+\:)\}/g;

class RunnerPlugin extends Plugin {
	keyName = 'runner'
	type = 'RUN';

	load() {
		this.generateCommandDefinitions((data) => ({
			... data,
			title: data.key,
			id: `${this.type}_${data.key}`,
			requiresParams: data.arguments?.match(PARAMS_REGEX)? true : false,
			icon: data.icon || 'terminal',
		}));
	}

	perform(entry, args) {
		const options = { detached: true };

		if (entry.workingDir) {
			options.cwd = entry.workingDir.replace('~', homedir);
		}

		const params = entry.requiresParams
			? resolveArguments(entry.arguments, args)
			: entry.arguments;

		spawn(entry.command, paramsSplitter(params), options);
	}
}


function resolveArguments(definition, userInput) {
	return definition.match(PARAMS_REGEX)
		.map(s => {
			const range = s.slice(1, -1);

			if (range === '*' ||  range === ':')
				return [s, userInput.join(' ')];

			if (range.indexOf(':') < 0)
				return [s, userInput[range]];

			const [ firstIndex, secondIndex ] = range.split(':');

			if (firstIndex) {
				return secondIndex
					? [s, userInput.slice(firstIndex, secondIndex).join(' ')]
					: [s, userInput.slice(firstIndex).join(' ')]
			} else if (secondIndex) {
				return [s, userInput.slice(0, secondIndex).join(' ')]
			}
		})
		.reduce((finalResult, [ initialValue, replacement ]) => 
			finalResult.replace(initialValue, replacement.replace(/(\"|\')/g,"\\$1")),
			definition);
}

module.exports = RunnerPlugin;