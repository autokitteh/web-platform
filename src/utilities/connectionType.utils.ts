/**
 * Type utility to extract the value type from an enum-like object.
 */
type ValueOf<T> = T[keyof T];

/**
 * Checks if a value is one of the values in the specified enumeration.
 * @param value The value to check.
 * @param enumType The enumeration to check the value against.
 * @returns true if the value belongs to the enumeration, otherwise false.
 */
export const isConnectionType = <T extends Record<string, string>>(value: string, enumType: T): value is ValueOf<T> => {
	return Object.values(enumType).includes(value as ValueOf<T>);
};
