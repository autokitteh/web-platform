import { featureFlags } from "@src/constants";
import { ConnectionAuthType } from "@src/enums";
import { Integrations, defaultGoogleConnectionName } from "@src/enums/components/connection.enum";
import { SelectOption } from "@src/interfaces/components";

/**
 * Complete mapping of all integrations to their available authentication methods
 */
export const integrationAuthTypesMapping: Record<string, SelectOption[]> = {
	[Integrations.github]: [
		{ label: "OAuth v2 - Default app", value: ConnectionAuthType.OauthDefault },
		{ label: "OAuth v2 - Private app", value: ConnectionAuthType.OauthPrivate },
		{ label: "PAT + Webhook", value: ConnectionAuthType.Pat },
	],

	[Integrations.slack]: [
		...(featureFlags.displaySlackSocketIntegration
			? [{ label: "Socket Mode", value: ConnectionAuthType.Socket }]
			: []),
		{ label: "OAuth v2 - Default app", value: ConnectionAuthType.OauthDefault },
		{ label: "OAuth v2 - Private app", value: ConnectionAuthType.OauthPrivate },
	],

	[Integrations.linear]: [
		...(featureFlags.linearHideDefaultOAuth
			? []
			: [{ label: "OAuth v2 - Default app", value: ConnectionAuthType.OauthDefault }]),
		{ label: "OAuth v2 - Private app", value: ConnectionAuthType.OauthPrivate },
		{ label: "API Key", value: ConnectionAuthType.ApiKey },
	],

	[Integrations.jira]: [
		{ label: "OAuth 2.0 App", value: ConnectionAuthType.Oauth },
		{ label: "User API Token / PAT", value: ConnectionAuthType.ApiToken },
	],

	[Integrations.confluence]: [
		{ label: "OAuth 2.0 App", value: ConnectionAuthType.Oauth },
		{ label: "User API Token / PAT", value: ConnectionAuthType.ApiToken },
	],

	[Integrations.twilio]: [
		{ label: "Auth Token", value: ConnectionAuthType.AuthToken },
		{ label: "API Key", value: ConnectionAuthType.ApiKey },
	],

	[Integrations.zoom]: [
		...(featureFlags.zoomHideDefaultOAuth
			? []
			: [{ label: "OAuth v2 - Default app", value: ConnectionAuthType.OauthDefault }]),
		{ label: "OAuth v2 - Private app", value: ConnectionAuthType.OauthPrivate },
		{ label: "Private Server-to-Server", value: ConnectionAuthType.serverToServer },
	],

	[Integrations.height]: [
		...(featureFlags.heightHideDefaultOAuth
			? []
			: [{ label: "OAuth v2 - Default app", value: ConnectionAuthType.OauthDefault }]),
		{ label: "OAuth v2 - Private app", value: ConnectionAuthType.OauthPrivate },
		{ label: "API Key", value: ConnectionAuthType.ApiKey },
	],

	[Integrations.aws]: [{ label: "AWS Config", value: ConnectionAuthType.AWSConfig }],

	[Integrations.auth0]: [{ label: "OAuth 2.0", value: ConnectionAuthType.Oauth }],

	[Integrations.asana]: [{ label: "Personal Access Token", value: ConnectionAuthType.Pat }],

	[Integrations.chatgpt]: [{ label: "API Key", value: ConnectionAuthType.Key }],

	[Integrations.discord]: [{ label: "Bot Token", value: ConnectionAuthType.Socket }],

	[Integrations.googlegemini]: [{ label: "API Key", value: ConnectionAuthType.ApiKey }],

	[Integrations.salesforce]: [{ label: "OAuth v2 - Private app", value: ConnectionAuthType.OauthPrivate }],

	[Integrations.microsoft_teams]: [
		{ label: "Default user-delegated app", value: ConnectionAuthType.OauthDefault },
		{ label: "Private user-delegated app", value: ConnectionAuthType.OauthPrivate },
		{ label: "Private daemon application", value: ConnectionAuthType.DaemonApp },
	],

	[Integrations.hubspot]: [{ label: "OAuth v2 - Default app", value: ConnectionAuthType.OauthDefault }],

	[defaultGoogleConnectionName]: [
		{ label: "User (OAuth 2.0)", value: ConnectionAuthType.Oauth },
		{ label: "Service Account (JSON Key)", value: ConnectionAuthType.JsonKey },
	],

	[Integrations.gmail]: [
		{ label: "User (OAuth 2.0)", value: ConnectionAuthType.Oauth },
		{ label: "Service Account (JSON Key)", value: ConnectionAuthType.JsonKey },
	],

	[Integrations.sheets]: [
		{ label: "User (OAuth 2.0)", value: ConnectionAuthType.Oauth },
		{ label: "Service Account (JSON Key)", value: ConnectionAuthType.JsonKey },
	],

	[Integrations.calendar]: [
		{ label: "User (OAuth 2.0)", value: ConnectionAuthType.Oauth },
		{ label: "Service Account (JSON Key)", value: ConnectionAuthType.JsonKey },
	],

	[Integrations.drive]: [
		{ label: "User (OAuth 2.0)", value: ConnectionAuthType.Oauth },
		{ label: "Service Account (JSON Key)", value: ConnectionAuthType.JsonKey },
	],

	[Integrations.forms]: [
		{ label: "User (OAuth 2.0)", value: ConnectionAuthType.Oauth },
		{ label: "Service Account (JSON Key)", value: ConnectionAuthType.JsonKey },
	],
};

export const getAuthTypesForIntegration = (integration?: string): SelectOption[] | undefined => {
	if (!integration) return undefined;
	if (
		[
			Integrations.gmail,
			Integrations.sheets,
			Integrations.calendar,
			Integrations.drive,
			Integrations.forms,
		].includes(integration as Integrations)
	) {
		return integrationAuthTypesMapping[defaultGoogleConnectionName];
	}

	return integrationAuthTypesMapping[integration];
};

export const getDefaultAuthMethodForIntegration = (integration: string): SelectOption | undefined => {
	const methods = getAuthTypesForIntegration(integration);
	return methods && methods.length > 0 ? methods[0] : undefined;
};
