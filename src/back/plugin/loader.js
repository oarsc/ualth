const plugins =['internal', 'search-engine']
	.map(name => require(`./plugin-${name}`))
	.map(pluginClass => new pluginClass());

module.exports = {
	load(config) {
		config.commands = config.commands ?? {};

		plugins.forEach(plugin => {
			plugin.setConfig(config);
			plugin.load(config);
		});
		return config;
	},

	findByType(type) {
		const [ plugin ] = plugins.filter(plugin => plugin.type === type);
		return plugin;
	}
}
