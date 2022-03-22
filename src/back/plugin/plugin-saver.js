const Plugin = require('./plugin');
const homedir = require('os').homedir();
const fs = require('fs');
const { clipboard, shell } = require('electron')

class SaverPlugin extends Plugin {
	keyName = 'infoSaver'
	type = 'SAV';

	load() {
		const pluginConfig = this.config[this.keyName];
		if (pluginConfig) {

			this.fileName = pluginConfig.file.replace('~', homedir);
			this.loadFile();

			this.config.commands.push({
				key: pluginConfig.key,
				title: "Use ualth database",
				requiresParams: true,
				type: this.type,
				id: this.type,
			});
		}
	}

	perform(entry, [ key, ... value ]) {
		if (key === 'edit') {
			shell.openPath(this.fileName);

		} else if (key === 'reload') {
			this.loadFile();

		} else if (value.length) {
			this.pluginCommands[key] = value
				.map(val => val.indexOf(' ') < 0 ? val : `"${val}"`)
				.join(' ');
			this.saveFile();

		} else {
			const toClipboard = this.pluginCommands[key];
			if (toClipboard)
				clipboard.writeText(toClipboard);
		}
	}

	loadFile() {
		if (fs.existsSync(this.fileName)) {
			this.pluginCommands = fs.readFileSync(this.fileName, 'utf-8')
				.split('\n')
				.reduce((acc, line) => {
					let [ key, ...value] = line.split('=');
					acc[key] = value.join('=');
					return acc;
				},{});
		} else {
			this.pluginCommands = {};
		}
	}

	saveFile() {
		const content = Object.keys(this.pluginCommands)
			.filter(key => key.length && this.pluginCommands[key].length)
			.map(key => `${key}=${this.pluginCommands[key]}`)
			.join('\n');

		fs.writeFile(this.fileName, content, 'utf-8', err => {
			if (err) console.error(err);
		});
	}
}

module.exports = SaverPlugin;
