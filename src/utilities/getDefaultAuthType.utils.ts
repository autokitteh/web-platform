import { formsPerIntegrationsMapping } from "@src/constants";
import { ConnectionAuthType } from "@src/enums";
import { Integrations } from "@src/enums/components";
import { SelectOption } from "@src/interfaces/components";
import { getSingleAuthTypeIfForced } from "@src/utilities/forceAuthType.utils";

export const getDefaultAuthType = (options: SelectOption[], integration?: keyof typeof Integrations): SelectOption => {
	if (!options || options.length === 0) {
		throw new Error("getDefaultAuthType: No auth options available");
	}

	if (integration) {
		const forcedAuthType = getSingleAuthTypeIfForced(integration);
		if (forcedAuthType) {
			const forcedOption = options.find((option) => option.value === forcedAuthType);
			if (forcedOption) {
				return forcedOption;
			}
		}

		const availableAuthTypes = Object.keys(formsPerIntegrationsMapping[integration] || {}) as ConnectionAuthType[];
		const availableOptions = options.filter((option) =>
			availableAuthTypes.includes(option.value as ConnectionAuthType)
		);

		const oauthOption = availableOptions.find(
			(option) => option.value === ConnectionAuthType.Oauth || option.value === ConnectionAuthType.OauthDefault
		);

		if (oauthOption) {
			return oauthOption;
		}

		if (availableOptions.length > 0) {
			return availableOptions[0];
		}
	}

	const oauthOption = options.find(
		(option) => option.value === ConnectionAuthType.Oauth || option.value === ConnectionAuthType.OauthDefault
	);

	if (oauthOption) {
		return oauthOption;
	}

	return options[0];
};
