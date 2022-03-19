const Plugin = require('./plugin');
const { app } = require("electron");

class SearchEnginePlugin extends Plugin {
	keyName = 'internalCommands'
	type = 'INT';

	load(config) {
		this.join((data, entry) => {
			entry.command = data;
		});
	}

	perform(entry, args) {
		if (entry.command === '_EXIT_') {
			app.quit();
		}
	}
}

module.exports = SearchEnginePlugin;