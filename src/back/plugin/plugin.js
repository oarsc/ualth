class Plugin {
	setConfig(config) {
		this.config = config;
	}

	join(fillerFunction) {
		if (!this.type || !this.keyName)
			throw new Error('Could not load a plugin');

		const { commands, [this.keyName] : pluginConfigs} = this.config;

		if (pluginConfigs) {
			for (let k in pluginConfigs) {
				commands[k] = {
					type: this.type
				};
				fillerFunction(pluginConfigs[k], commands[k]);
			}
			delete this.config[this.keyName];
		}
	}

	replace(args) {
		for (const i in args) {
			const repl = this.config.replace[args[i]];
			if (repl) {
				args[i] = repl;
			}
		}
	}
}

module.exports = Plugin;
