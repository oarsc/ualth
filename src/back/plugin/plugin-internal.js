const Plugin = require('./plugin');
const { app } = require("electron");

class SearchEnginePlugin extends Plugin {
	keyName = 'internalCommands'
	type = 'INT';

	load() {
		this.join((data) => ({
			command: data,
			id: `${this.type}_${data}`
		}));
	}

	perform(entry) {
		if (entry.command === '_EXIT_') {
			app.quit();
		}
	}
}

module.exports = SearchEnginePlugin;