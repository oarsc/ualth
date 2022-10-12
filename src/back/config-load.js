const { app } = require("electron");
const homedir = require('os').homedir();
const path = require('path');
const fs = require('fs');
const commandLoader = require('./command/loader');
const Command = require('./command/command');

const CONFIG_PATH = path.join(homedir, '.ualthrc');

if (!fs.existsSync(CONFIG_PATH)) {
	const CONFIG_DEFAULT_FILE = path.join(__dirname, '../../assets/default-config.ualth');

	try{
		fs.copyFileSync(CONFIG_DEFAULT_FILE, CONFIG_PATH, fs.constants.COPYFILE_EXCL);
	} catch (e) {
		if (e.code != 'EEXIST')
			throw e;
	}
}

module.exports = (() => {

	if (fs.existsSync(CONFIG_PATH)) {
		try {
			const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));
			const commands = commandLoader.load(config);
			Command.setParams(config, commands);

			return {
				commands: commands,
				config: config,
				error: false,
			};
		} catch (e) {
			return {
				commands: {},
				config: {},
				error: e,
			};
		}
	}

	return {
		commands: {},
		config: {},
		error: new Error(`Couldn't read config file: ${CONFIG_PATH}`),
	};
})()
