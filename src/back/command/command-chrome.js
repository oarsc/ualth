const Command = require('./command');
const homedir = require('os').homedir();
const fs = require('fs');
const { shell } = require('electron');
const { spawn } = require("child_process");
const { search } = require('../search/search-service');
const { SEARCH_LEVEL } = require('../search/search-model');

const WIN_PATHS = [
	'~/AppData/Local/Google/Chrome/User Data/Default/Bookmarks'
];
const LINUX_PATHS = [
	'~/.config/google-chrome/Default/',
	'~/.config/chromium/Default/Bookmarks',
];


class ChromeCommand extends Command {
	static label = 'chromeBookmarks';
	static path = '';

	constructor(data) {
		super();
		this.caseInsensitive = true;
		this.startWith = false;

		this.title = data.name;
		this.keyword = data.name;
		this.url = data.url;
		this.icon = data.iconuri || data.iconUri || 'chrome';
	}

	static parseDefinitions(data) {
		ChromeCommand.path = data.path;

		const paths = data.bookmarkFile? [data.bookmarkFile] : (win => win? WIN_PATHS : LINUX_PATHS)(process.platform === 'win32');
		const files = paths
			.map(path => path.replace('~', homedir))
			.filter(path => fs.existsSync(path));


		if (!files.length) {
			return [];
		}

		try {
			return files
				.map(file => fs.readFileSync(file, 'utf-8'))
				.map(content => Object.values(JSON.parse(content).roots))
				.flatMap(content => flatBookmarks(content));

		} catch (e) {
			console.log(e);
			return [];
		}
	}

	match(inputText) {
		const keyLevel = search(this.keyword, inputText, true)
		return keyLevel === SEARCH_LEVEL.NOT_MATCH
			? search(this.url, inputText, true, false)
			: keyLevel;
	}

	perform() {
		if (ChromeCommand.path) {
			spawn(ChromeCommand.path, [this.url], { detached: true });
		} else {
			shell.openExternal(this.url);
		}
	}
}

function flatBookmarks(bookmarks) {
	const children = bookmarks
		.filter(b => b.type === 'folder')
		.flatMap(b => flatBookmarks(b.children));

	return bookmarks.filter(b => b.type === 'url').concat(children);
}

module.exports = ChromeCommand;