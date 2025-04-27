import { t } from "i18next";

import { namespaces } from "@constants";
import { LoggerService } from "@services";

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

		const jsonString = trimmedString.replace(/'/g, '"');
		if (jsonString.startsWith("{") && jsonString.endsWith("}")) {
			return { data: JSON.parse(jsonString), error: undefined };
		}

		try {
			return { data: JSON.parse(jsonString), error: undefined };
		} catch {
			return { data: jsonString, error: undefined };
		}
	} catch (error) {
		LoggerService.error(
			namespaces.templatesUtility,
			t("sessions.couldnotConvertArgumentsExtended", { ns: "deployments", error })
		);

		return {
			data: undefined,
			error: new Error(t("sessions.couldnotConvertArguments", { ns: "deployments" })),
		};
	}
};
