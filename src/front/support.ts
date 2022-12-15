export function classNames(conditionalClassNames: string[] | string, conditions: boolean[] | boolean) {
	const conditionalClassNamesList = arrayfy(conditionalClassNames);
	const conditionsList = arrayfy(conditions);

	return conditionalClassNamesList.filter((_, index) => conditionsList[index]).join(' ');
}

function arrayfy<T>(value: T[] | T): T[] {
	return Array.isArray(value)? value : [ value ];
}