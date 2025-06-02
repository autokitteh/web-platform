function unquoteIfNeeded(val: any) {
	if (typeof val === "string") {
		const unquoted = val.replace(/^"(.*)"$/, "$1");
		if (unquoted !== val) return unquoteIfNeeded(unquoted);
		if (/^-?\d+$/.test(val)) return Number(val);
	}
	return val;
}

export function deepProtoValueToObject(input: any): any {
	if (Array.isArray(input)) {
		return input.map(deepProtoValueToObject);
	}
	if (input && typeof input === "object") {
		for (const key of [
			"nothing",
			"boolean",
			"integer",
			"float",
			"string",
			"list",
			"set",
			"dict",
			"bytes",
			"time",
			"duration",
			"struct",
			"module",
			"symbol",
			"function",
			"custom",
		]) {
			if (input[key] !== undefined) {
				const val = input[key];
				if (key === "string" && val?.v !== undefined) {
					const parsed = safeJsonParse(val.v);
					if (parsed !== undefined) {
						return deepProtoValueToObject(parsed);
					}
					return unquoteIfNeeded(val.v);
				}
				if (key === "boolean" && val?.v !== undefined) return !!val.v;
				if (key === "integer" && val?.v !== undefined) return Number(val.v);
				if (key === "float" && val?.v !== undefined) return Number(val.v);
				if (key === "list" && val?.vs) return val.vs.map(deepProtoValueToObject);
				if (key === "set" && val?.vs) return val.vs.map(deepProtoValueToObject);
				if (key === "dict" && Array.isArray(val?.items)) {
					const object: any = {};
					for (const item of val.items) {
						const k = deepProtoValueToObject(item.k);
						const v = deepProtoValueToObject(item.v);
						object[k] = v;
					}
					return object;
				}
				if (key === "struct" && val) {
					const fields: any = {};
					for (const [k, v] of Object.entries(val.fields || {})) {
						fields[k] = deepProtoValueToObject(v);
					}
					return fields;
				}
				if (key === "module" && val) {
					const members: any = {};
					for (const [k, v] of Object.entries(val.members || {})) {
						members[k] = deepProtoValueToObject(v);
					}
					return members;
				}
				if (key === "symbol" && val?.name !== undefined) return val.name;
				if (key === "nothing") return undefined;
				if (key === "bytes") return val?.v;
				if (key === "custom" && val) {
					if (val.value !== undefined) {
						return deepProtoValueToObject(val.value);
					}
					return val;
				}
				return val;
			}
		}
		const out: any = {};
		for (const [k, v] of Object.entries(input)) {
			out[k] = deepProtoValueToObject(v);
		}
		return out;
	}
	return input;
}

export const safeJsonParse = (value: string) => {
	try {
		return JSON.parse(value);
	} catch {
		return null;
	}
};

export const safeParseProtoValue = (val: any) => deepProtoValueToObject(val) ?? null;
