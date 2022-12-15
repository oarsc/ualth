import { spawn, SpawnOptionsWithoutStdio } from "child_process";
import { homedir } from "os";
import { paramsSplitter } from "../common";
import { CommandRunConfig } from "../models/config.model";
import { SearchLevel, SearchResult } from "../../shared-models/models";
import { search } from "../services/search-service";
import Command from "./command";

const PARAMS_REGEX = /\{(?:\*|\d+|\d*\:\d+|\d+\:)\}/g;

export default class RunnerCommand extends Command {
  static label = 'runner';

  workingDir: string;

  noParamsCommand?: string;
  noParamsArgs?: string;

  args?: string;

  constructor(data: CommandRunConfig) {
    super('RunnerCommand');

    this.title = data.key;
    this.keyWord = data.key;
    this.command = data.command;
    this.noParamsCommand = data.noParams?.command;
    this.noParamsArgs = data.noParams?.arguments;
    this.args = data.arguments;
    this.workingDir = data.workingDir;
    this.requiresParams = this.args?.match(PARAMS_REGEX)? true : false;
    this.icon = data.icon || 'terminal';
    this.generateId();
  }

  override match(inputText: string): SearchResult {
    const [ keyword ] = this.keyWord.split(' ');
    const [ value, params ] = this.requiresParams
      ? inputText.split(' ')
      : [ inputText ];

    if (params === undefined) {
      const searchResult = search(keyword, value, false, false);
      if (searchResult.level === SearchLevel.STARTING) {
        return searchResult
      }
    } else if (keyword === value) {
      return {
        level: SearchLevel.STARTING,
        matchingIndexes: [ [0, value.length] ],
      }
    }

    return { level: SearchLevel.NOT_FOUND };
  }

  override perform(argsList: string[]) {
    const options: SpawnOptionsWithoutStdio = { detached: true };

    if (this.workingDir) {
      options.cwd = this.workingDir.replace('~', homedir());
    }

    const [command, params] = (({requiresParams, command, args, noParamsCommand, noParamsArgs}) => {
      if (requiresParams) {
        if (noParamsCommand && !argsList.length)
          return [noParamsCommand, noParamsArgs ?? ''];
        return [command, resolveArguments(args!, argsList)];
      }
      return [command, args];
    })(this);

    spawn(this.cleanCommand(command), paramsSplitter(params), options);
  }
}


function resolveArguments(definition: string, argsList: string[]): string | undefined {
  return argsList.length == 0
    ? definition
    : definition.match(PARAMS_REGEX)
    ?.map(s => {
      const range = s.slice(1, -1);

      if (range === '*' ||  range === ':')
        return [s, argsList.join(' ')];

      if (range.indexOf(':') < 0)
        return [s, argsList[parseInt(range)]];

      const [ firstIndex, secondIndex ] = (([first, second]) =>
        [ first? parseInt(first): undefined ,second? parseInt(second): undefined ]
      ) (range.split(':'));

      if (firstIndex) {
        return secondIndex
          ? [s, argsList.slice(firstIndex, secondIndex).join(' ')]
          : [s, argsList.slice(firstIndex).join(' ')]
      } else if (secondIndex) {
        return [s, argsList.slice(0, secondIndex).join(' ')]
      }
    })
    .reduce((finalResult, replaces) => 
      replaces
        ? finalResult.replace(replaces[0], replaces[1].replace(/(\"|\')/g,"\\$1"))
        : definition
    , definition);
}
