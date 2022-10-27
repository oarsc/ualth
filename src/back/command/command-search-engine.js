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

		if (params === undefined) {
			const searchResult = search(keyword, value, false, false, false);
			if (searchResult.level === SEARCH_LEVEL.STARTING) {
				return searchResult;
			}
		} else if (keyword === value) {
			return {
				level: SEARCH_LEVEL.STARTING,
				matchingIndexes: [],
			};
		}

		return { level: SEARCH_LEVEL.NOT_FOUND };
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