const Plugin = require('./plugin');
const homedir = require('os').homedir();
const jsonlz4 = require('jsonlz4-decompress');
const fs = require('fs');
const { shell } = require('electron');


class FirefoxPlugin extends Plugin {
	keyName = 'firefoxBookmarks'
	type = 'FIRBOO';
	caseInsensitive = true;
	startWith = false;

	load() {
		this.generateCommandDefinitions((data) => {
			const dir = data.replace('~', homedir);

			return fs.readdirSync(dir)
				.sort()
				.slice(-1)
				.flatMap(file => {
					const fileBuffer = fs.readFileSync(dir+file);
					const decompressedJson = jsonlz4(fileBuffer);
					return recollect(decompressedJson.children);
				})
				.filter(bm => bm.title)
				.map(bm => ({
					title: bm.title,
					key: bm.title,
					url: bm.uri,
					id: bm.guid
				}));
		});
	}

	perform(entry) {
		shell.openExternal(entry.url);
	}
}

function recollect(json) {
	return [
		...json.filter(j => j.type === 'text/x-moz-place'),
		...json.filter(j => j.children).flatMap(j => recollect(j.children))
	];
}

module.exports = FirefoxPlugin;