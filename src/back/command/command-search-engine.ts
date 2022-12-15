import { shell } from "electron";
import { SearchEngineConfig } from "../models/config.model";
import Command from "./command";
import { search } from '../services/search-service';
import { SearchLevel, SearchResult } from '../../shared-models/models';

export default class SearchEngineCommand extends Command {
  static label = 'searchEngines';

  url: string;
  rootUrl?: string;

  constructor(data: SearchEngineConfig) {
    super('SearchEngineCommand');

    this.keyWord = data.key;
    this.title = data.title ?? data.key;
    this.url = data.url;
    this.rootUrl = data.rootUrl;
    this.requiresParams = true;
    this.icon = data.icon || 'search-engine';
    this.generateId();
  }

  override match(inputText: string): SearchResult {
    const [ keyword ] = this.keyWord.split(' ');
    const [ value, params ] = inputText.split(' ');

    if (params === undefined) {
      const searchResult = search(keyword, value, false, false, false);
      if (searchResult.level === SearchLevel.STARTING) {
        return searchResult;
      }
    } else if (keyword === value) {
      return {
        level: SearchLevel.STARTING,
        matchingIndexes: [],
      };
    }

    return { level: SearchLevel.NOT_FOUND };
  }

  override perform(argsList: string[]) {
    if (this.rootUrl && !argsList.length) {
      shell.openExternal(this.rootUrl);	

    } else {
      const queryValue = encodeURIComponent(argsList.join(' '));
      const result = this.url.replace('{q}', queryValue);
      shell.openExternal(result);
    }
  }
}
