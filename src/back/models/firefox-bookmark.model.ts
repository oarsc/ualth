export interface FirefoxBookmark {
  guid: string;
  title: string;
  index: number;
  dateAdded: number;
  lastModified: number;
  id: number;
  typeCode: number;
  iconUri?: string;
  type: 'text/x-moz-place' | 'text/x-moz-place-container';
  root: 'bookmarksMenuFolder' | 'mobileFolder' | 'toolbarFolder' | 'unfiledBookmarksFolder';
  children?: FirefoxBookmark[],
  uri?: string,
}
