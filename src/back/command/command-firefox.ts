import { spawn } from "child_process";
import { shell } from "electron";
import { homedir } from "os";
import { FirefoxConfig } from "../models/config.model";
import fs from "fs";
import Command from "./command";
import { FirefoxBookmark } from "../models/firefox-bookmark.model";
import { search } from "../services/search-service";
import { SearchLevel, SearchResult } from "../../shared-models/models";
import { open } from 'sqlite'
import sqlite from 'sqlite3'



const jsonlz4 = require('jsonlz4-decompress');

const WIN_PATH = '~/AppData/Roaming/Mozilla/Firefox/Profiles/';
const LINUX_PATH = '~/.mozilla/firefox/';

interface ProfiledBookmark extends FirefoxBookmark {
  profile: string
}

export default class FirefoxCommand extends Command {
  static label = 'firefoxBookmarks';
  static path: string | undefined = '';

  url: string;
  profile: string;

  constructor(data: ProfiledBookmark) {
    super('FirefoxCommand');
    this.caseInsensitive = true;
    this.startsWith = false;

    this.title = data.title;
    this.keyWord = data.title;
    this.url = data.uri!;
    this.icon = data.iconUri || 'firefox';
    this.profile = data.profile;
    this.generateId();
  }

  static override parseDefinitions(data: FirefoxConfig): ProfiledBookmark[] {
    FirefoxCommand.path = data.path;

    const path = data.profileFolder || (win => win? WIN_PATH : LINUX_PATH)(process.platform === 'win32');
    const dir = path.replace('~', homedir());

    if (!fs.existsSync(dir)) {
      return [];
    }

    return fs.readdirSync(dir)
      .filter(profile => filterExcludes(profile, data.exclude))
      .filter(profile => fs.existsSync(`${dir}/${profile}/bookmarkbackups/`))
      .flatMap(profile => {
        fs.copyFileSync(`${dir}/${profile}/places.sqlite`, `${dir}/${profile}/places2.sqlite`);

        



        console.log(`${dir}/${profile}/places.sqlite`)
        return fs.readdirSync(`${dir}/${profile}/bookmarkbackups/`)
          .sort()
          .slice(-1)
          .map(file => fs.readFileSync(`${dir}/${profile}/bookmarkbackups/${file}`))
          .flatMap(fileBuffer => recollect(jsonlz4(fileBuffer).children))
          .map(bookmark => ({ ...bookmark, profile: getProfileName(profile)} as ProfiledBookmark))
      })
      .filter(bookmark => bookmark.title);
  }

  async readBookmark<T>(path: string): Promise<T[]> {

    const db = await open({
      filename: path,
      driver: sqlite.Database
    });
  
    const results: T[] = [];
  
    try {
      await db.each('SELECT p.url as uri, b.title FROM moz_places p JOIN moz_bookmarks b ON p.id = b.fk', [], (err, row) => {
        if (err) throw(err);
        else results.push(row);
      });
    } finally {
      await db.close();
    }
  
    return results;
  }

  override match(inputText: string): SearchResult {
    const keyLevel = search(this.keyWord, inputText, true)
    return keyLevel.level === SearchLevel.NOT_FOUND
      ? search(this.url, inputText, true, false, false)
      : keyLevel;
  }

  override perform() {
    if (FirefoxCommand.path) {
      spawn(FirefoxCommand.path, ['-p', this.profile, this.url], { detached: true });
    } else {
      shell.openExternal(this.url);
    }
  }
}

function recollect(json: FirefoxBookmark[]): FirefoxBookmark[] {
  return [
    ...json.filter(j => j.type === 'text/x-moz-place'),
    ...json.filter(j => j.children).flatMap(j => recollect(j.children!))
  ];
}

function filterExcludes(profile: string, excludes: string[] = []) {
  if (excludes.length) {
    return excludes.indexOf(getProfileName(profile)) < 0;
  }
  return true;
}

function getProfileName(profile: string) {
  const [ _, ...name ] = profile.split('.');
  return name.join('.');
}
