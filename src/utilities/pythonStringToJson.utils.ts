import { t } from "i18next";

import { LoggerService } from "@services";
import { namespaces } from "@src/constants";

type ParsedData = { key: string; value: any } | string;
type ParseResult = { data?: ParsedData; error?: Error };

const tryParseWithFallback = (
	input: string,
	errorTranslationKey?: string
): { parsed: ParsedData | undefined; success: boolean } => {
	try {
		return { parsed: JSON.parse(input), success: true };
	} catch {
		const jsonString = input.replace(/'/g, '"');
		try {
			return { parsed: JSON.parse(jsonString), success: true };
		} catch (parseError) {
			if (errorTranslationKey) {
				LoggerService.error(
					namespaces.templatesUtility,
					t(errorTranslationKey, {
						ns: "deployments",
						error: parseError,
						input: jsonString,
					})
				);
			}
			return { parsed: undefined, success: false };
		}
	}
};

export const convertPythonStringToJSON = (input: string): ParseResult => {
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
			const { parsed, success } = tryParseWithFallback(
				trimmedString,
				"sessions.viewer.couldnotConvertObjectToJsonExtended"
			);
			return { data: success ? parsed : trimmedString, error: undefined };
		}

		if (trimmedString.startsWith("[") && trimmedString.endsWith("]")) {
			const { parsed, success } = tryParseWithFallback(
				trimmedString,
				"sessions.viewer.couldnotConvertArrayToJsonExtended"
			);
			return { data: success ? parsed : trimmedString, error: undefined };
		}

		const { parsed, success } = tryParseWithFallback(trimmedString);
		return { data: success ? parsed : trimmedString, error: undefined };
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
