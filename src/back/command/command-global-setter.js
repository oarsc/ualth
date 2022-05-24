const Command = require('./command');

class GlobalSetterCommand extends Command {
	static label = 'globalKey';

	constructor(data) {
		super();

		this.title = 'Set environment';
		this.requiresParams = true;
		this.keyword = data;
		this.icon = 'ualth';
	}

	perform(argsList) {
		if (argsList?.length === 1 && argsList[0] === '!') {
			this.setGlobal();

		} else {
			this.setGlobal(argsList.join(' '));
		}
	}
}

module.exports = GlobalSetterCommand;