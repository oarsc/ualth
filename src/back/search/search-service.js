const { SEARCH_LEVEL : {STARTING, CONTAINS, SPLITTED, NOT_MATCH} } = require("./search-model");

module.exports.sortSearchResults = results => results
	.sort(({level: l1}, {level: l2}) => l1 - l2)
	.map(({ value }) => value);

module.exports.search = (_text, _search, caseInsensitive = false, split = true) => {
	if (!_search.length) return NOT_MATCH;

	const [ text, search ] = caseInsensitive
		? [ _text.toLowerCase(), _search.toLowerCase() ]
		: [ _text, _search ];

	const result = { idx: 0, level: STARTING, firstLetterMatch: 0 };

	const success = search.split('').every((letter, i) =>  {
		const { idx, level } = result;
		const foundIdx = text.substr(idx).indexOf(letter);

		if (foundIdx === 0 && (level === STARTING || level === CONTAINS)) {
			result.idx++;

		} else if (foundIdx > 0 && i === 0) {
			result.idx = foundIdx + 1;
			result.level = CONTAINS;
			result.firstLetterMatch = foundIdx;
			
		} else if (foundIdx >= 0 && split) {
			result.idx += foundIdx + 1;
			result.level = SPLITTED;
			
		} else {
			return false; // break
		}

		return true;
	});

	return success ? result.level : NOT_MATCH;
};
