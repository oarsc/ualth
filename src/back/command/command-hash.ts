import { clipboard } from 'electron';
import { HashConfig } from '../models/config.model';
import md5 from 'md5';
import Command from './command';

const CHARACTERS_INPUT = '0123456789abcdef';
const CHARACTERS_OUTPUT = ' !+,-./123456789:;=?_aABbCcdDEefFgGhHiIJjkKLlMmnNoOPpqQRrSsTtUuvVwWXxyYzZ';

const BASE_INPUT = BigInt(CHARACTERS_INPUT.length+1);
const BASE_OUTPUT = BigInt(CHARACTERS_OUTPUT.length);

export default class HashCommand extends Command {
  static label = 'hash';

  in: string;
  out: string;

  constructor(data: HashConfig) {
    super('HashCommand');

    this.title = 'Hash';
    this.requiresParams = true;
    this.keyWord = data.key;

    this.in = shuffle(CHARACTERS_INPUT, data.seed);
    this.out = shuffle(CHARACTERS_OUTPUT, data.seed);

    this.icon = 'ualth';
    this.generateId();
  }

  override perform(argsList: string[]) {
    if (argsList.length) {
      const value = argsList.join(' ');
      clipboard.writeText(transform(value, this.in, this.out));
    }
  }
}


function shuffle(str: string, seed: number) {
  const random = (seed: number) => {
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

function transform(input: string, inputChars: string, outputChars: string) {
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
          res.push(outputChars[Number(input % BASE_OUTPUT)]);
          input /= BASE_OUTPUT;
      }

      return res.reverse().join('');
  })(inputDecimal);
}
