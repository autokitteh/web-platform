export const safeParseSingleProtoValue = (input: any): Record<string, unknown> | null | undefined => {
	if (!input) {
		return null;
	}

	if (typeof input !== "object") {
		return undefined;
	}

	return safeJsonParse(input.string.v);
};

export const safeParseObjectProtoValue = (input: any): Record<string, unknown> | null | undefined => {
	if (!input) {
		return null;
	}

	if (typeof input !== "object") {
		return undefined;
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
