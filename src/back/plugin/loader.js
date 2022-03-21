const plugins =['search-engine', 'firefox', 'internal']
	.map(name => require(`./plugin-${name}`))
	.map(pluginClass => new pluginClass());

module.exports = {
	load(config) {
		config.commands = config.commands ?? [];

		plugins.forEach(plugin => {
			plugin.setConfig(config);
			plugin.load();
		});

		// remove by id duplicated
		const ids = [];
		config.commands = config.commands
			.filter(commandDef => ids.indexOf(commandDef.id) < 0? ids.push(commandDef.id) : false);

		return config;
	},

	findByType(type) {
		const [ plugin ] = plugins.filter(plugin => plugin.type === type);
		return plugin;
	}
}
