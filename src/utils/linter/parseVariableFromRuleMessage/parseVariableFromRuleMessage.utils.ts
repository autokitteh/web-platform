import { namespaces } from "@src/constants/namespaces.logger.constants";
import i18n from "@src/i18n";
import { LoggerService } from "@src/services/logger.service";

export function parseVariableFromRuleMessage(ruleMessage: string | undefined | null): string | null {
	const t = i18n.getFixedT("en", "projects", "outputLog");
	if (!ruleMessage || typeof ruleMessage !== "string" || ruleMessage.trim() === "") {
		LoggerService.debug(namespaces.ui.variables, t("variableParsingSkipped", { type: typeof ruleMessage }));
		return null;
	}

	const variableNamePatternInRuleViolationMessage = /variable\s+"([^"]+)"\s+is\s+empty/i;

	try {
		const match = ruleMessage.match(variableNamePatternInRuleViolationMessage);

		if (match && match[1]) {
			const variableName = match[1].trim();

			if (variableName === "") {
				LoggerService.warn(
					namespaces.ui.variables,
					t("errors.variableParsingFailedEmpty", { message: ruleMessage })
				);
				return null;
			}

			LoggerService.debug(
				namespaces.ui.variables,
				t("variableParsingSuccess", { variableName, message: ruleMessage })
			);

			return variableName;
		}

		LoggerService.warn(namespaces.ui.variables, t("errors.variableParsingFailedPattern", { message: ruleMessage }));

		return null;
	} catch (error) {
		LoggerService.error(
			namespaces.ui.variables,
			t("errors.variableParsingError", {
				message: ruleMessage,
				error: error instanceof Error ? error.message : t("errors.unknownError"),
			})
		);
		return null;
	}
}
