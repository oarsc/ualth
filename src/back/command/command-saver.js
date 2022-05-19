const Command = require('./command');
const homedir = require('os').homedir();
const fs = require('fs');
const { clipboard } = require('electron');
const { spawn } = require("child_process");

let MASTER_KEY = 's';
let FILE_NAME = '';

const ACTION_DEFAULT = 1;
const ACTION_EDIT = 2;
const ACTION_RELOAD = 3;

class SaverCommand extends Command {
	static label = 'infoSaver';

	constructor(data) {
		super();

		if (typeof data != 'number') {
			this.keyword = `${MASTER_KEY} ${data[0]}`;
			this.key = data[0];
			this.content = data[1];
			this.title = `Copies ${this.content}`;

		} else {
			this.action = data;
			switch(data) {
				case ACTION_DEFAULT:
					this.keyword = MASTER_KEY;
					this.requiresParams = true;
					this.title = 'Use ualth database';
					break;

				case ACTION_EDIT:
					this.keyword = `${MASTER_KEY} edit`;
					this.title = 'Open ualth database with text editor';
					break;

				case ACTION_RELOAD:
					this.keyword = `${MASTER_KEY} reload`;
					this.title = 'Reloads ualth database';
					break;
			}
		}

		this.icon = 'database';
	}

	static parseDefinitions(data) {
		MASTER_KEY = data.key;
		FILE_NAME = data.file.replace('~', homedir);

		const definitions = this.loadFile(FILE_NAME);
		this.addDefaultActions(definitions);
		return definitions;
	}

	static addDefaultActions(definitions) {
		definitions.push(ACTION_EDIT);
		definitions.push(ACTION_RELOAD);
		definitions.push(ACTION_DEFAULT);
	}

	match(inputText) {
		//if (this.content)
			return super.match(inputText);

		return ['edit', 'reload']
			.some(reservedValue => inputText == `${MASTER_KEY} ${reservedValue}`)? false : super.match(inputText);
	}

	perform([ key, ... value ]) {
		if (this.content) {
			clipboard.writeText(this.content);

		} else if (this.action === ACTION_EDIT) {
			spawn(this.cleanCommand('__DEFAULT_TEXT_EDITOR__'), [ FILE_NAME ]);

		} else if (this.action === ACTION_RELOAD) {
			this.getCommands(commands => {
				const selfClass = this.constructor;

				const indexes = commands
					.map((c,i) => c instanceof selfClass? i : false)
					.filter(i => i !== false);

				const [ firstIndex ] = indexes;

				indexes
					.reverse()
					.forEach(i => commands.splice(i,1));

				selfClass.parseDefinitions({key: MASTER_KEY, file: FILE_NAME})
					.map(data => new selfClass(data))
					.reverse()
					.forEach(command => commands.splice(firstIndex, 0, command));
			});

		} else if (this.action === ACTION_DEFAULT && value.length) {

			const content = value
				.map(val => val.indexOf(' ') < 0 ? val : `"${val}"`)
				.join(' ');

			this.getCommands(commands => {
				const selfClass = this.constructor;

				const saverCommands = commands
					.filter(c => c instanceof selfClass);

				const [ existing ] = saverCommands
					.filter(c => c.key == key);

				if (existing) {
					existing.content = content;
					existing.title = `Copies ${content}`;

				} else {
					const addIndexSlice = saverCommands.length-1;
					const addIndex = commands.indexOf(saverCommands[addIndexSlice]);

					const command = new selfClass([key, content]);

					commands.splice(addIndex, 0, command);
					saverCommands.splice(addIndexSlice, 0, command);
				}

				this.saveFile(saverCommands);
			});
		}
	}

	static loadFile(fileName) {
		if (fs.existsSync(fileName)) {
			return fs.readFileSync(fileName, 'utf-8')
				.split('\n')
				.filter(hasContent => hasContent)
				.map(line => {
					let [ key, ...value] = line.split('=');
					return [key, value.join('=')];
				});
		}

		return [];
	}

	saveFile(commands) {
		const content = commands
			.filter(command => command.content)
			.map(command => `${command.key}=${command.content}`)
			.join('\n');

		fs.writeFile(FILE_NAME, content, 'utf-8', err => {
			if (err) console.error(err);
		});
	}
}

module.exports = SaverCommand;
