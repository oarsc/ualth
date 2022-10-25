const Command = require('./command');
const homedir = require('os').homedir();
const { spawn } = require("child_process");
const { paramsSplitter } = require('../common');
const { SEARCH_LEVEL } = require('../search/search-model');
const { search } = require('../search/search-service');

const PARAMS_REGEX = /\{(?:\*|\d+|\d*\:\d+|\d+\:)\}/g;

class RunnerCommand extends Command {
	static label = 'runner';

	constructor(data) {
		super();

		this.title = data.key;
		this.keyword = data.key;
		this.command = data.command;
		this.noParams = data.noParams;
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

		const found = params === undefined
			? search(keyword, value) === SEARCH_LEVEL.STARTING
			: keyword === value;

		return found? SEARCH_LEVEL.STARTING : SEARCH_LEVEL.NOT_MATCH;
	}

	perform(argsList) {
		const options = { detached: true };

		if (this.workingDir) {
			options.cwd = this.workingDir.replace('~', homedir);
		}

		const [command, params] = (({requiresParams, command, arguments:args, noParams}) => {
			if (requiresParams) {
				if (noParams && !argsList.length)
					return [noParams.command, noParams.arguments ?? ''];
				return [command, resolveArguments(args, argsList)];
			}
			return [command, args];
		})(this);

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