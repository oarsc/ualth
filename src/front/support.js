export function classNames(conditionalClassNames, conditions) {
	if (typeof conditionalClassNames != 'object')
		conditionalClassNames = [conditionalClassNames];

	if (typeof conditions != 'object')
		conditions = [conditions];

	return conditionalClassNames.filter((className, index) => conditions[index]).join(' ');
}
