import { XmlBeautifyConfig, XmlBeautifyConfigElement } from "../models/config.model";
import { clipboard } from 'electron';
import Command from './command';
const xmlBeautify = new (require('xml-beautify'))({ parser: require('xmldom').DOMParser });


export default class XmlBeautifyCommand extends Command {
  static label = 'xml';

  maximize: boolean = false;

  constructor(data: XmlBeautifyConfigElement) {
    super('XmlBeautifyCommand');

    if (data.maximize) {
      this.title = 'Maximize XML';
      this.keyWord = data.key + 'max';
    } else {
      this.title = 'Beautify XML';
      this.keyWord = data.key + 'min';
    }

    this.maximize = data.maximize;
    this.requiresParams = true;
    this.keepHistory = false;

    this.icon = 'ualth';
    this.generateId();
  }

  static override parseDefinitions(data: XmlBeautifyConfig): XmlBeautifyConfigElement[] {
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
            xmlBeautify.beautify(value, { indent: "  " })
          );
        } else {
          clipboard.writeText(
            value.replace(/>\s+</g, '><').trim()
          );
        }
      } catch (e) {}
    }
  }
}
