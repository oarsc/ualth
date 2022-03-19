const homedir = require('os').homedir();
const path = require('path');
const fs = require('fs');
const pluginLoader = require('./plugin/loader');

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

if (fs.existsSync(CONFIG_PATH)) {
	const content = fs.readFileSync(CONFIG_PATH, 'utf-8');
	module.exports = joinCommands(JSON.parse(content));

} else {
	throw new Error(`Couldn't read config file: ${CONFIG_PATH}`);
}


function joinCommands(content) {
	return pluginLoader.load(content);
}