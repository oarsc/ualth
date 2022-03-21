class Plugin {
	caseInsensitive = false;
	startWith = true;

	setConfig(config) {
		this.config = config;
	}

	match(commandDef, inputText) {
		if (commandDef.type !== this.type) {
			return false;
		}

		let key = commandDef.key;
		let text = commandDef.requiresParams
			? inputText.split(' ')[0]
			: inputText;

		if (this.caseInsensitive) {
			key = key.toLowerCase();
			text = text.toLowerCase();
		}

		return this.startWith
			? key.indexOf(text) === 0
			: key.indexOf(text) >= 0;
	}

	generateCommandDefinitions(createCommandDef) {
		if (!this.type || !this.keyName)
			throw new Error('Could not load a plugin');

		const { commands, [this.keyName] : pluginConfigs} = this.config;

		if (pluginConfigs) {
			for (let k in pluginConfigs) {
				const commandDef = createCommandDef(pluginConfigs[k], k);

				if (commandDef.length === undefined) {
					commandDef.type = this.type;
					commandDef.key = commandDef.key || k;
					commandDef.startWith = commandDef.startWith ?? true;
					commands.push(commandDef);

				} else {
					commandDef.forEach(subCommandDef => {
						if (!subCommandDef.key) {
							console.error(subCommandDef);
							throw new Error("When plugin returns an array on load, it must contain a key value");
						}
						subCommandDef.type = this.type;
						subCommandDef.startWith = subCommandDef.startWith ?? true;
						commands.push(subCommandDef);
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
