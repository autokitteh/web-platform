import { t } from "i18next";

import { LoggerService } from "@services/index";
import { Value as ProtoValue } from "@src/autokitteh/proto/gen/ts/autokitteh/values/v1/values_pb";
import { namespaces } from "@src/constants";
import { convertValue } from "@src/models";
import { Value } from "@src/types/models";
import { isWrappedJsonValueWithString } from "@src/types/models/value.type";

export const parseNestedJson = (object: Value): Record<string, any> => {
	if (!object) return {};
	const result: Record<string, any> = {};

	for (const key in object) {
		if (!Object.prototype.hasOwnProperty.call(object, key)) continue;

		const wrappedValue = object[key];

		const value = convertValue(wrappedValue as ProtoValue | string);

		if (isWrappedJsonValueWithString(value)) {
			try {
				result[key] = JSON.parse(value.string);
			} catch (error) {
				if (typeof value.string === "string") {
					result[key] = value.string;

					continue;
				}
				const errorMessage = t("convertWrappedJsonError", {
					error: (error as Error).message,
					ns: "services",
					key,
				});
				LoggerService.error(namespaces.sessionsService, errorMessage, true);
				result[key] = errorMessage;
			}
		} else {
			result[key] = value;
		}
	}

	return result;
};

export const parseReturnValue = (returnValue: ProtoValue): { jsonValue?: any; stringValue?: string } => {
	if (!returnValue) {
		return {};
	}

	try {
		// Handle string values
		if (returnValue.string?.v) {
			const stringValue = returnValue.string.v;

			// Handle structured responses like "|struct: Response|"
			if (stringValue.startsWith("|struct:") && stringValue.endsWith("|")) {
				const structType = stringValue.slice(8, -1).trim(); // Remove "|struct:" and "|"
				return {
					stringValue,
					jsonValue: {
						type: "struct",
						structType: structType,
						raw: stringValue,
					},
				};
			}

			// Try to parse as JSON
			try {
				const parsed = JSON.parse(stringValue);
				return {
					stringValue,
					jsonValue: parsed,
				};
			} catch {
				// Keep as string if not valid JSON
				return {
					stringValue,
					jsonValue: {
						type: "string",
						value: stringValue,
					},
				};
			}
		}

		// Handle struct values directly
		if (returnValue.struct) {
			const convertedStruct = convertValue(returnValue);
			return {
				stringValue: JSON.stringify(convertedStruct, null, 2),
				jsonValue: convertedStruct,
			};
		}

		// Handle list values
		if (returnValue.list) {
			const convertedList = convertValue(returnValue);
			return {
				stringValue: JSON.stringify(convertedList, null, 2),
				jsonValue: convertedList,
			};
		}

		// Handle dict values
		if (returnValue.dict) {
			const convertedDict = convertValue(returnValue);
			return {
				stringValue: JSON.stringify(convertedDict, null, 2),
				jsonValue: convertedDict,
			};
		}

		// Handle boolean values
		if (returnValue.boolean !== undefined) {
			const boolValue = returnValue.boolean.v;
			return {
				stringValue: String(boolValue),
				jsonValue: { type: "boolean", value: boolValue },
			};
		}

		// Handle integer values
		if (returnValue.integer !== undefined) {
			const intValue = returnValue.integer.v;
			return {
				stringValue: String(intValue),
				jsonValue: { type: "integer", value: intValue },
			};
		}

		// Handle float values
		if (returnValue.float !== undefined) {
			const floatValue = returnValue.float.v;
			return {
				stringValue: String(floatValue),
				jsonValue: { type: "float", value: floatValue },
			};
		}

		// Handle time values
		if (returnValue.time) {
			const timeValue = convertValue(returnValue);
			return {
				stringValue: JSON.stringify(timeValue, null, 2),
				jsonValue: timeValue,
			};
		}

		// Handle duration values
		if (returnValue.duration) {
			const durationValue = convertValue(returnValue);
			return {
				stringValue: JSON.stringify(durationValue, null, 2),
				jsonValue: durationValue,
			};
		}

		// Handle bytes values
		if (returnValue.bytes) {
			return {
				stringValue: `[Bytes: ${returnValue.bytes.v.length} bytes]`,
				jsonValue: {
					type: "bytes",
					length: returnValue.bytes.v.length,
					value: returnValue.bytes.v,
				},
			};
		}

		// Handle nothing/null values
		if (returnValue.nothing !== undefined) {
			return {
				stringValue: "null",
				jsonValue: { type: "nothing", value: null },
			};
		}

		// Handle function values
		if (returnValue.function) {
			const functionValue = convertValue(returnValue);
			return {
				stringValue: JSON.stringify(functionValue, null, 2),
				jsonValue: functionValue,
			};
		}

		// Handle symbol values
		if (returnValue.symbol) {
			const symbolValue = convertValue(returnValue);
			return {
				stringValue: JSON.stringify(symbolValue, null, 2),
				jsonValue: symbolValue,
			};
		}

		// Handle module values
		if (returnValue.module) {
			const moduleValue = convertValue(returnValue);
			return {
				stringValue: JSON.stringify(moduleValue, null, 2),
				jsonValue: moduleValue,
			};
		}

		// Handle custom values
		if (returnValue.custom) {
			const customValue = convertValue(returnValue);
			return {
				stringValue: JSON.stringify(customValue, null, 2),
				jsonValue: customValue,
			};
		}

		// Fallback: convert any other value type
		const fallbackValue = convertValue(returnValue);
		return {
			stringValue: JSON.stringify(fallbackValue, null, 2),
			jsonValue: fallbackValue,
		};
	} catch (error) {
		LoggerService.error(
			namespaces.sessionsService,
			t("returnValueParseError", {
				error: (error as Error).message,
				ns: "services",
			}),
			true
		);

		return {
			stringValue: `[Parse Error: ${(error as Error).message}]`,
			jsonValue: {
				type: "error",
				message: (error as Error).message,
			},
		};
	}
};

export const safeJsonParse = (value: string) => {
	try {
		return JSON.parse(value);
	} catch {
		return null;
	}
};
