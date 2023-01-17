import fs from 'fs';
import { homedir } from 'os';
import { join } from 'path';
import Command from '../command/command';
import { commands } from '../config-load';
import { HistoricSearchResult, SearchLevel } from '../../shared-models/models';

const HISTORIC_PATH = join(homedir(), '.ualthhi');

if (!fs.existsSync(HISTORIC_PATH)) {
  fs.closeSync(fs.openSync(HISTORIC_PATH, 'w'));
}

interface HistoryElement {
  commandId: string,
  inputText: string
}

const historic: HistoryElement[] = (fileName => {
  if (fs.existsSync(fileName)) {

    return fs.readFileSync(fileName, 'utf-8')
      .split('\n')
      .filter(notEmptyLine => notEmptyLine)
      .reduce((list, line) => {
        const matches = line.match(/^([^\s]+?):(.*)$/);
        if (matches && matches.length === 3) {
          list.push({
            commandId: matches[1],
            inputText: matches[2]
          });
        }
        return list;
      }, [] as HistoryElement[]);
  }
  return [];
})(HISTORIC_PATH);

export function searchHistory(input: string): HistoricSearchResult[] {
  return historic
    .map<HistoricSearchResult>((historicElement, idx) => ({
      command: commands.find(command => command.id === historicElement.commandId),
      input: historicElement.inputText,
      priority: idx
    }))
    .filter(result => result.command)
    .map(result => {
      result.searchResult = result.command?.match(input);
      return result;
    })
    .filter(result => result.searchResult?.level !== SearchLevel.NOT_FOUND);
}

export function saveHistory(command: Command, input: string): void {

  const index = historic.findIndex(historicElement => historicElement.commandId === command.id);
  if (index >= 0) {
    historic.splice(index, 1);
  }

  historic.push({
    commandId: command.id!,
    inputText: input
  });

  if (historic.length > 100) {
    historic.splice(0, historic.length - 100);
  }

  saveFile();
}

function saveFile(): void {
  const content = historic
    .map(historicElement => `${historicElement.commandId}:${historicElement.inputText}`)
    .join('\n');

  fs.writeFile(HISTORIC_PATH, content, 'utf-8', err => {
    if (err) console.error(err);
  });
}