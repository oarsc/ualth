import fs from 'fs';
import { homedir } from 'os';
import { join } from 'path';
import Command from '../command/command';
import { commands } from '../config-load';
import { HistoricSearchResult, SearchLevel, HistoryElement, HistoryElementReturn } from '../../shared-models/models';

const HISTORIC_PATH = join(homedir(), '.ualthhi');
const MAX_HISTORY = 10000;

if (!fs.existsSync(HISTORIC_PATH)) {
  fs.closeSync(fs.openSync(HISTORIC_PATH, 'w'));
}

const historic: HistoryElement[] = (fileName => {
  if (fs.existsSync(fileName)) {

    return fs.readFileSync(fileName, 'utf-8')
      .split(/\r\n|\n/)
      .filter(notEmptyLine => notEmptyLine)
      .reduce((list, line) => {
        const matches = `${line}`.match(/^([10]):([^\s]+?):(.*)$/);
        if (matches && matches.length === 4) {
          list.push({
            visible: matches[1] === '1',
            commandId: matches[2],
            inputText: matches[3]
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

export function getHistoryString(offset: number, forward: boolean, preString: string): HistoryElementReturn | undefined {

  if (forward) {
    const tmpHistoric = historic
      .filter(historicElement => historicElement.visible)
      .reverse()
      .slice(offset + 1)

    const index = findMatchingIndex(tmpHistoric, preString)

    return tmpHistoric.length && tmpHistoric[index]
    ? {
      ...tmpHistoric[index],
      returnedIndex: offset + 1 + index
    } : undefined;

  } else {

    let tmpHistoric = historic
      .filter(historicElement => historicElement.visible)

    const reversedOffset = tmpHistoric.length - offset

    tmpHistoric = tmpHistoric.slice(reversedOffset)

    const index = findMatchingIndex(tmpHistoric, preString)

    return tmpHistoric.length && tmpHistoric[index]
    ? {
      ...tmpHistoric[index],
      returnedIndex: offset - 1 - index
    } : undefined;
  }
}

function findMatchingIndex(array: HistoryElement[], preString: string) {
  return preString
    ? array.findIndex(historicElement => historicElement.inputText.startsWith(preString))
    : 0
}

export function removeHistoryByIndex(index: number) {

  const visibleHistoric = historic.filter(historicElement => historicElement.visible).reverse();

  if (index < visibleHistoric.length && index >= 0) {
    visibleHistoric[index].visible = false;
    saveFile();
  }
}

export function saveHistory(command: Command, input: string, visible: boolean = true): void {

  historic
    .map((historicElement, index) => {
      if (historicElement.commandId !== command.id) {
        return -1;
      }

      return !historicElement.visible || (command.requiresParams ? historicElement.inputText === input : true)
        ? index
        : -1
    })
    .filter(index => index >= 0)
    .reverse()
    .forEach(index => historic.splice(index, 1));

  historic.push({
    visible: visible,
    commandId: command.id!,
    inputText: input
  });

  if (historic.length > MAX_HISTORY) {
    historic.splice(0, historic.length - MAX_HISTORY);
  }

  saveFile();
}

function saveFile(): void {
  const content = historic
    .map(historicElement => `${historicElement.visible?'1':'0'}:${historicElement.commandId}:${historicElement.inputText}`)
    .join('\n');

  fs.writeFile(HISTORIC_PATH, content, 'utf-8', err => {
    if (err) console.error(err);
  });
}
