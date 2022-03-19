module.exports = {
	join: (config, configKey, type, fillerFunction) => {

		if (config[configKey]) {
			for (let k in config[configKey]) {
				config.commands[k] = {
					type: type
				};
				fillerFunction(config[configKey][k], config.commands[k]);
			}
			delete config[configKey];
		}

		return config;
	},

	replace: (args, replacements) => {
		for (const i in args) {
			const repl = replacements[args[i]];
			if (repl) {
				args[i] = repl;
			}
		}
	}
};