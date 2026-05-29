import fs from 'fs';
import { homedir } from 'os';
import { join } from 'path';
import Command from '../command/command';

const REMOVALS_PATH = join(homedir(), '.ualthrm');

if (!fs.existsSync(REMOVALS_PATH)) {
  fs.closeSync(fs.openSync(REMOVALS_PATH, 'w'));
}

const removals: string[] = (fileName => {
  if (fs.existsSync(fileName)) {
    return fs.readFileSync(fileName, 'utf-8')
      .split(/\r\n|\n/)
      .filter(Boolean)
      .map((line) => line.split(' | ')[0] );
  }
  return [];
})(REMOVALS_PATH);

export function addHidden(command: Command) {
  const id = command.id!
  removals.push(id);
  fs.appendFile(REMOVALS_PATH, `${id} | ${command.title}\n`, err => {
    if (err) console.error(err);
  });
}

export function clearCommands(commands: Command[]) {
  for (let i = commands.length - 1; i >= 0; i--) {
    const id = commands[i].id;
    if (id && removals.includes(id)) {
      commands.splice(i, 1);
    }
  }
}