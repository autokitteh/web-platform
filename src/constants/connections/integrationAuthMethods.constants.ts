import { ZodSchema } from "zod";

import { ConnectionAuthType } from "@enums/connections/connectionTypes.enum";
import { SelectOption } from "@interfaces/components";
import { featureFlags } from "@src/constants";
import { Integrations } from "@src/enums/components/integrations.enum";
import {
	airtableOauthIntegrationSchema,
	airtablePatIntegrationSchema,
	asanaOauthIntegrationSchema,
	asanaPatIntegrationSchema,
	confluenceApiTokenIntegrationSchema,
	confluencePatIntegrationSchema,
	genericDefaultOauthSchema,
	githubIntegrationSchema,
	githubPrivateAuthIntegrationSchema,
	googleJsonIntegrationSchema,
	googleOauthSchema,
	jiraApiTokenIntegrationSchema,
	jiraPatIntegrationSchema,
	legacyOauthSchema,
	linearApiKeyIntegrationSchema,
	linearOauthIntegrationSchema,
	linearPrivateAuthIntegrationSchema,
	microsoftDaemonAppIntegrationSchema,
	microsoftOauthDefaultIntegrationSchema,
	microsoftOauthPrivateIntegrationSchema,
	notionApiKeyIntegrationSchema,
	notionOauthDefaultIntegrationSchema,
	salesforceOauthDefaultIntegrationSchema,
	salesforcePrivateAuthIntegrationSchema,
	slackOauthDefaultIntegrationSchema,
	slackPrivateAuthIntegrationSchema,
	slackSocketModeIntegrationSchema,
	twilioApiKeyIntegrationSchema,
	twilioTokenIntegrationSchema,
	zoomOauthDefaultIntegrationSchema,
	zoomPrivateAuthIntegrationSchema,
	zoomServerToServerIntegrationSchema,
} from "@validations/connection.schema";

const authMethodOptions: Record<ConnectionAuthType, SelectOption> = {
	apiKey: { label: "API Key", value: ConnectionAuthType.ApiKey },
	apiToken: { label: "API Token (Cloud)", value: ConnectionAuthType.ApiToken },
	authToken: { label: "Auth Token", value: ConnectionAuthType.AuthToken },
	awsConfig: { label: "AWS Config", value: ConnectionAuthType.AWSConfig },
	basic: { label: "Basic Auth", value: ConnectionAuthType.Basic },
	bearer: { label: "Bearer Token", value: ConnectionAuthType.Bearer },
	botToken: { label: "Bot Token", value: ConnectionAuthType.BotToken },
	daemonApp: { label: "Private daemon application", value: ConnectionAuthType.DaemonApp },
	initialized: { label: "Initialized", value: ConnectionAuthType.Initialized },
	json: { label: "Service Account (JSON)", value: ConnectionAuthType.Json },
	jsonKey: { label: "JSON Key", value: ConnectionAuthType.JsonKey },
	key: { label: "Key", value: ConnectionAuthType.Key },
	mode: { label: "Mode", value: ConnectionAuthType.Mode },
	microsoftOauthDefault: { label: "Default user-delegated app", value: ConnectionAuthType.MicrosoftOauthDefault },
	microsoftOauthPrivate: { label: "Private user-delegated app", value: ConnectionAuthType.MicrosoftOauthPrivate },
	noauth: { label: "No Auth", value: ConnectionAuthType.NoAuth },
	oauth: { label: "OAuth 2.0", value: ConnectionAuthType.Oauth },
	oauthApp: { label: "OAuth 2.0 App", value: ConnectionAuthType.OauthApp },
	oauthDefault: { label: "OAuth v2 - Default app", value: ConnectionAuthType.OauthDefault },
	oauthPrivate: { label: "OAuth v2 - Private app", value: ConnectionAuthType.OauthPrivate },
	oauthUser: { label: "User (OAuth 2.0)", value: ConnectionAuthType.OauthUser },
	pat: { label: "Personal Access Token (PAT)", value: ConnectionAuthType.Pat },
	patDataCenter: { label: "Personal Access Token (PAT - Data Center)", value: ConnectionAuthType.PatDataCenter },
	patWebhook: { label: "PAT + Webhook", value: ConnectionAuthType.PatWebhook },
	serverToServer: { label: "Private Server-to-Server", value: ConnectionAuthType.serverToServer },
	serviceAccount: { label: "Service Account", value: ConnectionAuthType.ServiceAccount },
	socket: { label: "Socket Mode", value: ConnectionAuthType.Socket },
} as const;

type AuthMethodConfig = {
	authType: ConnectionAuthType;
	schema: ZodSchema;
};

export const linearActorOptions: SelectOption[] = [
	{ label: "User", value: "user" },
	{ label: "Application", value: "application" },
];

export const awsRegionsOptions: SelectOption[] = [
	{ label: "Africa (Cape Town)", value: "af-south-1" },
	{ label: "Asia Pacific (Hong Kong)", value: "ap-east-1" },
	{ label: "Asia Pacific (Tokyo)", value: "ap-northeast-1" },
	{ label: "Asia Pacific (Seoul)", value: "ap-northeast-2" },
	{ label: "Asia Pacific (Osaka)", value: "ap-northeast-3" },
	{ label: "Asia Pacific (Mumbai)", value: "ap-south-1" },
	{ label: "Asia Pacific (Hyderabad)", value: "ap-south-2" },
	{ label: "Asia Pacific (Singapore)", value: "ap-southeast-1" },
	{ label: "Asia Pacific (Sydney)", value: "ap-southeast-2" },
	{ label: "Asia Pacific (Jakarta)", value: "ap-southeast-3" },
	{ label: "Asia Pacific (Melbourne)", value: "ap-southeast-4" },
	{ label: "Asia Pacific (Malaysia)", value: "ap-southeast-5" },
	{ label: "Canada (Central)", value: "ca-central-1" },
	{ label: "Canada West (Calgary)", value: "ca-west-1" },
	{ label: "China (Beijing)", value: "cn-north-1" },
	{ label: "China (Ningxia)", value: "cn-northwest-1" },
	{ label: "Europe (Frankfurt)", value: "eu-central-1" },
	{ label: "Europe (Zurich)", value: "eu-central-2" },
	{ label: "Europe (Stockholm)", value: "eu-north-1" },
	{ label: "Europe (Milan)", value: "eu-south-1" },
	{ label: "Europe (Spain)", value: "eu-south-2" },
	{ label: "Europe (Ireland)", value: "eu-west-1" },
	{ label: "Europe (London)", value: "eu-west-2" },
	{ label: "Europe (Paris)", value: "eu-west-3" },
	{ label: "Israel (Tel Aviv)", value: "il-central-1" },
	{ label: "Middle East (UAE)", value: "me-central-1" },
	{ label: "Middle East (Bahrain)", value: "me-south-1" },
	{ label: "South America (Sao Paulo)", value: "sa-east-1" },
	{ label: "US East (N. Virginia)", value: "us-east-1" },
	{ label: "US East (Ohio)", value: "us-east-2" },
	{ label: "AWS GovCloud (US-East)", value: "us-gov-east-1" },
	{ label: "AWS GovCloud (US-West)", value: "us-gov-west-1" },
	{ label: "US West (N. California)", value: "us-west-1" },
	{ label: "US West (Oregon)", value: "us-west-2" },
];

const baseIntegrationAuthMethods: Partial<Record<Integrations, AuthMethodConfig[]>> = {
	[Integrations.airtable]: [
		{ authType: ConnectionAuthType.Pat, schema: airtablePatIntegrationSchema },
		{ authType: ConnectionAuthType.OauthDefault, schema: airtableOauthIntegrationSchema },
	],
	[Integrations.asana]: [
		{ authType: ConnectionAuthType.Pat, schema: asanaPatIntegrationSchema },
		{ authType: ConnectionAuthType.Oauth, schema: asanaOauthIntegrationSchema },
	],
	[Integrations.calendar]: [
		{ authType: ConnectionAuthType.OauthUser, schema: googleOauthSchema },
		{ authType: ConnectionAuthType.Json, schema: googleJsonIntegrationSchema },
	],
	[Integrations.confluence]: [
		{ authType: ConnectionAuthType.OauthApp, schema: legacyOauthSchema },
		{ authType: ConnectionAuthType.ApiToken, schema: confluenceApiTokenIntegrationSchema },
		{ authType: ConnectionAuthType.PatDataCenter, schema: confluencePatIntegrationSchema },
	],
	[Integrations.drive]: [
		{ authType: ConnectionAuthType.OauthUser, schema: googleOauthSchema },
		{ authType: ConnectionAuthType.Json, schema: googleJsonIntegrationSchema },
	],
	[Integrations.forms]: [
		{ authType: ConnectionAuthType.OauthUser, schema: googleOauthSchema },
		{ authType: ConnectionAuthType.Json, schema: googleJsonIntegrationSchema },
	],
	[Integrations.github]: [
		{ authType: ConnectionAuthType.Oauth, schema: legacyOauthSchema },
		{ authType: ConnectionAuthType.OauthDefault, schema: genericDefaultOauthSchema },
		{ authType: ConnectionAuthType.OauthPrivate, schema: githubPrivateAuthIntegrationSchema },
		{ authType: ConnectionAuthType.PatWebhook, schema: githubIntegrationSchema },
	],
	[Integrations.gmail]: [
		{ authType: ConnectionAuthType.OauthUser, schema: googleOauthSchema },
		{ authType: ConnectionAuthType.Json, schema: googleJsonIntegrationSchema },
	],
	[Integrations.jira]: [
		{ authType: ConnectionAuthType.OauthApp, schema: legacyOauthSchema },
		{ authType: ConnectionAuthType.ApiToken, schema: jiraApiTokenIntegrationSchema },
		{ authType: ConnectionAuthType.PatDataCenter, schema: jiraPatIntegrationSchema },
	],
	[Integrations.linear]: [
		{ authType: ConnectionAuthType.OauthDefault, schema: linearOauthIntegrationSchema },
		{ authType: ConnectionAuthType.OauthPrivate, schema: linearPrivateAuthIntegrationSchema },
		{ authType: ConnectionAuthType.ApiKey, schema: linearApiKeyIntegrationSchema },
	],
	[Integrations.microsoft_teams]: [
		{ authType: ConnectionAuthType.MicrosoftOauthDefault, schema: microsoftOauthDefaultIntegrationSchema },
		{ authType: ConnectionAuthType.MicrosoftOauthPrivate, schema: microsoftOauthPrivateIntegrationSchema },
		{ authType: ConnectionAuthType.DaemonApp, schema: microsoftDaemonAppIntegrationSchema },
	],
	[Integrations.notion]: [
		{ authType: ConnectionAuthType.OauthDefault, schema: notionOauthDefaultIntegrationSchema },
		{ authType: ConnectionAuthType.ApiKey, schema: notionApiKeyIntegrationSchema },
	],
	[Integrations.salesforce]: [
		{ authType: ConnectionAuthType.OauthDefault, schema: salesforceOauthDefaultIntegrationSchema },
		{ authType: ConnectionAuthType.OauthPrivate, schema: salesforcePrivateAuthIntegrationSchema },
	],
	[Integrations.sheets]: [
		{ authType: ConnectionAuthType.OauthUser, schema: googleOauthSchema },
		{ authType: ConnectionAuthType.Json, schema: googleJsonIntegrationSchema },
	],
	[Integrations.slack]: [
		{ authType: ConnectionAuthType.OauthDefault, schema: slackOauthDefaultIntegrationSchema },
		{ authType: ConnectionAuthType.OauthPrivate, schema: slackPrivateAuthIntegrationSchema },
	],
	[Integrations.twilio]: [
		{ authType: ConnectionAuthType.AuthToken, schema: twilioTokenIntegrationSchema },
		{ authType: ConnectionAuthType.ApiKey, schema: twilioApiKeyIntegrationSchema },
	],
	[Integrations.youtube]: [
		{ authType: ConnectionAuthType.OauthUser, schema: googleOauthSchema },
		{ authType: ConnectionAuthType.Json, schema: googleJsonIntegrationSchema },
	],
	[Integrations.zoom]: [
		{ authType: ConnectionAuthType.OauthDefault, schema: zoomOauthDefaultIntegrationSchema },
		{ authType: ConnectionAuthType.OauthPrivate, schema: zoomPrivateAuthIntegrationSchema },
		{ authType: ConnectionAuthType.serverToServer, schema: zoomServerToServerIntegrationSchema },
	],
};

const linearFilteredIntegrationAuthMethods = featureFlags.linearHideDefaultOAuth
	? baseIntegrationAuthMethods[Integrations.linear]!.filter(
			(config) => config.authType !== ConnectionAuthType.OauthDefault
		)
	: baseIntegrationAuthMethods[Integrations.linear]!;

const microsoftTeamsFilteredIntegrationAuthMethods = featureFlags.microsoftHideDefaultOAuth
	? baseIntegrationAuthMethods[Integrations.microsoft_teams]!.filter(
			(config) => config.authType !== ConnectionAuthType.MicrosoftOauthDefault
		)
	: baseIntegrationAuthMethods[Integrations.microsoft_teams]!;

const notionFilteredIntegrationAuthMethods = featureFlags.notionHideDefaultOAuth
	? baseIntegrationAuthMethods[Integrations.notion]!.filter(
			(config) => config.authType !== ConnectionAuthType.OauthDefault
		)
	: baseIntegrationAuthMethods[Integrations.notion]!;

const salesforceFilteredIntegrationAuthMethods = featureFlags.salesforceHideDefaultOAuth
	? baseIntegrationAuthMethods[Integrations.salesforce]!.filter(
			(config) => config.authType !== ConnectionAuthType.OauthDefault
		)
	: baseIntegrationAuthMethods[Integrations.salesforce]!;

const slackFilteredIntegrationAuthMethods = featureFlags.displaySlackSocketIntegration
	? [
			...baseIntegrationAuthMethods[Integrations.slack]!,
			{ authType: ConnectionAuthType.Socket, schema: slackSocketModeIntegrationSchema },
		]
	: baseIntegrationAuthMethods[Integrations.slack]!;

const zoomFilteredIntegrationAuthMethods = featureFlags.zoomHideDefaultOAuth
	? baseIntegrationAuthMethods[Integrations.zoom]!.filter(
			(config) => config.authType !== ConnectionAuthType.OauthDefault
		)
	: baseIntegrationAuthMethods[Integrations.zoom]!;

export const integrationsWithoutOptions: Partial<Record<Integrations, AuthMethodConfig[] | undefined>> = {
	[Integrations.aws]: undefined,
	[Integrations.anthropic]: undefined,
	[Integrations.auth0]: undefined,
	[Integrations.googlegemini]: undefined,
	[Integrations.telegram]: undefined,
	[Integrations.discord]: undefined,
	[Integrations.chatgpt]: undefined,
	[Integrations.hubspot]: undefined,
	[Integrations.kubernetes]: undefined,
	[Integrations.reddit]: undefined,
	[Integrations.pipedrive]: undefined,
};
export const flaggedIntegrationsAuthMethods: Partial<Record<Integrations, AuthMethodConfig[]>> = {
	[Integrations.linear]: linearFilteredIntegrationAuthMethods,
	[Integrations.microsoft_teams]: microsoftTeamsFilteredIntegrationAuthMethods,
	[Integrations.notion]: notionFilteredIntegrationAuthMethods,
	[Integrations.salesforce]: salesforceFilteredIntegrationAuthMethods,
	[Integrations.slack]: slackFilteredIntegrationAuthMethods,
	[Integrations.zoom]: zoomFilteredIntegrationAuthMethods,
};

export const integrationsWithOptions = (Object.values(Integrations) as Integrations[]).filter(
	(integration) => !integrationsWithoutOptions[integration]
);

type IntegrationsWithOptionsType = (typeof integrationsWithOptions)[number];

export const allIntegrationsAuthMethods: Partial<Record<IntegrationsWithOptionsType, AuthMethodConfig[]>> = {
	...baseIntegrationAuthMethods,
	...flaggedIntegrationsAuthMethods,
};

export const getSlackOptionsForLegacyAuth = (): SelectOption[] => {
	const slackOptions = getIntegrationAuthOptions(Integrations.slack) || [];
	return slackOptions.filter((option) => option.value !== ConnectionAuthType.Oauth);
};

export const getIntegrationSchemas = (integration: IntegrationsWithOptionsType): ZodSchema[] => {
	const configs = allIntegrationsAuthMethods[integration];
	if (!configs) return [];

	return configs.map((config) => config.schema);
};

export const getIntegrationAuthOptions = (integration: IntegrationsWithOptionsType): SelectOption[] => {
	const configs = allIntegrationsAuthMethods[integration];
	if (!configs) return [];

	return configs.map((config) => {
		const option = authMethodOptions[config.authType];
		if (!option) {
			throw new Error(`Auth method ${config.authType} not found`);
		}
		return option;
	});
};

export const getSchemaByAuthType = (
	integration: IntegrationsWithOptionsType,
	authType: ConnectionAuthType
): ZodSchema => {
	const configs = allIntegrationsAuthMethods[integration];
	if (!configs) throw new Error(`Integration ${integration} not found`);

	const schema = configs.find((config) => config.authType === authType)?.schema;
	if (!schema) throw new Error(`Schema for auth type ${authType} not found`);

	return schema;
};

export const allConnectionsAuthTypes: Record<IntegrationsWithOptionsType, SelectOption[]> = Object.fromEntries(
	integrationsWithOptions.map((integration) => [integration, getIntegrationAuthOptions(integration)])
) as Record<IntegrationsWithOptionsType, SelectOption[]>;
