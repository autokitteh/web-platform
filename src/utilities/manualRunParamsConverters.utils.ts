import { safeJsonParse } from "@utilities";

export const convertToKeyValuePairs = (jsonString: string) => {
	try {
		const parsed = JSON.parse(jsonString);
		return Object.entries(parsed).map(([key, value]) => ({
			key,
			value: typeof value === "string" ? value : JSON.stringify(value),
		}));
	} catch {
		return [];
	}
};

export const convertToJsonString = (pairs: Array<{ key: string; value: string }>) => {
	const object = pairs.reduce<Record<string, unknown>>((acc, { key, value }) => {
		if (!key.trim()) return acc;
		acc[key] = safeJsonParse(value) ?? value;
		return acc;
	}, {});
	return JSON.stringify(object, null, 2);
};
