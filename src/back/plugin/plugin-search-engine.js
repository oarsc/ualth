const Plugin = require('./plugin');
const { shell } = require('electron');

class SearchEnginePlugin extends Plugin {
	keyName = 'searchEngines'
	type = 'SEAENG';

	load(config) {
		this.join((data, entry) => {
			entry.url = data;
		});
	}

	perform(entry, args) {
		this.replace(args);
		const queryValue = encodeURIComponent(args.join(' '));
		let result = entry.url.replace('{q}', queryValue);
		shell.openExternal(result);
	}
}

module.exports = SearchEnginePlugin;