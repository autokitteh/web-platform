import { t } from "i18next";

import { Value as ProtoValue } from "@ak-proto-ts/values/v1/values_pb";
import { namespaces } from "@constants";
import { convertValue } from "@models";
import { LoggerService } from "@services/index";
import { Value } from "@type/models";
import { isWrappedJsonValueWithString } from "@type/models/value.type";

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

export const safeJsonParse = (value: string) => {
	try {
		return JSON.parse(value);
	} catch {
		return null;
	}
};
