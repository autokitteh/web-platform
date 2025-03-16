import { ZodObject, ZodRawShape } from "zod";

import { ConnectionAuthType } from "@src/enums";
import { Integrations } from "@src/enums/components/connection.enum";
import {
	asanaIntegrationSchema,
	auth0IntegrationSchema,
	awsIntegrationSchema,
	confluenceIntegrationSchema,
	discordIntegrationSchema,
	githubIntegrationSchema,
	githubPrivateAuthIntegrationSchema,
	googleCalendarIntegrationSchema,
	googleFormsIntegrationSchema,
	googleGeminiIntegrationSchema,
	googleIntegrationSchema,
	heightApiKeyIntegrationSchema,
	heightPrivateAuthIntegrationSchema,
	jiraIntegrationSchema,
	linearApiKeyIntegrationSchema,
	linearPrivateAuthIntegrationSchema,
	microsoftTeamsIntegrationSchema,
	oauthSchema,
	openAiIntegrationSchema,
	salesforceIntegrationSchema,
	slackIntegrationSchema,
	slackPrivateAuthIntegrationSchema,
	twilioApiKeyIntegrationSchema,
	twilioTokenIntegrationSchema,
	zoomPrivateAuthIntegrationSchema,
	zoomServerToServerIntegrationSchema,
} from "@validations";

type SchemaMapping = Record<keyof typeof Integrations, Partial<Record<ConnectionAuthType, ZodObject<ZodRawShape>>>>;

export const integrationsValidationSchemas: SchemaMapping = {
	[Integrations.hubspot]: {
		[ConnectionAuthType.OauthDefault]: oauthSchema,
	},
	[Integrations.github]: {
		[ConnectionAuthType.Pat]: githubIntegrationSchema,
		[ConnectionAuthType.OauthDefault]: oauthSchema,
		[ConnectionAuthType.Oauth]: oauthSchema, // Legacy
		[ConnectionAuthType.OauthPrivate]: githubPrivateAuthIntegrationSchema,
	},
	[Integrations.slack]: {
		[ConnectionAuthType.Socket]: slackIntegrationSchema,
		[ConnectionAuthType.OauthDefault]: oauthSchema,
		[ConnectionAuthType.Oauth]: oauthSchema, // Legacy
		[ConnectionAuthType.OauthPrivate]: slackPrivateAuthIntegrationSchema,
	},
	[Integrations.linear]: {
		[ConnectionAuthType.OauthDefault]: oauthSchema,
		[ConnectionAuthType.OauthPrivate]: linearPrivateAuthIntegrationSchema,
		[ConnectionAuthType.ApiKey]: linearApiKeyIntegrationSchema,
	},
	[Integrations.jira]: {
		[ConnectionAuthType.ApiToken]: jiraIntegrationSchema,
		[ConnectionAuthType.Oauth]: oauthSchema,
	},
	[Integrations.confluence]: {
		[ConnectionAuthType.ApiToken]: confluenceIntegrationSchema,
		[ConnectionAuthType.Oauth]: oauthSchema,
	},
	[Integrations.twilio]: {
		[ConnectionAuthType.ApiKey]: twilioApiKeyIntegrationSchema,
		[ConnectionAuthType.AuthToken]: twilioTokenIntegrationSchema,
	},
	[Integrations.zoom]: {
		[ConnectionAuthType.OauthDefault]: oauthSchema,
		[ConnectionAuthType.OauthPrivate]: zoomPrivateAuthIntegrationSchema,
		[ConnectionAuthType.serverToServer]: zoomServerToServerIntegrationSchema,
	},
	[Integrations.height]: {
		[ConnectionAuthType.OauthDefault]: oauthSchema,
		[ConnectionAuthType.OauthPrivate]: heightPrivateAuthIntegrationSchema,
		[ConnectionAuthType.ApiKey]: heightApiKeyIntegrationSchema,
	},
	[Integrations.aws]: {
		[ConnectionAuthType.AWSConfig]: awsIntegrationSchema,
	},
	[Integrations.auth0]: {
		[ConnectionAuthType.Oauth]: auth0IntegrationSchema,
	},
	[Integrations.asana]: {
		[ConnectionAuthType.Pat]: asanaIntegrationSchema,
	},
	[Integrations.chatgpt]: {
		[ConnectionAuthType.Key]: openAiIntegrationSchema,
	},
	[Integrations.discord]: {
		[ConnectionAuthType.Socket]: discordIntegrationSchema,
	},
	[Integrations.googlegemini]: {
		[ConnectionAuthType.ApiKey]: googleGeminiIntegrationSchema,
	},
	[Integrations.salesforce]: {
		[ConnectionAuthType.OauthPrivate]: salesforceIntegrationSchema,
	},
	[Integrations.microsoft_teams]: {
		[ConnectionAuthType.OauthDefault]: oauthSchema,
		[ConnectionAuthType.OauthPrivate]: microsoftTeamsIntegrationSchema,
		[ConnectionAuthType.DaemonApp]: microsoftTeamsIntegrationSchema,
	},
	[Integrations.calendar]: {
		[ConnectionAuthType.JsonKey]: googleCalendarIntegrationSchema,
		[ConnectionAuthType.Oauth]: oauthSchema,
	},
	[Integrations.forms]: {
		[ConnectionAuthType.JsonKey]: googleFormsIntegrationSchema,
		[ConnectionAuthType.Oauth]: oauthSchema,
	},
	[Integrations.gmail]: {
		[ConnectionAuthType.JsonKey]: googleIntegrationSchema,
		[ConnectionAuthType.Oauth]: oauthSchema,
	},
	[Integrations.sheets]: {
		[ConnectionAuthType.JsonKey]: googleIntegrationSchema,
		[ConnectionAuthType.Oauth]: oauthSchema,
	},
	[Integrations.drive]: {
		[ConnectionAuthType.JsonKey]: googleIntegrationSchema,
		[ConnectionAuthType.Oauth]: oauthSchema,
	},
};

export const getValidationSchema = (
	integration: keyof typeof Integrations,
	connectionType: ConnectionAuthType
): ZodObject<ZodRawShape> | undefined => {
	return integrationsValidationSchemas[integration]?.[connectionType];
};

export const getDefaultSchemaForIntegration = (integration: Integrations): ZodObject<ZodRawShape> | undefined => {
	const schemas = integrationsValidationSchemas[integration];
	if (!schemas) return undefined;

	const firstKey = Object.keys(schemas)[0];
	return firstKey ? schemas[firstKey as ConnectionAuthType] : undefined;
};
