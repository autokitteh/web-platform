import i18n from "i18next";

import { LoggerService } from "@services/index";
import { Value } from "@src/autokitteh/proto/gen/ts/autokitteh/values/v1/values_pb";
import { namespaces } from "@src/constants";
import { WrappedJsonObject } from "@src/interfaces/utilities";
import { convertValue } from "@src/models";

export const parseNestedJson = (object: WrappedJsonObject): Record<string, string> => {
	if (!object) return {};
	const result: Record<string, any> = {};

	for (const key in object) {
		if (Object.prototype.hasOwnProperty.call(object, key)) {
			const value = convertValue(object[key] as Value);
			if (value && typeof value === "object" && "string" in value && value && value.string) {
				try {
					result[key] = JSON.parse(value.string);
				} catch (error) {
					const errorMessage = i18n.t("convertWrappedJsonError", {
						error: (error as Error).message,
						ns: "errors",
						key,
					});
					LoggerService.error(namespaces.sessionsService, errorMessage);
					result[key] = errorMessage;
				}
			} else {
				result[key] = value;
			}
		}
	}

	return result;
};
