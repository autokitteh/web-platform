import { LoggerService } from "@services";
import { namespaces } from "@src/constants";

export const convertPythonStringToJSON = (
	input: string
): { data?: { key: string; value: any } | string; error?: Error } => {
	try {
		let trimmedString = input.trim();

		// Log the original input for debugging
		LoggerService.debug(namespaces.templatesUtility, `convertPythonStringToJSON input: ${JSON.stringify(input)}`);

		if (trimmedString.startsWith('`"') && trimmedString.endsWith('"`')) {
			trimmedString = trimmedString.slice(2, -2);
		}
		if (trimmedString.startsWith('"') && trimmedString.endsWith('"')) {
			trimmedString = trimmedString.slice(1, -1);
		}

		// Handle special struct/function format strings like "|struct: SlackResponse|"
		if (trimmedString.startsWith("|") && trimmedString.endsWith("|")) {
			return { data: trimmedString, error: undefined };
		}

		// Handle literal "null" string
		if (trimmedString === "null") {
			return { data: "null", error: undefined };
		}

		// Handle empty strings
		if (trimmedString === "") {
			return { data: "", error: undefined };
		}

		// Handle basic non-JSON strings that don't need parsing
		if (!trimmedString.includes("{") && !trimmedString.includes("[") && !trimmedString.includes('"')) {
			return { data: trimmedString, error: undefined };
		}

		const jsonString = trimmedString.replace(/'/g, '"');
		LoggerService.debug(namespaces.templatesUtility, `About to parse JSON: ${JSON.stringify(jsonString)}`);

		if (jsonString.startsWith("{") && jsonString.endsWith("}")) {
			try {
				return { data: JSON.parse(jsonString), error: undefined };
			} catch (parseError) {
				LoggerService.error(
					namespaces.templatesUtility,
					`JSON.parse error for object: ${parseError} Input was: ${JSON.stringify(jsonString)}`
				);
				// Instead of throwing, return the string as-is
				return { data: trimmedString, error: undefined };
			}
		}

		if (jsonString.startsWith("[") && jsonString.endsWith("]")) {
			try {
				return { data: JSON.parse(jsonString), error: undefined };
			} catch (parseError) {
				LoggerService.error(
					namespaces.templatesUtility,
					`JSON.parse error for array: ${parseError} Input was: ${JSON.stringify(jsonString)}`
				);
				// Instead of throwing, return the string as-is
				return { data: trimmedString, error: undefined };
			}
		}

		try {
			return { data: JSON.parse(jsonString), error: undefined };
		} catch {
			LoggerService.debug(
				namespaces.templatesUtility,
				`JSON.parse failed, returning as string: ${JSON.stringify(jsonString)}`
			);
			return { data: jsonString, error: undefined };
		}
	} catch (error) {
		LoggerService.error(
			namespaces.templatesUtility,
			`convertPythonStringToJSON error: ${error} Input was: ${JSON.stringify(input)}`
		);
		// Don't throw an error, just return the original string
		return { data: input, error: undefined };
	}
};
