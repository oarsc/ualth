const common = require('./common-plugins');
const shell = require('electron').shell;

const TYPE = 'SEARCH_ENGINE';

module.exports = {
	type: TYPE,
	load: config => {
		common.join(config, 'searchEngines', TYPE, (data, entry) => {
			entry.url = data;
		});
	},
	perform: (entry, args, replacer) => {
		common.replace(args, replacer);
		const queryValue = encodeURIComponent(args.join(' '));
		let result = entry.url.replace('{q}', queryValue);
		shell.openExternal(result);
	}
};