const Plugin = require('./plugin');
const { shell } = require('electron');

class SearchEnginePlugin extends Plugin {
	keyName = 'searchEngines'
	type = 'SEAENG';

	match(definition, inputText) {
		if (definition.type !== this.type)
			return false;

		const [ key ] = definition.key.split(' ');
		const [ value, params ] = inputText.split(' ');

		return params === undefined
			? key.indexOf(value) === 0
			: key === value;
	}

	load() {
		this.generateCommandDefinitions((data) => ({
			... data,
			//id: `${this.type}_${data.key}`,
			requiresParams: true,
			icon: data.icon || 'search-engine',
		}));
	}

	perform(entry, argsList) {
		if (entry.rootUrl && !argsList.length) {
			shell.openExternal(entry.rootUrl);	

		} else {
			const queryValue = encodeURIComponent(argsList.join(' '));
			const result = entry.url.replace('{q}', queryValue);
			shell.openExternal(result);
		}
	}
}

module.exports = SearchEnginePlugin;