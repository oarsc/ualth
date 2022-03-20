const Plugin = require('./plugin');
const { shell } = require('electron');

class SearchEnginePlugin extends Plugin {
	keyName = 'searchEngines'
	type = 'SEAENG';

	load() {
		this.join((data) => ({
			url: data,
			id: `${this.type}_${data}`,
			requiresParams: true,
		}));
	}

	perform(entry, args) {
		this.replace(args);
		const queryValue = encodeURIComponent(args.join(' '));
		const result = entry.url.replace('{q}', queryValue);
		shell.openExternal(result);
	}
}

module.exports = SearchEnginePlugin;