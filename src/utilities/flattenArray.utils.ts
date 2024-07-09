export const flattenArray = <Type>(array: any): Type[] => array.reduce((prev: Type[], curr: Type) => prev.concat(curr), []) as Type[];
