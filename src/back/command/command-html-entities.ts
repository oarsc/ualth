import { HtmlEntitiesConfig, HtmlEntitiesConfigElement } from "../models/config.model";
import { clipboard } from 'electron';
import Command from './command';

const he = require('he');

export default class HtmlEntitiesCommand extends Command {
  static label = 'entities';

  encode: boolean = false;

  constructor(data: HtmlEntitiesConfigElement) {
    super('HtmlEntitiesCommand');

    if (data.encode) {
      this.title = 'Encode html entities';
      this.keyWord = data.key + 'enc';
    } else {
      this.title = 'Decode html entities';
      this.keyWord = data.key + 'dec';
    }

    this.encode = data.encode;
    this.requiresParams = true;
    this.keepHistory = false;

    this.icon = 'ualth';
    this.generateId();
  }

  static override parseDefinitions(data: HtmlEntitiesConfig): HtmlEntitiesConfigElement[] {
    return [
      {
        key: data.key,
        encode: true
      },
      {
        key: data.key,
        encode: false
      }
    ]
  }

  override perform(argsList: string[]) {
    if (argsList.length) {
      const value = argsList.join(' ');
      if (this.encode) {
        clipboard.writeText(he.encode(value));
      } else {
        clipboard.writeText(he.decode(value));
      }
    }
  }
}
