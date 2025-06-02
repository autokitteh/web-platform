import { Value as ProtoValue } from "@src/autokitteh/proto/gen/ts/autokitteh/values/v1/values_pb";
import { Value } from "@src/types/models";

interface ConvertValueOptions {
	includeTypeInfo?: boolean;
	formatForDisplay?: boolean;
}

interface FormattedValueResult {
	stringValue: string;
	jsonValue: any;
}

// Helper function to create formatted result with type info
const createFormattedResult = (
	stringValue: string,
	type: string,
	value: any,
	includeTypeInfo = false
): FormattedValueResult => {
	return {
		stringValue,
		jsonValue: includeTypeInfo ? { type, value } : value,
	};
};

const formatComplexValue = (convertedValue: any): FormattedValueResult => {
	return {
		stringValue: JSON.stringify(convertedValue, null, 2),
		jsonValue: convertedValue,
	};
};

export const convertValue = (
	value?: ProtoValue | string,
	options?: ConvertValueOptions
): Value[string] | FormattedValueResult => {
	const { includeTypeInfo = false, formatForDisplay = false } = options || {};

	if (typeof value === "string") {
		const stringResult = { string: value };
		return formatForDisplay ? createFormattedResult(value, "string", value, includeTypeInfo) : stringResult;
	}

	if (!value) {
		const nothingResult = { nothing: undefined };
		return formatForDisplay ? createFormattedResult("null", "nothing", null, includeTypeInfo) : nothingResult;
	}

	if (formatForDisplay && value.string?.v) {
		const stringValue = value.string.v;

		if (stringValue.startsWith("|struct:") && stringValue.endsWith("|")) {
			const structType = stringValue.slice(8, -1).trim();
			return {
				stringValue,
				jsonValue: {
					type: "struct",
					structType: structType,
					raw: stringValue,
				},
			};
		}

		try {
			const parsed = JSON.parse(stringValue);
			return {
				stringValue,
				jsonValue: parsed,
			};
		} catch {
			return createFormattedResult(stringValue, "string", stringValue, includeTypeInfo);
		}
	}

	if (value.nothing) {
		const nothingResult = { nothing: undefined };
		return formatForDisplay ? createFormattedResult("null", "nothing", null, includeTypeInfo) : nothingResult;
	}

	if (value.boolean) {
		const booleanResult = { boolean: value.boolean.v };
		return formatForDisplay
			? createFormattedResult(String(value.boolean.v), "boolean", value.boolean.v, includeTypeInfo)
			: booleanResult;
	}

	if (value.string) {
		const stringResult = { string: value.string.v };
		return formatForDisplay
			? createFormattedResult(value.string.v, "string", value.string.v, includeTypeInfo)
			: stringResult;
	}

	if (value.integer) {
		const integerResult = { integer: value.integer.v };
		return formatForDisplay
			? createFormattedResult(String(value.integer.v), "integer", value.integer.v, includeTypeInfo)
			: integerResult;
	}

	if (value.float) {
		const floatResult = { float: value.float.v };
		return formatForDisplay
			? createFormattedResult(String(value.float.v), "float", value.float.v, includeTypeInfo)
			: floatResult;
	}

	if (value.bytes) {
		const bytesResult = { bytes: value.bytes.v };
		if (formatForDisplay) {
			return {
				stringValue: `[Bytes: ${value.bytes.v.length} bytes]`,
				jsonValue: includeTypeInfo
					? {
							type: "bytes",
							length: value.bytes.v.length,
							value: value.bytes.v,
						}
					: value.bytes.v,
			};
		}
		return bytesResult;
	}

	// For complex types, convert normally then optionally format
	if (value.list) {
		const listResult = { list: { vs: value.list.vs.map((v) => convertValue(v)) } };
		return formatForDisplay ? formatComplexValue(listResult) : listResult;
	}

	if (value.set) {
		const setResult = { set: { vs: value.set.vs.map((v) => convertValue(v)) } };
		return formatForDisplay ? formatComplexValue(setResult) : setResult;
	}

	if (value.dict) {
		const dictResult = {
			dict: {
				items: value.dict.items.map((item) => ({
					k: convertValue(item.k!),
					v: convertValue(item.v!),
				})),
			},
		};
		return formatForDisplay ? formatComplexValue(dictResult) : dictResult;
	}

	if (value.time) {
		const timeResult = {
			time: value.time.v
				? { seconds: Number(value.time.v.seconds), nanos: value.time.v.nanos }
				: { seconds: 0, nanos: 0 },
		};
		return formatForDisplay ? formatComplexValue(timeResult) : timeResult;
	}

	if (value.duration) {
		const durationResult = {
			duration: value.duration.v
				? { seconds: Number(value.duration.v.seconds), nanos: value.duration.v.nanos }
				: { seconds: 0, nanos: 0 },
		};
		return formatForDisplay ? formatComplexValue(durationResult) : durationResult;
	}

	if (value.struct) {
		const structResult = {
			struct: {
				ctor: convertValue(value.struct.ctor!),
				fields: Object.fromEntries(Object.entries(value.struct.fields).map(([k, v]) => [k, convertValue(v)])),
			},
		};
		return formatForDisplay ? formatComplexValue(structResult) : structResult;
	}

	if (value.module) {
		const moduleResult = {
			module: {
				name: value.module.name,
				members: Object.fromEntries(Object.entries(value.module.members).map(([k, v]) => [k, convertValue(v)])),
			},
		};
		return formatForDisplay ? formatComplexValue(moduleResult) : moduleResult;
	}

	if (value.symbol) {
		const symbolResult = { symbol: { name: value.symbol.name } };
		return formatForDisplay ? formatComplexValue(symbolResult) : symbolResult;
	}

	if (value.function) {
		const functionResult = {
			function: {
				executorId: value.function.executorId,
				name: value.function.name,
				desc: value.function.desc,
				data: value.function.data,
				flags: value.function.flags,
			},
		};
		return formatForDisplay ? formatComplexValue(functionResult) : functionResult;
	}

	if (value.custom) {
		const customResult = {
			custom: {
				executorId: value.custom.executorId,
				data: value.custom.data,
				value: value.custom.value ? convertValue(value.custom.value) : undefined,
			},
		};
		return formatForDisplay ? formatComplexValue(customResult) : customResult;
	}

	throw new Error("Unexpected value type");
};
