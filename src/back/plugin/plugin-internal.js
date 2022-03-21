const Plugin = require('./plugin');
const { app } = require("electron");

const LITERALS = {
	'_EXIT_': 'Exits ualth',
	'_RELOAD_': 'Reloads ualth configuration',
};

class SearchEnginePlugin extends Plugin {
	keyName = 'internalCommands'
	type = 'INT';

	load() {
		this.generateCommandDefinitions((data, key) => ({
			command: data,
			id: `${this.type}_${data}`,
			title: LITERALS[data] ?? key
		}));
	}

	perform(entry) {
		if (entry.command === '_EXIT_') {
			app.quit();

		} else if (entry.command === '_RELOAD_') {
			app.relaunch();
			app.exit();
		}
	}
}

module.exports = SearchEnginePlugin;