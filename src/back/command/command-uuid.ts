import { clipboard } from 'electron';
import { UuidConfig } from '../models/config.model';
import { v4 as uuidv4 } from 'uuid';
import Command from './command';

export default class UuidCommand extends Command {
  static label = 'uuid';

  constructor(data: UuidConfig) {
    super('UuidCommand');

    this.title = 'Generate UUID';
    this.keyWord = data.key;
    this.subtitle = uuidv4();
    this.generateId();
  }

  override perform(argsList: string[]) {
    clipboard.writeText(this.subtitle);
    this.subtitle = uuidv4();
  }
}
