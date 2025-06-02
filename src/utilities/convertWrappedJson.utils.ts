import { Value as ProtoValue } from "@src/autokitteh/proto/gen/ts/autokitteh/values/v1/values_pb";
import { ConvertValueOptions, FormattedValueResult } from "@src/interfaces/utilities";

const createFormattedResult = (
	stringValue: string,
	type: string,
	value: any,
	includeTypeInfo = false
): FormattedValueResult => ({
	stringValue,
	jsonValue: includeTypeInfo ? { type, value } : value,
});

export const convertValue = (
	value?: ProtoValue | string,
	options: ConvertValueOptions = {}
): FormattedValueResult | Record<string, any> => {
	if (typeof value === "string") {
		const parsed = safeJsonParse(value);
		if (parsed !== undefined) {
			return options.formatForDisplay
				? createFormattedResult(value, "string", parsed, options.includeTypeInfo)
				: { string: parsed };
		}
		return options.formatForDisplay
			? createFormattedResult(value, "string", value, options.includeTypeInfo)
			: { string: value };
	}

	if (!value) {
		return options.formatForDisplay
			? createFormattedResult("null", "nothing", null, options.includeTypeInfo)
			: { nothing: undefined };
	}

	if (value.nothing) {
		return options.formatForDisplay
			? createFormattedResult("null", "nothing", null, options.includeTypeInfo)
			: { nothing: undefined };
	}
	if (value.boolean) {
		return options.formatForDisplay
			? createFormattedResult(String(value.boolean.v), "boolean", value.boolean.v, options.includeTypeInfo)
			: { boolean: value.boolean.v };
	}
	if (value.string) {
		const str = value.string.v;
		const parsed = safeJsonParse(str);
		if (parsed !== undefined) {
			return options.formatForDisplay
				? createFormattedResult(str, "string", parsed, options.includeTypeInfo)
				: { string: parsed };
		}

		return options.formatForDisplay
			? createFormattedResult(str, "string", str, options.includeTypeInfo)
			: { string: str };
	}

	if (value.integer) {
		return options.formatForDisplay
			? createFormattedResult(String(value.integer.v), "integer", value.integer.v, options.includeTypeInfo)
			: { integer: value.integer.v };
	}
	if (value.float) {
		return options.formatForDisplay
			? createFormattedResult(String(value.float.v), "float", value.float.v, options.includeTypeInfo)
			: { float: value.float.v };
	}
	if (value.bytes) {
		return options.formatForDisplay
			? {
					stringValue: `[Bytes: ${value.bytes.v.length} bytes]`,
					jsonValue: options.includeTypeInfo
						? { type: "bytes", length: value.bytes.v.length, value: value.bytes.v }
						: value.bytes.v,
				}
			: { bytes: value.bytes.v };
	}

	const handleContainer = (container: any[]) => container.map((v) => convertValue(v, options));

	if (value.list) {
		const vs = handleContainer(value.list.vs);
		return options.formatForDisplay
			? {
					stringValue: JSON.stringify({ list: { vs } }, null, 2),
					jsonValue: { list: { vs } },
				}
			: { list: { vs } };
	}

	if (value.set) {
		const vs = handleContainer(value.set.vs);
		return options.formatForDisplay
			? {
					stringValue: JSON.stringify({ set: { vs } }, null, 2),
					jsonValue: { set: { vs } },
				}
			: { set: { vs } };
	}

	if (value.dict) {
		const items = value.dict.items.map((item) => ({
			k: convertValue(item.k!, options),
			v: convertValue(item.v!, options),
		}));
		return options.formatForDisplay
			? {
					stringValue: JSON.stringify({ dict: { items } }, null, 2),
					jsonValue: { dict: { items } },
				}
			: { dict: { items } };
	}

	if (value.time) {
		const v = value.time.v
			? { seconds: Number(value.time.v.seconds), nanos: value.time.v.nanos }
			: { seconds: 0, nanos: 0 };
		return options.formatForDisplay
			? {
					stringValue: JSON.stringify({ time: v }, null, 2),
					jsonValue: { time: v },
				}
			: { time: v };
	}

	if (value.duration) {
		const v = value.duration.v
			? { seconds: Number(value.duration.v.seconds), nanos: value.duration.v.nanos }
			: { seconds: 0, nanos: 0 };
		return options.formatForDisplay
			? {
					stringValue: JSON.stringify({ duration: v }, null, 2),
					jsonValue: { duration: v },
				}
			: { duration: v };
	}

	if (value.struct) {
		const ctor = convertValue(value.struct.ctor!, options);
		const fields = Object.fromEntries(
			Object.entries(value.struct.fields).map(([k, v]) => [k, convertValue(v, options)])
		);
		return options.formatForDisplay
			? {
					stringValue: JSON.stringify({ struct: { ctor, fields } }, null, 2),
					jsonValue: { struct: { ctor, fields } },
				}
			: { struct: { ctor, fields } };
	}

	if (value.module) {
		const members = Object.fromEntries(
			Object.entries(value.module.members).map(([k, v]) => [k, convertValue(v, options)])
		);
		return options.formatForDisplay
			? {
					stringValue: JSON.stringify({ module: { name: value.module.name, members } }, null, 2),
					jsonValue: { module: { name: value.module.name, members } },
				}
			: { module: { name: value.module.name, members } };
	}

	if (value.symbol) {
		return options.formatForDisplay
			? {
					stringValue: JSON.stringify({ symbol: { name: value.symbol.name } }, null, 2),
					jsonValue: { symbol: { name: value.symbol.name } },
				}
			: { symbol: { name: value.symbol.name } };
	}

	if (value.function) {
		const functionObj = {
			executorId: value.function.executorId,
			name: value.function.name,
			desc: value.function.desc,
			data: value.function.data,
			flags: value.function.flags,
		};
		return options.formatForDisplay
			? {
					stringValue: JSON.stringify({ function: functionObj }, null, 2),
					jsonValue: { function: functionObj },
				}
			: { function: functionObj };
	}

	if (value.custom) {
		const customObj = {
			executorId: value.custom.executorId,
			data: value.custom.data,
			value: value.custom.value ? convertValue(value.custom.value, options) : undefined,
		};
		return options.formatForDisplay
			? {
					stringValue: JSON.stringify({ custom: customObj }, null, 2),
					jsonValue: { custom: customObj },
				}
			: { custom: customObj };
	}

	throw new Error("Unexpected value type");
};

export const parseProtoValue = (
	proto: ProtoValue | Record<string, ProtoValue | string> | undefined,
	options: ConvertValueOptions = { formatForDisplay: true, includeTypeInfo: true }
): FormattedValueResult | Record<string, any> => {
	if (!proto || typeof proto === "string" || proto instanceof ProtoValue) {
		return convertValue(proto as ProtoValue | string, options) as FormattedValueResult;
	}
	const result: Record<string, any> = {};
	for (const [key, value] of Object.entries(proto)) {
		const converted = convertValue(value as ProtoValue | string, options);
		result[key] = (converted as FormattedValueResult).jsonValue ?? converted;
	}
	return result;
};

export const safeJsonParse = (value: string) => {
	try {
		return JSON.parse(value);
	} catch {
		return null;
	}
};

export const safeParseProtoValue = (val: any) => parseProtoValue(val)?.jsonValue ?? null;
