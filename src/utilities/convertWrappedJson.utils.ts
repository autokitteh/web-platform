import i18n from "i18next";

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
		const value = convertValue(wrappedValue as unknown as ProtoValue);

		if (isWrappedJsonValueWithString(value)) {
			try {
				result[key] = JSON.parse(value.string);
			} catch (error) {
				if (typeof value.string === "string") {
					result[key] = value.string;

					continue;
				}
				const errorMessage = i18n.t("convertWrappedJsonError", {
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

export const safeJsonParse = (value: string) => {
	try {
		return JSON.parse(value);
	} catch {
		return null;
	}
};
