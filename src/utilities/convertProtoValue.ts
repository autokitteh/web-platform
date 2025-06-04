import { DeepProtoValueResult } from "@src/interfaces/utilities";
import { ValueType } from "@src/types/utilities";

const unquoteIfNeeded = (val: any): any => {
	if (typeof val === "string") {
		const m = /^(['"])(.*)\1$/.exec(val);
		if (m) return unquoteIfNeeded(m[2]);
		if (/^-?\d+$/.test(val)) return Number(val);
	}
	return val;
};

export const safeParseProtoValue = (input: any): DeepProtoValueResult => {
	if (Array.isArray(input)) {
		return {
			type: "array",
			value: input.map(safeParseProtoValue),
		};
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
					if (parsed !== undefined && typeof parsed !== "string") {
						if (parsed !== null && (Array.isArray(parsed) || typeof parsed === "object")) {
							const object = safeParseProtoValue(parsed);
							return { ...object, type: "object" };
						}
						return safeParseProtoValue(parsed);
					}
					const s = unquoteIfNeeded(val.v);
					return { type: "string", value: s };
				}
				if (key === "boolean" && val?.v !== undefined) return { type: "boolean", value: !!val.v };
				if (key === "integer" && val?.v !== undefined) return { type: "number", value: Number(val.v) };
				if (key === "float" && val?.v !== undefined) return { type: "number", value: Number(val.v) };
				if (key === "list" && val?.vs) return { type: "array", value: val.vs.map(safeParseProtoValue) };
				if (key === "set" && val?.vs) return { type: "array", value: val.vs.map(safeParseProtoValue) };
				if (key === "dict" && Array.isArray(val?.items)) {
					const object: Record<string, any> = {};
					for (const item of val.items) {
						const k = safeParseProtoValue(item.k);
						const v = safeParseProtoValue(item.v);
						object[String(k.value)] = v.value;
					}
					return { type: "object", value: object };
				}
				if (key === "struct" && val) {
					const fields: Record<string, any> = {};
					for (const [k, v] of Object.entries(val.fields || {})) {
						const fv = safeParseProtoValue(v);
						fields[k] = fv.value;
					}
					return { type: "object", value: fields };
				}
				if (key === "module" && val) {
					const members: Record<string, any> = {};
					for (const [k, v] of Object.entries(val.members || {})) {
						const mv = safeParseProtoValue(v);
						members[k] = mv.value;
					}
					return { type: "object", value: members };
				}
				if (key === "symbol" && val?.name !== undefined) return { type: "string", value: val.name };
				if (key === "nothing") return { type: "undefined", value: undefined };
				if (key === "bytes") return { type: "bytes", value: val?.v };
				if (key === "custom" && val) {
					if (val.value !== undefined) {
						return safeParseProtoValue(val.value);
					}
					return { type: "object", value: val };
				}
				return { type: typeof val as ValueType, value: val };
			}
		}
		const out: Record<string, any> = {};
		for (const [k, v] of Object.entries(input)) {
			const kv = safeParseProtoValue(v);
			out[k] = kv.value;
		}
		return { type: "object", value: out };
	}
	if (input === null) return { type: "null", value: null };
	if (typeof input === "undefined") return { type: "undefined", value: null };
	if (typeof input === "string") return { type: "string", value: input };
	if (typeof input === "number") return { type: "number", value: input };
	if (typeof input === "boolean") return { type: "boolean", value: input };
	return { type: typeof input as ValueType, value: input };
};

export const safeJsonParse = (value: string) => {
	try {
		return JSON.parse(value);
	} catch {
		return undefined;
	}
};

export const detectBytesType = (
	bytes: Uint8Array | number[] | Buffer
): {
	displayString?: string;
	mimeType?: string;
	type: "utf8" | "ascii" | "json" | "image" | "pdf" | "proto" | "unknown";
	value: any;
} => {
	if (!bytes) {
		return { type: "unknown", value: new Uint8Array(0) };
	}

	const array = bytes instanceof Uint8Array ? bytes : Uint8Array.from(bytes);

	try {
		const asString = new TextDecoder("utf-8", { fatal: false }).decode(array);
		if (/^[\s!-~\u00A0-\uFFFF]+$/.test(asString)) {
			try {
				const parsed = JSON.parse(asString);
				if (typeof parsed === "object") return { type: "json", value: parsed, displayString: asString };
			} catch {
				/* not JSON, ignore */
			}
			return { type: "utf8", value: asString, displayString: asString };
		}
	} catch {
		/* Not UTF-8, ignore */
	}

	const headers: Record<string, number[]> = {
		png: [0x89, 0x50, 0x4e, 0x47],
		jpg: [0xff, 0xd8, 0xff],
		gif: [0x47, 0x49, 0x46, 0x38],
		pdf: [0x25, 0x50, 0x44, 0x46],
	};
	const startsWith = (array: Uint8Array, sig: number[]) => sig.every((v, i) => array[i] === v);

	if (startsWith(array, headers.png)) return { type: "image", value: array, mimeType: "image/png" };
	if (startsWith(array, headers.jpg)) return { type: "image", value: array, mimeType: "image/jpeg" };
	if (startsWith(array, headers.gif)) return { type: "image", value: array, mimeType: "image/gif" };
	if (startsWith(array, headers.pdf)) return { type: "pdf", value: array, mimeType: "application/pdf" };

	return { type: "unknown", value: array };
};
