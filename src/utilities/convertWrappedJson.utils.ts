import { WrappedJsonObject } from "@src/interfaces/utilities";

export const parseNestedJson = (object: WrappedJsonObject): Record<string, any> => {
	if (!object) return {};
	const result: Record<string, any> = {};

	for (const key in object) {
		if (Object.prototype.hasOwnProperty.call(object, key)) {
			const value = object[key];
			if (value && typeof value === "object" && "string" in value && value && value.string) {
				try {
					result[key] = JSON.parse(value.string);
				} catch (error) {
					console.error(`Error parsing JSON for key "${key}":`, error);
					result[key] = value.string;
				}
			} else {
				result[key] = value;
			}
		}
	}

	return result;
};
