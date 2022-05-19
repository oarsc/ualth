const Command = require('./command');
const homedir = require('os').homedir();
const { spawn } = require("child_process");
const { paramsSplitter } = require('../common');

const PARAMS_REGEX = /\{(?:\*|\d+|\d*\:\d+|\d+\:)\}/g;

class RunnerCommand extends Command {
	static label = 'runner';

	constructor(data) {
		super();

		this.title = data.key;
		this.keyword = data.key;
		this.command = data.command;
		this.singleCommand = data.singleCommand;
		this.arguments = data.arguments;
		this.workingDir = data.workingDir;
		this.requiresParams = data.arguments?.match(PARAMS_REGEX)? true : false;
		this.icon = data.icon || 'terminal';
	}

	match(inputText) {
		const [ keyword ] = this.keyword.split(' ');
		const [ value, params ] = this.requiresParams
			? inputText.split(' ')
			: [ inputText ];

		return params === undefined
			? keyword.indexOf(value) === 0
			: keyword === value;
	}

	perform(argsList) {
		const options = { detached: true };

		if (this.workingDir) {
			options.cwd = this.workingDir.replace('~', homedir);
		}

		const [command, params] = !this.requiresParams
			? [this.command, this.arguments]
			: this.singleCommand && !argsList.length
				? [this.singleCommand, '']
				: [this.command, resolveArguments(this.arguments, argsList)];

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

module.exports = RunnerCommand;