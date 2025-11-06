import { formsPerIntegrationsMapping } from "@src/constants";
import { ConnectionAuthType } from "@src/enums";
import { Integrations } from "@src/enums/components";
import { SelectOption } from "@src/interfaces/components";

/**
 * Gets the default auth type from an array of auth method options.
 * Prefers OAuth or OauthDefault, otherwise returns the first option.
 * @param options Array of auth method options
 * @param integration Optional integration name to validate against available forms
 * @returns The default auth type option, or the first option if no OAuth variant exists
 */
export const getDefaultAuthType = (options: SelectOption[], integration?: keyof typeof Integrations): SelectOption => {
	if (!options || options.length === 0) {
		throw new Error("getDefaultAuthType: No auth options available");
	}

	// If integration is provided, filter to only available auth types for that integration
	let availableOptions = options;
	if (integration && formsPerIntegrationsMapping[integration]) {
		const availableAuthTypes = Object.keys(formsPerIntegrationsMapping[integration]) as ConnectionAuthType[];
		availableOptions = options.filter((option) => availableAuthTypes.includes(option.value as ConnectionAuthType));
	}

	// Prefer OAuth or OauthDefault
	const oauthOption = availableOptions.find(
		(option) => option.value === ConnectionAuthType.Oauth || option.value === ConnectionAuthType.OauthDefault
	);

	if (oauthOption) {
		return oauthOption;
	}

	// Fall back to first available option
	const firstOption = availableOptions[0];
	if (!firstOption) {
		throw new Error(`getDefaultAuthType: No valid auth type found for integration ${integration}`);
	}

	return firstOption;
};
