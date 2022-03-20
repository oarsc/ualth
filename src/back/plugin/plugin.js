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
				const addStuff = fillerFunction(pluginConfigs[k], k);

				if (addStuff.length === undefined) {
					addStuff.type = this.type;
					if (!addStuff.key) addStuff.key = k;
					commands.push(addStuff);

				} else {
					addStuff.forEach(subAddStuff => {
						if (!subAddStuff.key) {
							console.error(subAddStuff);
							throw new Error("When plugin returns an array on load, it must contain a key value");
						}
						subAddStuff.type = this.type;
						commands.push(subAddStuff);
					})
				}

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
