import Config from "../models/config.model";

import SearchEngineCommand from "./command-search-engine";
import RunnerCommand from "./command-runner";
import SaverCommand from "./command-saver";
import FirefoxCommand from "./command-firefox";
import ChromeCommand from "./command-chrome";
import InternalCommand from "./command-internal";
import HashCommand from "./command-hash";
import CopyCommand from "./command-copy";
import UnixAppsCommand from "./command-unix-apps";
import WindowsStartAppsCommand from "./command-windows-start-apps";
import JsonBeautifyCommand from "./command-json-beautify";
import XmlBeautifyCommand from "./command-xml-beautify";

const commandsClasses = [
  SearchEngineCommand,
  RunnerCommand,
  SaverCommand,
  FirefoxCommand,
  ChromeCommand,
  InternalCommand,
  HashCommand,
  CopyCommand,
  UnixAppsCommand,
  WindowsStartAppsCommand,
  JsonBeautifyCommand,
  XmlBeautifyCommand,
]

export default function load(config: Config) {
  return commandsClasses.flatMap(commandClass => {
    const data: any = config[commandClass.label as keyof Config];

    if (!data) {
      return [];
    }

    return toArray(data)
      .flatMap(data => commandClass.parseDefinitions(data))
      .filter(Boolean)
      .map(data => new commandClass(data));
  });
}

function toArray<T>(value: T|T[]): T[] {
  return isArray(value)? value : [value];
}

function isArray<T>(value: any): value is T[] {
  return typeof value === 'object' && typeof value.length === 'number';
}
