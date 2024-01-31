export const flattenArray = <Type>(arr: any): Type[] =>
	arr.reduce((prev: Type[], curr: Type) => prev.concat(curr), []) as Type[];
