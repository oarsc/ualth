const commandsClasses =['search-engine', 'runner', 'saver', 'firefox', 'internal', 'global-setter']
	.map(name => require(`./command-${name}`));

module.exports.load = config => 
	commandsClasses.flatMap(commandClass => {
		const datas = (data => !data? undefined : toArray(data)) (config[commandClass.label]);

		return datas
			? datas.flatMap(data => commandClass.parseDefinitions(data))
				.map(data => new commandClass(data))
			: [ false ];

	}).filter(removeFalses => removeFalses);


function toArray(value) {
	return isArray(value)? value : [value];
}

function isArray(value) {
	return typeof value === 'object' && typeof value.length === 'number';
}
