const Plugin = require('./plugin');
const { shell } = require('electron');

class SearchEnginePlugin extends Plugin {
	keyName = 'searchEngines'
	type = 'SEAENG';

	load() {
		this.generateCommandDefinitions((data) => ({
			... data,
			id: `${this.type}_${data.key}`,
			requiresParams: true,
		}));
	}

	perform(entry, args) {
		const queryValue = encodeURIComponent(args.join(' '));
		const result = entry.url.replace('{q}', queryValue);
		shell.openExternal(result);
	}
}

module.exports = SearchEnginePlugin;