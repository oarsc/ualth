import { PriorizedSearchResult, SearchLevel, SearchResult } from "../../shared-models/models";

const { STARTING, CONTAINS, SPLITTED, NOT_FOUND } = SearchLevel;

export function sortSearchResults(results: PriorizedSearchResult[]): PriorizedSearchResult[]{
  return results.sort((result1, result2) => {

    if (result1.level === result2.level) {
      const priority1 = result1.priority;
      const priority2 = result2.priority;

      if (priority1) {
        return priority2? priority2 - priority1 : -1;
      } else if (priority2) {
        return 1;
      }

      const firstMatch1 = result1.matchingIndexes ?? [];
      const firstMatch2 = result2.matchingIndexes ?? [];

      if (firstMatch1.length && firstMatch2.length)
        return firstMatch1[0][0] - firstMatch2[0][0];
    }

    return result1.level - result2.level;
  });
}

export function search(
  originalText: string,
  searchText: string,
  caseInsensitive = false,
  split = true,
  recordIndexes = true
): SearchResult {

  if (!searchText.length) return { level: NOT_FOUND };

  const [ text, search ] = caseInsensitive
    ? [ originalText.toLowerCase(), searchText.toLowerCase() ]
    : [ originalText, searchText ];

  const index = text.indexOf(search);
  if (index >= 0) {
    return {
      level: index === 0? STARTING : CONTAINS,
      matchingIndexes: recordIndexes? [ [index, index+search.length]] : []
    };
  }

  let lastIndexChecked = 0;
  let currentLevel = STARTING;
  const foundIndexes: number[] = [];

  const success = search.split('').every((letter, i) =>  {
    const foundIdx = text.substr(lastIndexChecked).indexOf(letter);

    if (foundIdx === 0 && (currentLevel === STARTING || currentLevel === CONTAINS)) {
      foundIndexes.push(lastIndexChecked+foundIdx);
      lastIndexChecked++;

    } else if (foundIdx > 0 && i === 0) {
      foundIndexes.push(lastIndexChecked+foundIdx);
      lastIndexChecked = foundIdx + 1;
      currentLevel = CONTAINS;

    } else if (foundIdx >= 0 && split) {
      foundIndexes.push(lastIndexChecked+foundIdx);
      lastIndexChecked += foundIdx + 1;
      currentLevel = SPLITTED;

    } else {
      return false; // break
    }

    return true;
  });

  if (success) {
    return {
      level: currentLevel,
      matchingIndexes: !recordIndexes ? [] : foundIndexes.reduce((acc, index) => {
        if (!acc.length) {
          acc.push([index, index+1 ]);
        } else {
          const lastIndexes = acc[acc.length-1];
          if (lastIndexes[1] === index) {
            lastIndexes[1] = index+1;
          } else {
            acc.push([ index, index+1 ]);
          }
        }
        return acc;
      }, [] as Array<[number,number]>)
    };
  }
  return { level: NOT_FOUND }
};