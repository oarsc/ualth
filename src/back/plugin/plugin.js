class Plugin {
	caseInsensitive = false;
	startWith = true;

	setConfig(config) {
		this.config = config;
	}

	match(definition, inputText) {
		if (definition.type !== this.type)
			return false;

		let key = definition.key;
		let value = definition.requiresParams
			? inputText.split(' ')[0]
			: inputText;

		if (this.caseInsensitive) {
			key = key.toLowerCase();
			value = value.toLowerCase();
		}

		return this.startWith
			? key.indexOf(value) === 0
			: key.indexOf(value) >= 0;
	}

	generateCommandDefinitions(createDefinitionFunction) {
		if (!this.type || !this.keyName)
			throw new Error('Could not load a plugin');

		const { commands, [this.keyName] : pluginConfig} = this.config;

		if (pluginConfig) {
			for (let k in pluginConfig) {
				const definition = createDefinitionFunction(pluginConfig[k], k);

				if (definition.length === undefined) {
					definition.type = this.type;
					definition.key = definition.key || k;
					definition.startWith = definition.startWith ?? true;
					definition.id = Math.random();
					commands.push(definition);

				} else {
					definition.forEach(subDefinition => {
						if (!subDefinition.key) {
							console.error(subDefinition);
							throw new Error("When plugin returns an array on load, it must contain a key value");
						}
						subDefinition.type = this.type;
						subDefinition.startWith = subDefinition.startWith ?? true;
						subDefinition.id = Math.random();
						commands.push(subDefinition);
					})
				}

			}
			delete this.config[this.keyName];
		}
	}

	cleanCommand(command) {
		if (command === '__DEFAULT__')             return this.config.default.command;
		if (command === '__DEFAULT_TEXT_EDITOR__') return this.config.default.textEditorCommand;
		return command;
	}
}

module.exports = Plugin;
