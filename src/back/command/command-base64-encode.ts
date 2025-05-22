import { HtmlBase64Config, HtmlBase64ConfigElement } from "../models/config.model";
import { clipboard } from 'electron';
import Command from './command';

export default class HtmlBase64Command extends Command {
  static label = 'base64';

  encode: boolean = false;

  constructor(data: HtmlBase64ConfigElement) {
    super('HtmlBase64Command');

    this.title = data.encode ? 'Encode base64' : 'Decode base64';    
    this.keyWord = data.key;
    this.encode = data.encode;
    this.requiresParams = true;
    this.keepHistory = false;

    this.icon = 'ualth';
    this.generateId();
  }

  static override parseDefinitions(data: HtmlBase64Config): HtmlBase64ConfigElement[] {
    return [
      {
        key: data.encodeKey,
        encode: true
      },
      {
        key: data.decodeKey,
        encode: false
      }
    ]
  }

  override perform(argsList: string[]) {
    if (argsList.length) {
      const value = argsList.join(' ');
      if (this.encode) {
        clipboard.writeText(Buffer.from(value).toString('base64'));
      } else {
        clipboard.writeText(Buffer.from(value, 'base64').toString());
      }
    }
  }
}
