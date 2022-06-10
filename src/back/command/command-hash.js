const Command = require('./command');
const { clipboard } = require('electron');
const md5 = require('md5');

const CHARACTERS_INPUT = '0123456789abcdef';
const CHARACTERS_OUTPUT = ' !+,-./123456789:;=?_aABbCcdDEefFgGhHiIJjkKLlMmnNoOPpqQRrSsTtUuvVwWXxyYzZ';

const BASE_INPUT = BigInt(CHARACTERS_INPUT.length+1);
const BASE_OUTPUT = BigInt(CHARACTERS_OUTPUT.length);

class HashCommand extends Command {
	static label = 'hash';

	constructor({ key, seed }) {
		super();

		this.title = 'Hash';
		this.requiresParams = true;
		this.keyword = key;

		this.in = shuffle(CHARACTERS_INPUT, seed);
		this.out = shuffle(CHARACTERS_OUTPUT, seed);

		this.icon = 'ualth';
	}

	perform(argsList) {
		if (argsList.length) {
			const value = argsList.join(' ');
			clipboard.writeText(transform(value, this.in, this.out));
		}
	}
}

module.exports = HashCommand;

function shuffle(str, seed) {
	const random = seed => {
		const x = Math.sin(seed) * 10000; 
		return x - Math.floor(x);
	}

	const array = str.split('');

	// While there remain elements to shuffle…
	for (let i = array.length; i > 0;) {

		// Pick a remaining element…
		const index = Math.floor(random(seed++) * i--);

		// And swap it with the current element.
		[ array[i], array[index] ] = [ array[index], array[i] ];
	}

	return array.join('');
}

function transform(input, inputChars, outputChars) {
	const inputDecimal = md5(input)
		.split('')
		.reverse()
		.map(letter => inputChars.indexOf(letter))
		.filter(val => val >= 0)
		.map(BigInt)
		.map((value, index) => BASE_INPUT**BigInt(index) * value)
		.reduce((acc, value) => acc+value, 0n);

	return (input => {
	    const res = [];

	    while (input > 0n) {
	        res.push(outputChars[input % BASE_OUTPUT]);
	        input /= BASE_OUTPUT;
	    }

	    return res.reverse().join('');
	})(inputDecimal);
}
