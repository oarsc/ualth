const Command = require('./command');
const homedir = require('os').homedir();
const jsonlz4 = require('jsonlz4-decompress');
const fs = require('fs');
const { shell } = require('electron');


class FirefoxCommand extends Command {
	static label = 'firefoxBookmarks';

	constructor(data) {
		super();
		this.caseInsensitive = true;
		this.startWith = false;

		this.title = data.title;
		this.keyword = data.title;
		this.url = data.uri;
		this.icon = data.icon || 'firefox';
	}

	static parseDefinitions(data) {
		const dir = data.replace('~', homedir);

		return fs.readdirSync(dir)
			.sort()
			.slice(-1)
			.flatMap(file => {
				const fileBuffer = fs.readFileSync(dir+file);
				const decompressedJson = jsonlz4(fileBuffer);
				return recollect(decompressedJson.children);
			})
			.filter(bm => bm.title);
	}

	match(inputText) {
		const text = inputText.toLowerCase();
		const key = this.keyword.toLowerCase();
		const url = this.url.toLowerCase();

		return key.indexOf(text) >= 0 || url.indexOf(text) >= 0;
	}

	perform() {
		shell.openExternal(this.url);
	}
}

function recollect(json) {
	return [
		...json.filter(j => j.type === 'text/x-moz-place'),
		...json.filter(j => j.children).flatMap(j => recollect(j.children))
	];
}

module.exports = FirefoxCommand;