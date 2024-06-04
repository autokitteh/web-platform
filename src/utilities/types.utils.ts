export const isValidOptionInType = <T>(value: any, validValues: T[]): value is T => {
	return validValues.includes(value);
};
