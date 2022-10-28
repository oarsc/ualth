const { SEARCH_LEVEL : {STARTING, CONTAINS, SPLITTED, NOT_FOUND} } = require("./search-model");

module.exports.sortSearchResults = results => results
	.sort(({level: lev1, matchingIndexes: firstMatch1 = [], priority: p1}, {level: lev2, matchingIndexes: firstMatch2 = [], priority: p2}) => {
		if (lev1 === lev2) {
			if (p1) {
				return p2? p2-p1 : -1;
			} else if (p2) {
				return 1;
			}

			if (firstMatch1.length && firstMatch2.length)
				return firstMatch1[0][0] - firstMatch2[0][0];
		}
		return lev1 - lev2;
	});

module.exports.search = (_text, _search, caseInsensitive = false, split = true, recordIndexes = true) => {
	if (!_search.length) return { level: NOT_FOUND };

	const [ text, search ] = caseInsensitive
		? [ _text.toLowerCase(), _search.toLowerCase() ]
		: [ _text, _search ];

	const index = text.indexOf(search);
	if (index >= 0) {
		return {
			level: index === 0? STARTING : CONTAINS,
			matchingIndexes: recordIndexes? [ [index, index+search.length]] : [],
		};
	}

	let lastIndexChecked = 0;
	let currentLevel = STARTING;
	const foundIndexes = [];

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
			}, [])
		};
	}
	return { level: NOT_FOUND }
};