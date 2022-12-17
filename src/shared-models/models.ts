import CommandClass from "../back/command/command";

export type Command = CommandClass;

export enum SearchLevel {
  NOT_FOUND = 0,
  STARTING,
  CONTAINS,
  SPLITTED,
}

export interface SearchResult {
  level: SearchLevel,
  matchingIndexes?: Array<[number, number]>,
}

export interface PriorizedSearchResult extends SearchResult {
  command: Command
  priority: number,
}

export interface HistoricSearchResult {
  command?: Command,
  input: string,
  priority: number,
  searchResult?: SearchResult
}
