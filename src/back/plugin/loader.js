const plugins =['internal', 'search-engine']
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
			.filter(command => ids.indexOf(command.id) < 0? ids.push(command.id) : false);

		return config;
	},

	findByType(type) {
		const [ plugin ] = plugins.filter(plugin => plugin.type === type);
		return plugin;
	}
}
