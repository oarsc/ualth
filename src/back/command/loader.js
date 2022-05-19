const commandsClasses =['search-engine', 'runner', 'saver', 'firefox', 'internal']
	.map(name => require(`./command-${name}`));

module.exports.load = config => 
	commandsClasses.flatMap(commandClass => {
		const datas = (data => !data? undefined : data.length? data : [data]) (config[commandClass.label]);

		return datas
			? datas.flatMap(data => commandClass.parseDefinitions(data))
				.map(data => new commandClass(data))
			: [ false ];

	}).filter(removeFalses => removeFalses);
