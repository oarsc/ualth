
class Command {

	static setParams(config, commands) {
		Command.config = config;
		Command.commands = commands;
	}

	constructor() {
		this.id = Math.random().toString().substr(2);
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
		let keyword = this.keyword;
		let value = this.requiresParams
			? inputText.split(' ')[0]
			: inputText;

		if (this.caseInsensitive) {
			keyword = keyword.toLowerCase();
			value = value.toLowerCase();
		}

		return this.startWith
			? keyword.indexOf(value) === 0
			: keyword.indexOf(value) >= 0;
	}

	cleanCommand(command) {
		if (command === '__DEFAULT__')             return Command.config.default.command;
		if (command === '__DEFAULT_TEXT_EDITOR__') return Command.config.default.textEditorCommand;
		return command;
	}
}

module.exports = Command;
