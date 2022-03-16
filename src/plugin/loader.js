const plugins =[
	'./search-engine'
].map(v => require(v));

module.exports = {
	load(config) {
		plugins.forEach(plugin => plugin.load(config));
		return config;
	},

	findByType(type) {
		const [ plugin ] = plugins.filter(plugin => plugin.type === type);
		return plugin;
	}
}
