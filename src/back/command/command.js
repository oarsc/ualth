const { SEARCH_LEVEL } = require("../search/search-model");
const { search } = require("../search/search-service");

class Command {

	static setParams(config, commands) {
		Command.config = config;
		Command.commands = commands;
	}

	constructor() {
		this.id = Math.random().toString().substring(2);
		this.keyName = this.constructor.label;
		this.caseInsensitive = false;
		this.startWith = true;

		if (!this.keyName) {
			throw new Error("Label must be created for new command: "+this.constructor.name)
		}
	}

	getCommands(funct) {
		funct(Command.commands);
	}

	static parseDefinitions(data) {
		return [ data ];
	}

	match(inputText) {
		const { keyword, caseInsensitive, startWith, title } = this;

		const value = this.requiresParams
			? inputText.split(' ')[0]
			: inputText;

		if (!value.length) {
			return { level: SEARCH_LEVEL.NOT_FOUND };
		}

		if (startWith) {
			const searchResult = search(keyword, value, caseInsensitive, false, title === keyword);
			return searchResult.level === SEARCH_LEVEL.STARTING
				? searchResult
				: { level: SEARCH_LEVEL.NOT_FOUND };
		}
		
		return search(keyword, value, true, true, title === keyword);
	}

	cleanCommand(command) {
		if (command === '__DEFAULT__')             return Command.config.default.command;
		if (command === '__DEFAULT_TEXT_EDITOR__') return Command.config.default.textEditorCommand;
		return command;
	}
}

module.exports = Command;
