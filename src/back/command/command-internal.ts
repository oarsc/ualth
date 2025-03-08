import { spawn } from "child_process";
import Command from "./command";
import { app } from "electron";
import { InternalCommandsConfig } from "../models/config.model";

const LITERALS: Record<string, string> = {
  '_EXIT_': 'Exits ualth',
  '_RELOAD_': 'Reloads ualth configuration',
};

interface DataFormat {
  key: string,
  command: string,
}

export default class InternalCommand extends Command {
  static label = 'internalCommands';

  constructor(data: DataFormat) {
    super('InternalCommand');

    this.command = data.command;
    this.keyWord = data.key;
    this.title = LITERALS[data.command] ?? data.key;
    this.icon = 'ualth';
    this.generateId();
  }

  static override parseDefinitions(data: InternalCommandsConfig) {
    return Object.entries(data).map(([ key, value ]) => ({
      key,
      command: value
    } as DataFormat));
  }

  override perform() {
    if (this.command === '_EXIT_') {
      app.quit();

    } else if (this.command === '_RELOAD_') {
      if (process.platform === 'win32') {
        app.relaunch();
      } else {
        spawn(process.argv0, process.argv.slice(1));
      }
      app.exit();
    }
  }
}
