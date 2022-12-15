import { config, commands } from './config-load';
import { PriorizedSearchResult, SearchLevel } from '../shared-models/models';
import { saveHistory, searchHistory } from './services/history-service';
import { sortSearchResults } from './services/search-service';

export function match(inputText: string): PriorizedSearchResult[] {
  const matches = commands
    .map(command => ({
      ... command.match(inputText),
      command: command,
      priority: -1
    } as PriorizedSearchResult))
    .filter(({ level }) => level !== SearchLevel.NOT_FOUND );

  searchHistory(inputText)
    .filter(historicElement => !historicElement.command?.requiresParams)
    .forEach(historicElement => {
      matches.every(match => {
        if (historicElement.command?.id === match.command.id) {
          match.priority = historicElement.priority;
          return false;
        }
        return true;
      })
    })

  return sortSearchResults(matches);
}

export function perform(id: string, input: string) {
  const [ command ] = commands.filter(command => command.id === id);

  if (command) {
    command.perform(input.split(' ').slice(1));
    saveHistory(command, input);
    return command;
  }
}

export function resolve(value: string): string {
  if (config) {
    for (const resolveKey in config.resolve) {
      if (resolveKey === value) {
        return config.resolve[resolveKey];
      }
    }
  }
  return value;
}
