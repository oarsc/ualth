import { JsonBeautifyConfig, JsonBeautifyConfigElement } from "../models/config.model";
import { clipboard } from 'electron';
import Command from './command';

export default class JsonBeautifyCommand extends Command {
  static label = 'json';

  maximize: boolean = false;

  constructor(data: JsonBeautifyConfigElement) {
    super('JsonBeautifyCommand');

    if (data.maximize) {
      this.title = 'Maximize JSON';
      this.keyWord = data.key + 'max';
    } else {
      this.title = 'Beautify JSON';
      this.keyWord = data.key + 'min';
    }

    this.maximize = data.maximize;
    this.requiresParams = true;
    this.keepHistory = false;

    this.icon = 'ualth';
    this.generateId();
  }

  static override parseDefinitions(data: JsonBeautifyConfig): JsonBeautifyConfigElement[] {
    return [
      {
        key: data.key,
        maximize: true
      },
      {
        key: data.key,
        maximize: false
      }
    ]
  }

  override perform(argsList: string[]) {
    if (argsList.length) {
      const value = argsList.join(' ');

      try {
        if (this.maximize) {
          clipboard.writeText(
            JSON.stringify(JSON.parse(value), null, 2)
          );
        } else {
          clipboard.writeText(
            JSON.stringify(JSON.parse(value))
          );
        }
      } catch (e) {}
    }
  }
}
