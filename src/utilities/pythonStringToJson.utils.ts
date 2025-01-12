import i18n from "i18next";

import { LoggerService } from "@services/logger.service";
import { namespaces } from "@src/constants";

export const convertPythonStringToJSON = (input: string): { data?: { key: string; value: any }; error?: Error } => {
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

		return { data: JSON.parse(jsonString), error: undefined };
	} catch (error) {
		LoggerService.error(
			namespaces.templatesUtility,
			i18n.t("sessions.couldnotConvertArgumentsExtended", { ns: "deployments", error })
		);

		return {
			data: undefined,
			error: new Error(i18n.t("sessions.couldnotConvertArguments", { ns: "deployments" })),
		};
	}
};
