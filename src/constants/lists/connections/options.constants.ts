import { ConnectionAuthType, fitleredIntegrationsMap } from "@enums";
import { SelectOption } from "@interfaces/components";
import { featureFlags } from "@src/constants";
import { sortIntegrationsMapByLabel } from "@src/utilities";

const sortedIntegrationsMap = sortIntegrationsMapByLabel(fitleredIntegrationsMap);
export const integrationTypes: SelectOption[] = Object.values(sortedIntegrationsMap);

export const integrationIcons: Record<string, React.ComponentType<React.SVGProps<SVGSVGElement>>> = Object.fromEntries(
	Object.entries(fitleredIntegrationsMap)
		.filter(([, value]) => value.icon !== undefined)
		.map(([key, value]) => [key, value.icon!])
);

export const githubIntegrationAuthMethods: SelectOption[] = [
	{ label: "OAuth v2 - Default app", value: ConnectionAuthType.Oauth },
	{ label: "OAuth v2 - Default app", value: ConnectionAuthType.OauthDefault },
	{ label: "OAuth v2 - Private app", value: ConnectionAuthType.OauthPrivate },
	{ label: "PAT + Webhook", value: ConnectionAuthType.Pat },
];

const linearDisplayOAuth = featureFlags.linearHideDefaultOAuth
	? []
	: [{ label: "OAuth v2 - Default app", value: ConnectionAuthType.OauthDefault }];

export const linearIntegrationAuthMethods: SelectOption[] = [
	...linearDisplayOAuth,
	{ label: "OAuth v2 - Private app", value: ConnectionAuthType.OauthPrivate },
	{ label: "API Key", value: ConnectionAuthType.ApiKey },
];

const salesforceDisplayOAuth = featureFlags.salesforceHideDefaultOAuth
	? []
	: [{ label: "OAuth v2 - Default app", value: ConnectionAuthType.OauthDefault }];

export const salesforceIntegrationAuthMethods: SelectOption[] = [
	...salesforceDisplayOAuth,
	{ label: "OAuth v2 - Private app", value: ConnectionAuthType.OauthPrivate },
];

const zoomDisplayOAuth = featureFlags.zoomHideDefaultOAuth
	? []
	: [{ label: "OAuth v2 - Default app", value: ConnectionAuthType.OauthDefault }];
export const zoomIntegrationAuthMethods: SelectOption[] = [
	...zoomDisplayOAuth,
	{ label: "OAuth v2 - Private app", value: ConnectionAuthType.OauthPrivate },
	{ label: "Private Server-to-Server", value: ConnectionAuthType.serverToServer },
];

export const selectIntegrationGoogle: SelectOption[] = [
	{ label: "User (OAuth 2.0)", value: ConnectionAuthType.Oauth },
	{ label: "Service Account (JSON Key)", value: ConnectionAuthType.Json },
];

const slackSocketMode = { label: "Socket Mode", value: ConnectionAuthType.Socket };

const baseSelectIntegrationSlack = [
	{ label: "OAuth v2 - Default app", value: ConnectionAuthType.OauthDefault },
	{ label: "OAuth v2 - Private app", value: ConnectionAuthType.OauthPrivate },
];

export const selectIntegrationSlack: SelectOption[] = featureFlags.displaySlackSocketIntegration
	? baseSelectIntegrationSlack.concat(slackSocketMode)
	: baseSelectIntegrationSlack;

export const getSlackOptionsForLegacyAuth = (): SelectOption[] => {
	const options = [...selectIntegrationSlack];
	const oauthDefaultIndex = options.findIndex((opt) => opt.value === ConnectionAuthType.OauthDefault);
	if (oauthDefaultIndex !== -1) {
		options[oauthDefaultIndex] = { label: "OAuth v2 - Default app", value: ConnectionAuthType.Oauth };
	}
	return options;
};

const microsoftDisplayOAuth = featureFlags.microsoftHideDefaultOAuth
	? []
	: [{ label: "Default user-delegated app", value: ConnectionAuthType.OauthDefault }];

export const microsoftTeamsIntegrationAuthMethods: SelectOption[] = [
	...microsoftDisplayOAuth,
	{ label: "Private user-delegated app", value: ConnectionAuthType.OauthPrivate },
	{ label: "Private daemon application", value: ConnectionAuthType.DaemonApp },
];

export const selectIntegrationAws: SelectOption[] = [
	{
		label: "Africa (Cape Town)",
		value: "af-south-1",
	},
	{
		label: "Asia Pacific (Hong Kong)",
		value: "ap-east-1",
	},
	{
		label: "Asia Pacific (Tokyo)",
		value: "ap-northeast-1",
	},
	{
		label: "Asia Pacific (Seoul)",
		value: "ap-northeast-2",
	},
	{
		label: "Asia Pacific (Osaka)",
		value: "ap-northeast-3",
	},
	{
		label: "Asia Pacific (Mumbai)",
		value: "ap-south-1",
	},
	{
		label: "Asia Pacific (Hyderabad)",
		value: "ap-south-2",
	},
	{
		label: "Asia Pacific (Singapore)",
		value: "ap-southeast-1",
	},
	{
		label: "Asia Pacific (Sydney)",
		value: "ap-southeast-2",
	},
	{
		label: "Asia Pacific (Jakarta)",
		value: "ap-southeast-3",
	},
	{
		label: "Asia Pacific (Melbourne)",
		value: "ap-southeast-4",
	},
	{
		label: "Asia Pacific (Malaysia)",
		value: "ap-southeast-5",
	},
	{
		label: "Canada (Central)",
		value: "ca-central-1",
	},
	{
		label: "Canada West (Calgary)",
		value: "ca-west-1",
	},
	{
		label: "China (Beijing)",
		value: "cn-north-1",
	},
	{
		label: "China (Ningxia)",
		value: "cn-northwest-1",
	},
	{
		label: "Europe (Frankfurt)",
		value: "eu-central-1",
	},
	{
		label: "Europe (Zurich)",
		value: "eu-central-2",
	},
	{
		label: "Europe (Stockholm)",
		value: "eu-north-1",
	},
	{
		label: "Europe (Milan)",
		value: "eu-south-1",
	},
	{
		label: "Europe (Spain)",
		value: "eu-south-2",
	},
	{
		label: "Europe (Ireland)",
		value: "eu-west-1",
	},
	{
		label: "Europe (London)",
		value: "eu-west-2",
	},
	{
		label: "Europe (Paris)",
		value: "eu-west-3",
	},
	{
		label: "Israel (Tel Aviv)",
		value: "il-central-1",
	},
	{
		label: "Middle East (UAE)",
		value: "me-central-1",
	},
	{
		label: "Middle East (Bahrain)",
		value: "me-south-1",
	},
	{
		label: "South America (Sao Paulo)",
		value: "sa-east-1",
	},
	{
		label: "US East (N. Virginia)",
		value: "us-east-1",
	},
	{
		label: "US East (Ohio)",
		value: "us-east-2",
	},
	{
		label: "AWS GovCloud (US-East)",
		value: "us-gov-east-1",
	},
	{
		label: "AWS GovCloud (US-West)",
		value: "us-gov-west-1",
	},
	{
		label: "US West (N. California)",
		value: "us-west-1",
	},
	{
		label: "US West (Oregon)",
		value: "us-west-2",
	},
];

export const selectIntegrationLinearActor: SelectOption[] = [
	{
		label: "User",
		value: "user",
	},
	{
		label: "Application",
		value: "application",
	},
];

export const selectIntegrationHttp: SelectOption[] = [
	{ label: "No Auth", value: ConnectionAuthType.NoAuth },
	{ label: "Basic", value: ConnectionAuthType.Basic, disabled: true },
	{ label: "Bearer", value: ConnectionAuthType.Bearer, disabled: true },
];

export const selectIntegrationTwilio: SelectOption[] = [{ label: "API Token", value: ConnectionAuthType.ApiToken }];

export const selectIntegrationJira: SelectOption[] = [
	{ label: "OAuth 2.0 App", value: ConnectionAuthType.Oauth },
	{ label: "User API Token / PAT", value: ConnectionAuthType.ApiToken },
];

export const selectIntegrationConfluence: SelectOption[] = [
	{ label: "OAuth 2.0 App", value: ConnectionAuthType.Oauth },
	{ label: "User API Token / PAT", value: ConnectionAuthType.ApiToken },
];

const notionDisplayOAuth = featureFlags.notionHideDefaultOAuth
	? []
	: [{ label: "OAuth v2 - Default app", value: ConnectionAuthType.OauthDefault }];

export const notionIntegrationAuthMethods: SelectOption[] = [
	...notionDisplayOAuth,
	{ label: "API Key", value: ConnectionAuthType.ApiKey },
];
