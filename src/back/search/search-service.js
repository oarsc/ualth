const { SEARCH_LEVEL : {STARTING, CONTAINS, SPLITTED, NOT_MATCH} } = require("./search-model");

module.exports.sortSearchResults = results => results
	.sort(({level: level1}, {level: level2}) => level1 - level2)
	.map(({ value }) => value);

module.exports.smartSearch = (text, search) => {
	if (!search.length) return false;

	const result = search
		.split('')
		.reduce((currentSearchValue, letter, iter) => {
			const { idx, level } = currentSearchValue;

			if (idx >= 0) {
				const foundIdx = text.substr(idx).indexOf(letter);
				if (foundIdx < 0) {
					return { idx: -1, level: NOT_MATCH };
				}

				if (foundIdx === 0) {
					if (level === STARTING || level === CONTAINS)
						return { idx: idx+1, level };

				} else if (iter === 0) {
					return { idx: foundIdx+1, level: CONTAINS };
				}

				return { idx: idx+foundIdx+1, level: SPLITTED };
			}
			return currentSearchValue;
		}, {idx: 0, level: STARTING });

	return result.level;
}


module.exports.search = (text, search) => {
	if (!search.length) return false;
	const idx = text.indexOf(search);
	return idx > 0? CONTAINS : idx < 0? NOT_MATCH : STARTING;
}