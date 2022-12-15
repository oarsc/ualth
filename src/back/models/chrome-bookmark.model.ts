export interface ChromeBookmark {
  guid: string;
  date_added: string;
  date_last_used: string;
  date_modified?: string;
  id: string;
  meta_info?: any;
  name: string;
  type: 'url' | 'folder';
  children?: ChromeBookmark[],
  url?: string,
}

export interface ChromeBookmarkRoot {
  bookmark_bar: ChromeBookmark;
  other: ChromeBookmark;
  synced: ChromeBookmark;
}
