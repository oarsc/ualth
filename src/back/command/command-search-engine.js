const Command = require('./command');
const { shell } = require('electron');
const { SEARCH_LEVEL } = require('../search/search-model');
const { search } = require('../search/search-service');

class SearchEngineCommand extends Command {
	static label = 'searchEngines';

	constructor(data) {
		super();

		this.keyword = data.key;
		this.title = data.title;
		this.url = data.url;
		this.rootUrl = data.rootUrl;
		this.requiresParams = true;
		this.icon = data.icon || 'search-engine';
	}

	match(inputText) {
		const [ keyword ] = this.keyword.split(' ');
		const [ value, params ] = inputText.split(' ');

		const found = params === undefined
			? search(keyword, value, false, false) === SEARCH_LEVEL.STARTING
			: keyword === value;

		return found? SEARCH_LEVEL.STARTING : SEARCH_LEVEL.NOT_MATCH;
	}

	perform(argsList) {
		if (this.rootUrl && !argsList.length) {
			shell.openExternal(this.rootUrl);	

		} else {
			const queryValue = encodeURIComponent(argsList.join(' '));
			const result = this.url.replace('{q}', queryValue);
			shell.openExternal(result);
		}
	}
}

module.exports = SearchEngineCommand;