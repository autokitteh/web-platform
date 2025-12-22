import { t } from "i18next";

import { LoggerService } from "@services";
import { namespaces } from "@src/constants";

export const convertPythonStringToJSON = (
	input: string
): { data?: { key: string; value: any } | string; error?: Error } => {
	try {
		let trimmedString = input.trim();

		if (trimmedString.startsWith('`"') && trimmedString.endsWith('"`')) {
			trimmedString = trimmedString.slice(2, -2);
		}
		if (trimmedString.startsWith('"') && trimmedString.endsWith('"')) {
			trimmedString = trimmedString.slice(1, -1);
		}

		if (trimmedString.startsWith("|") && trimmedString.endsWith("|")) {
			return { data: trimmedString, error: undefined };
		}

		if (trimmedString === "null") {
			return { data: "null", error: undefined };
		}

		if (trimmedString === "") {
			return { data: "", error: undefined };
		}

		if (!trimmedString.includes("{") && !trimmedString.includes("[") && !trimmedString.includes('"')) {
			return { data: trimmedString, error: undefined };
		}

		if (trimmedString.startsWith("{") && trimmedString.endsWith("}")) {
			try {
				return { data: JSON.parse(trimmedString), error: undefined };
			} catch {
				const jsonString = trimmedString.replace(/'/g, '"');
				try {
					return { data: JSON.parse(jsonString), error: undefined };
				} catch (parseError) {
					LoggerService.error(
						namespaces.templatesUtility,
						t("sessions.viewer.couldnotConvertObjectToJsonExtended", {
							ns: "deployments",
							error: parseError,
							input: jsonString,
						})
					);
					return { data: trimmedString, error: undefined };
				}
			}
		}

		if (trimmedString.startsWith("[") && trimmedString.endsWith("]")) {
			try {
				return { data: JSON.parse(trimmedString), error: undefined };
			} catch {
				const jsonString = trimmedString.replace(/'/g, '"');
				try {
					return { data: JSON.parse(jsonString), error: undefined };
				} catch (parseError) {
					LoggerService.error(
						namespaces.templatesUtility,
						t("sessions.viewer.couldnotConvertArrayToJsonExtended", {
							ns: "deployments",
							error: parseError,
							input: jsonString,
						})
					);
					return { data: trimmedString, error: undefined };
				}
			}
		}

		try {
			return { data: JSON.parse(trimmedString), error: undefined };
		} catch {
			const jsonString = trimmedString.replace(/'/g, '"');
			try {
				return { data: JSON.parse(jsonString), error: undefined };
			} catch {
				return { data: trimmedString, error: undefined };
			}
		}
	} catch (error) {
		LoggerService.error(
			namespaces.templatesUtility,
			t("sessions.viewer.generalConversionErrorExtended", {
				ns: "deployments",
				error: error instanceof Error ? error.message : String(error),
				input: input,
			})
		);
		return {
			data: undefined,
			error: new Error(
				t("sessions.viewer.generalConversionError", {
					ns: "deployments",
					error: error instanceof Error ? error.message : String(error),
					input: input,
				})
			),
		};
	}
};
