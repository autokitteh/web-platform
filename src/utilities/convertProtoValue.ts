export const safeParseSingleProtoValue = (input: any): Record<string, unknown> | undefined => {
	if (!input) {
		return undefined;
	}

	if (typeof input !== "object") {
		return undefined;
	}

	return safeJsonParse(input.string.v);
};

export const safeParseObjectProtoValue = (input: any): Record<string, unknown> => {
	if (!input) {
		return {};
	}

	if (typeof input !== "object") {
		return {};
	}

	return Object.fromEntries(
		Object.entries(input as Record<string, unknown>).map(([key, value]) => [key, safeParseSingleProtoValue(value)])
	);
};

export const safeJsonParse = (value: string) => {
	try {
		return JSON.parse(value);
	} catch {
		return undefined;
	}
};
