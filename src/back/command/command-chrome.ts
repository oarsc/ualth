import Command from "./command";
import fs from 'fs';
import { homedir } from "os";
import { spawn } from "child_process";
import { shell } from "electron";
import { ChromeConfig } from "../models/config.model";
import { ChromeBookmark } from "../models/chrome-bookmark.model";
import { search } from "../services/search-service";
import { SearchLevel, SearchResult } from "../../shared-models/models";

const WIN_PATHS = [
  '~/AppData/Local/Google/Chrome/User Data/Default/Bookmarks'
];
const LINUX_PATHS = [
  '~/.config/google-chrome/Default/',
  '~/.config/chromium/Default/Bookmarks',
];

export default class ChromeCommand extends Command {
  static label = 'chromeBookmarks';
  static path = '';

  url: string;

  constructor(data: ChromeBookmark) {
    super('ChromeCommand');
    this.caseInsensitive = true;
    this.startsWith = false;

    this.title = data.name;
    this.keyWord = data.name;
    this.url = data.url!;
    this.icon = 'chrome';
    this.generateId();
  }

  static override parseDefinitions(data: ChromeConfig): ChromeBookmark[] {
    ChromeCommand.path = data.path;

    const paths = data.bookmarkFile? [data.bookmarkFile] : (win => win? WIN_PATHS : LINUX_PATHS)(process.platform === 'win32');
    const files = paths
      .map(path => path.replace('~', homedir()))
      .filter(path => fs.existsSync(path));


    if (!files.length) {
      return [];
    }

    try {
      return files
        .map(file => fs.readFileSync(file, 'utf-8'))
        .map(content => Object.values(JSON.parse(content).roots) as ChromeBookmark[])
        .flatMap(content => flatBookmarks(content));

    } catch (e) {
      console.log(e);
      return [];
    }
  }

  override match(inputText: string): SearchResult {
    const keyLevel = search(this.keyWord, inputText, true)
    return keyLevel.level === SearchLevel.NOT_FOUND
      ? search(this.url, inputText, true, false, false)
      : keyLevel;
  }

  override perform() {
    if (ChromeCommand.path) {
      spawn(ChromeCommand.path, [this.url], { detached: true });
    } else {
      shell.openExternal(this.url);
    }
  }
}

function flatBookmarks(bookmarks: ChromeBookmark[]): ChromeBookmark[] {
  const children = bookmarks
    .filter(b => b.type === 'folder')
    .flatMap(b => flatBookmarks(b.children!));

  return bookmarks.filter(b => b.type === 'url').concat(children);
}
