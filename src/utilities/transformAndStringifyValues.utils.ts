export const transformAndStringifyValues = (object: object) => {
	const transformed = Object.fromEntries(
		Object.entries(object).map(([key, value]) => {
			let parsedValue = value.slice(1, -1).replace(/\\"/g, '"');

			if (parsedValue.startsWith("{") && parsedValue.endsWith("}")) {
				parsedValue = parsedValue.replace(/"/g, "'");
			}

			return [key, parsedValue];
		})
	);

	return Object.fromEntries(Object.entries(transformed).map(([key, value]) => [key, JSON.stringify(value)]));
};
