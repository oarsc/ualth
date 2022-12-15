import { clipboard } from 'electron';
import { HashConfig } from '../models/config.model';
import { spawn } from "child_process";
import Command from './command';

export default class HashCommand extends Command {
  static label = 'hash';

  executable: string;
  master: number;

  constructor(data: HashConfig) {
    super('HashCommand');

    this.title = 'Hash';
    this.requiresParams = true;
    this.keyWord = data.key;

    this.executable = data.exe!;
    this.master = data.seed;

    this.icon = 'ualth';
    this.generateId();
  }

  override perform(argsList: string[]) {
    if (argsList.length) {

      const result = spawn(this.executable, ['-m', `${this.master}`, '-k', argsList.join(' ')]);

      result.stdout.on('data', (data) => {
        clipboard.writeText(`${data}`.replace(/\r?\n$/, ''));
      });
    }
  }

  static override parseDefinitions(data: HashConfig): HashConfig | undefined {
    return data.exe? data : undefined;
  }
}
