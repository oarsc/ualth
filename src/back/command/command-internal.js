const Command = require('./command');
const { app } = require("electron");

const LITERALS = {
	'_EXIT_': 'Exits ualth',
	'_RELOAD_': 'Reloads ualth configuration',
};

class InternalCommand extends Command {
	static label = 'internalCommands';

	constructor(data) {
		super();

		this.command = data.command;
		this.keyword = data.key;
		this.title = LITERALS[data] ?? data.key;
		this.icon = 'ualth';
	}

	static parseDefinitions(data) {
		return Object.keys(data).map(key => ({
				key: key,
				command: data[key]
			}));
	}

	perform() {
		if (this.command === '_EXIT_') {
			app.quit();

		} else if (this.command === '_RELOAD_') {
			app.relaunch();
			app.exit();
		}
	}
}

module.exports = InternalCommand;