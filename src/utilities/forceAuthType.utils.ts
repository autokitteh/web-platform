import { featureFlags } from "@src/constants";
import { ConnectionAuthType } from "@src/enums";
import { Integrations } from "@src/enums/components";

type AuthType = ConnectionAuthType;

const baseAuthTypesPerIntegration: Partial<Record<Integrations, AuthType[]>> = {
	[Integrations.salesforce]: [ConnectionAuthType.OauthDefault, ConnectionAuthType.OauthPrivate],
	[Integrations.notion]: [ConnectionAuthType.OauthDefault, ConnectionAuthType.ApiKey],
};

function applyFeatureFlags(integration: Integrations, authTypes: AuthType[]): AuthType[] {
	let remaining = [...authTypes];

	if (integration === Integrations.salesforce && featureFlags.salesforceHideDefaultOAuth) {
		remaining = remaining.filter((t) => t !== ConnectionAuthType.OauthDefault);
	}
	if (integration === Integrations.notion && featureFlags.notionHideDefaultOAuth) {
		remaining = remaining.filter((t) => t !== ConnectionAuthType.OauthDefault);
	}

	return remaining;
}

export function getSingleAuthTypeIfForced(integration: keyof typeof Integrations): ConnectionAuthType | undefined {
	const base = baseAuthTypesPerIntegration[integration as Integrations];
	if (!base || base.length === 0) {
		return undefined;
	}
	const remaining = applyFeatureFlags(integration as Integrations, base);
	return remaining.length === 1 ? remaining[0] : undefined;
}
