import { ZodSchema } from "zod";

import { featureFlags } from "../featureFlags.constants";
import { integrationConfigs, AuthMethodConfig, IntegrationConfig } from "./integrationConfigs";
import { Integrations, IntegrationForTemplates } from "@src/enums/components/integrations.enum";
import { ConnectionAuthType } from "@src/enums/connections/connectionTypes.enum";
import { BaseSelectOption, SelectOption } from "@src/interfaces/components/forms/select.interface";
import { slackSocketModeIntegrationSchema } from "@validations/connection.schema";

import { SocketForm as SlackSocketForm } from "@components/organisms/configuration/connections/integrations/slack/authMethods";

import { AKRoundLogo } from "@assets/image";
import { GithubCopilotIcon, GrpcIcon, HttpIcon, SchedulerIcon, SqliteIcon } from "@assets/image/icons/connections";

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

export const authMethodLabels: Record<ConnectionAuthType, string> = {
	[ConnectionAuthType.ApiKey]: "API Key",
	[ConnectionAuthType.ApiToken]: "API Token (Cloud)",
	[ConnectionAuthType.AuthToken]: "Auth Token",
	[ConnectionAuthType.AWSConfig]: "AWS Config",
	[ConnectionAuthType.Basic]: "Basic Auth",
	[ConnectionAuthType.Bearer]: "Bearer Token",
	[ConnectionAuthType.BotToken]: "Bot Token",
	[ConnectionAuthType.DaemonApp]: "Private daemon application",
	[ConnectionAuthType.Initialized]: "Initialized",
	[ConnectionAuthType.Json]: "Service Account (JSON)",
	[ConnectionAuthType.JsonKey]: "JSON Key",
	[ConnectionAuthType.Key]: "Key",
	[ConnectionAuthType.Mode]: "Mode",
	[ConnectionAuthType.MicrosoftOauthDefault]: "Default user-delegated app",
	[ConnectionAuthType.MicrosoftOauthPrivate]: "Private user-delegated app",
	[ConnectionAuthType.NoAuth]: "No Auth",
	[ConnectionAuthType.Oauth]: "OAuth 2.0",
	[ConnectionAuthType.OauthApp]: "OAuth 2.0 App",
	[ConnectionAuthType.OauthDefault]: "OAuth v2 - Default app",
	[ConnectionAuthType.OauthPrivate]: "OAuth v2 - Private app",
	[ConnectionAuthType.OauthUser]: "User (OAuth 2.0)",
	[ConnectionAuthType.Pat]: "Personal Access Token (PAT)",
	[ConnectionAuthType.PatDataCenter]: "Personal Access Token (PAT - Data Center)",
	[ConnectionAuthType.PatWebhook]: "PAT + Webhook",
	[ConnectionAuthType.serverToServer]: "Private Server-to-Server",
	[ConnectionAuthType.ServiceAccount]: "Service Account",
	[ConnectionAuthType.Socket]: "Socket Mode",
};

type FeatureFlagConfig = {
	addAuthMethods?: AuthMethodConfig[];
	hideAuthTypes?: ConnectionAuthType[];
	hideIntegration?: boolean;
};

const getFeatureFlagConfig = (integration: Integrations): FeatureFlagConfig => {
	const configs: Partial<Record<Integrations, FeatureFlagConfig>> = {
		[Integrations.telegram]: {
			hideIntegration: featureFlags.telegramHideIntegration,
		},
		[Integrations.pipedrive]: {
			hideIntegration: featureFlags.pipedriveHideIntegration,
		},
		[Integrations.linear]: {
			hideAuthTypes: featureFlags.linearHideDefaultOAuth ? [ConnectionAuthType.OauthDefault] : [],
		},
		[Integrations.salesforce]: {
			hideAuthTypes: featureFlags.salesforceHideDefaultOAuth ? [ConnectionAuthType.OauthDefault] : [],
		},
		[Integrations.zoom]: {
			hideAuthTypes: featureFlags.zoomHideDefaultOAuth ? [ConnectionAuthType.OauthDefault] : [],
		},
		[Integrations.microsoft_teams]: {
			hideAuthTypes: featureFlags.microsoftHideDefaultOAuth ? [ConnectionAuthType.MicrosoftOauthDefault] : [],
		},
		[Integrations.notion]: {
			hideAuthTypes: featureFlags.notionHideDefaultOAuth ? [ConnectionAuthType.OauthDefault] : [],
		},
		[Integrations.slack]: {
			addAuthMethods: featureFlags.displaySlackSocketIntegration
				? [
						{
							authType: ConnectionAuthType.Socket,
							schema: slackSocketModeIntegrationSchema,
							form: SlackSocketForm,
						},
					]
				: [],
		},
	};

	return configs[integration] || {};
};

export const getIntegrationConfig = (integration: Integrations): IntegrationConfig | undefined => {
	const config = integrationConfigs[integration];
	if (!config) return undefined;

	const featureFlagConfig = getFeatureFlagConfig(integration);
	if (featureFlagConfig.hideIntegration) return undefined;

	let authMethods = config.authMethods;

	if (authMethods && featureFlagConfig.hideAuthTypes?.length) {
		authMethods = authMethods.filter((method) => !featureFlagConfig.hideAuthTypes?.includes(method.authType));
	}

	if (featureFlagConfig.addAuthMethods?.length) {
		authMethods = [...(authMethods || []), ...featureFlagConfig.addAuthMethods];
	}

	return { ...config, authMethods };
};

export const getVisibleIntegrations = (): Integrations[] => {
	return (Object.values(Integrations) as Integrations[]).filter((integration) => {
		const featureFlagConfig = getFeatureFlagConfig(integration);
		return !featureFlagConfig.hideIntegration;
	});
};

export const getIntegrationsMap = (): Record<Integrations, BaseSelectOption> => {
	return Object.fromEntries(
		getVisibleIntegrations().map((integration) => [
			integration,
			{ label: integrationConfigs[integration].label, value: integration },
		])
	) as Record<Integrations, BaseSelectOption>;
};

export const getIntegrationsIcons = (): Record<Integrations, React.ComponentType<React.SVGProps<SVGSVGElement>>> => {
	return Object.fromEntries(
		(Object.entries(integrationConfigs) as [Integrations, IntegrationConfig][]).map(([key, config]) => [
			key,
			config.icon,
		])
	) as Record<Integrations, React.ComponentType<React.SVGProps<SVGSVGElement>>>;
};

export const getIntegrationAddComponent = (integration: Integrations): React.ComponentType<any> | undefined => {
	return getIntegrationConfig(integration)?.addComponent;
};

export const getIntegrationEditComponent = (integration: Integrations): React.ComponentType<any> | undefined => {
	return getIntegrationConfig(integration)?.editComponent;
};

export const getIntegrationVariables = (integration: Integrations): Record<string, string> | undefined => {
	return integrationConfigs[integration]?.variables;
};

export const getIntegrationAuthMethods = (integration: Integrations): AuthMethodConfig[] | undefined => {
	return getIntegrationConfig(integration)?.authMethods;
};

export const getIntegrationAuthOptions = (integration: Integrations): SelectOption[] => {
	const authMethods = getIntegrationAuthMethods(integration);
	if (!authMethods) return [];

	return authMethods.map((method) => ({
		label: authMethodLabels[method.authType],
		value: method.authType,
	}));
};

export const getIntegrationSchemas = (integration: Integrations): ZodSchema[] => {
	const authMethods = getIntegrationAuthMethods(integration);
	if (!authMethods) return [];

	return authMethods.map((method) => method.schema);
};

export const getSchemaByAuthType = (integration: Integrations, authType: ConnectionAuthType): ZodSchema => {
	const authMethods = getIntegrationAuthMethods(integration);
	if (!authMethods) throw new Error(`Integration ${integration} has no auth methods`);

	const method = authMethods.find((m) => m.authType === authType);
	if (!method) throw new Error(`Auth type ${authType} not found for integration ${integration}`);

	return method.schema;
};

export const getAuthMethodForm = (
	integration: Integrations,
	authType: ConnectionAuthType
): React.ComponentType<any> | undefined => {
	const authMethods = getIntegrationAuthMethods(integration);
	if (!authMethods) return undefined;

	return authMethods.find((m) => m.authType === authType)?.form;
};

export const hasAuthMethodSelector = (integration: Integrations): boolean => {
	const authMethods = getIntegrationAuthMethods(integration);
	return !!authMethods && authMethods.length > 0;
};

export const getIntegrationsWithAuthMethods = (): Integrations[] => {
	return (Object.values(Integrations) as Integrations[]).filter(hasAuthMethodSelector);
};

export const getIntegrationsWithoutAuthMethods = (): Integrations[] => {
	return (Object.values(Integrations) as Integrations[]).filter((i) => !hasAuthMethodSelector(i));
};

export const getIntegrationAddComponents = (): Partial<Record<Integrations, React.ComponentType<any>>> => {
	return Object.fromEntries(
		getVisibleIntegrations()
			.map((integration) => [integration, getIntegrationAddComponent(integration)])
			.filter(([, component]) => component !== undefined)
	) as Partial<Record<Integrations, React.ComponentType<any>>>;
};

export const getIntegrationEditComponents = (): Partial<Record<Integrations, React.ComponentType<any>>> => {
	return Object.fromEntries(
		getVisibleIntegrations()
			.map((integration) => [integration, getIntegrationEditComponent(integration)])
			.filter(([, component]) => component !== undefined)
	) as Partial<Record<Integrations, React.ComponentType<any>>>;
};

export const getFormsPerIntegrationsMapping = (): Partial<
	Record<Integrations, Partial<Record<ConnectionAuthType, React.ComponentType<any>>>>
> => {
	return Object.fromEntries(
		getVisibleIntegrations()
			.filter(hasAuthMethodSelector)
			.map((integration) => {
				const authMethods = getIntegrationAuthMethods(integration);
				const forms = Object.fromEntries(
					(authMethods || []).filter((m) => m.form).map((m) => [m.authType, m.form])
				);
				return [integration, forms];
			})
	) as Partial<Record<Integrations, Partial<Record<ConnectionAuthType, React.ComponentType<any>>>>>;
};

export const getAllIntegrationVariables = (): Partial<Record<Integrations, Record<string, string>>> => {
	return Object.fromEntries(
		(Object.entries(integrationConfigs) as [Integrations, IntegrationConfig][])
			.filter(([, config]) => config.variables)
			.map(([key, config]) => [key, config.variables])
	) as Partial<Record<Integrations, Record<string, string>>>;
};

export const getSlackOptionsForLegacyAuth = (): SelectOption[] => {
	const slackOptions = getIntegrationAuthOptions(Integrations.slack) || [];
	return slackOptions.filter((option) => option.value !== ConnectionAuthType.Oauth);
};

const HiddenIntegrationsIconsForTemplates: Record<
	IntegrationForTemplates,
	React.ComponentType<React.SVGProps<SVGSVGElement>>
> = {
	githubcopilot: GithubCopilotIcon,
	sqlite3: SqliteIcon,
	scheduler: SchedulerIcon,
	http: HttpIcon,
	autokitteh: AKRoundLogo,
	grpc: GrpcIcon,
};

export const IntegrationsIcons: Record<
	Integrations | IntegrationForTemplates,
	React.ComponentType<React.SVGProps<SVGSVGElement>>
> = {
	...getIntegrationsIcons(),
	...HiddenIntegrationsIconsForTemplates,
};
