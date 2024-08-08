export const getEnumKeyByEnumValue = <T extends { [index: string]: string | number }>(
	myEnum: T,
	enumValue: string | number
): keyof T | undefined => {
	const keys = Object.keys(myEnum).filter((key) => myEnum[key] === enumValue);

	return keys.length ? (keys[0] as keyof T) : undefined;
};
