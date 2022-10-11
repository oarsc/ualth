const Command = require('./command');
const homedir = require('os').homedir();
const jsonlz4 = require('jsonlz4-decompress');
const fs = require('fs');
const { shell } = require('electron');
const { spawn } = require("child_process");

const WIN_PATH = '~/AppData/Roaming/Mozilla/Firefox/Profiles/';
const LINUX_PATH = '~/.mozilla/firefox/';


class FirefoxCommand extends Command {
	static label = 'firefoxBookmarks';
	static path = '';

	constructor(data) {
		super();
		this.caseInsensitive = true;
		this.startWith = false;

		this.title = data.title;
		this.keyword = data.title;
		this.url = data.uri;
		this.icon = data.iconuri || data.iconUri || 'firefox';
		this.profile = data.profile;
	}

	static parseDefinitions(data) {
		FirefoxCommand.path = data.path;

		const path = data.profileFolder || (win => win? WIN_PATH : LINUX_PATH)(process.platform === 'win32');
		const dir = path.replace('~', homedir);

		if (!fs.existsSync(dir)) {
			return [];
		}

		return fs.readdirSync(dir)
			.filter(profile => filterExcludes(profile, data.exclude))
			.filter(profile => fs.existsSync(`${dir}/${profile}/bookmarkbackups/`))
			.flatMap(profile =>
				fs.readdirSync(`${dir}/${profile}/bookmarkbackups/`)
					.sort()
					.slice(-1)
					.map(file => fs.readFileSync(`${dir}/${profile}/bookmarkbackups/${file}`))
					.flatMap(fileBuffer => recollect(jsonlz4(fileBuffer).children))
					.map(bookmark => ({ ...bookmark, profile: getProfileName(profile)}))
			)
			.filter(bookmark => bookmark.title);
	}

	match(inputText) {
		const text = inputText.toLowerCase();
		const key = this.keyword.toLowerCase();
		const url = this.url.toLowerCase();

		return key.indexOf(text) >= 0 || url.indexOf(text) >= 0;
	}

	perform() {
		if (FirefoxCommand.path) {
			spawn(FirefoxCommand.path, ['-p', this.profile, this.url], { detached: true });
		} else {
			shell.openExternal(this.url);
		}
	}
}

function recollect(json) {
	return [
		...json.filter(j => j.type === 'text/x-moz-place'),
		...json.filter(j => j.children).flatMap(j => recollect(j.children))
	];
}

function filterExcludes(profile, excludes) {
	if (excludes) {
		return excludes.indexOf(getProfileName(profile)) < 0;
	}
	return true;
}

function getProfileName(profile) {
	const [code, ...name] = profile.split('.');
	return name.join('.');
}

module.exports = FirefoxCommand;