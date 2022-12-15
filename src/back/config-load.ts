import { homedir } from 'os';
import { join } from 'path';
import fs from 'fs';
import Config from './models/config.model';

import commandLoader from './command/loader';
import Command from './command/command';

const CONFIG_PATH = join(homedir(), '.ualthrc');

if (!fs.existsSync(CONFIG_PATH)) {
  const CONFIG_DEFAULT_FILE = join(__dirname, '../../assets/default-config.ualth');

  try{
    fs.copyFileSync(CONFIG_DEFAULT_FILE, CONFIG_PATH, fs.constants.COPYFILE_EXCL);
  } catch (error) {
    const nodeError = error as NodeJS.ErrnoException;
    if (nodeError.code !== 'EEXIST')
      throw nodeError;
  }
}

let commands_: Command[] = [];
let config_: Config | undefined = undefined;
let error_: boolean | Error = false;

if (fs.existsSync(CONFIG_PATH)) {
  try {
    config_ = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));
    commands_ = commandLoader(config_!);
    Command.setParams(config_!, commands_);
  } catch (e) {
    error_ = e as Error;
  }
} else {
  error_ = new Error(`Couldn't read config file: ${CONFIG_PATH}`);
}

export const commands = commands_;
export const config = config_;
export const error = error_;