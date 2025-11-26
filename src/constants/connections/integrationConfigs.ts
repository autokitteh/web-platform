import { ZodSchema } from "zod";

import { Integrations } from "@src/enums/components/integrations.enum";
import { ConnectionAuthType } from "@src/enums/connections/connectionTypes.enum";
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
	twilioApiKeyIntegrationSchema,
	twilioTokenIntegrationSchema,
	zoomOauthDefaultIntegrationSchema,
	zoomPrivateAuthIntegrationSchema,
	zoomServerToServerIntegrationSchema,
} from "@validations/connection.schema";

import {
	AsanaIntegrationAddForm,
	AsanaIntegrationEditForm,
	AirtableIntegrationAddForm,
	AirtableIntegrationEditForm,
	ChatGPTIntegrationAddForm,
	ChatGPTIntegrationEditForm,
	AnthropicIntegrationAddForm,
	AnthropicIntegrationEditForm,
	Auth0IntegrationAddForm,
	Auth0IntegrationEditForm,
	AwsIntegrationAddForm,
	AwsIntegrationEditForm,
	ConfluenceIntegrationAddForm,
	ConfluenceIntegrationEditForm,
	DiscordIntegrationAddForm,
	DiscordIntegrationEditForm,
	GithubIntegrationAddForm,
	GithubIntegrationEditForm,
	GoogleIntegrationAddForm,
	GoogleIntegrationEditForm,
	GoogleCalendarIntegrationAddForm,
	GoogleCalendarIntegrationEditForm,
	GoogleFormsIntegrationAddForm,
	GoogleFormsIntegrationEditForm,
	GoogleGeminiIntegrationAddForm,
	GoogleGeminiIntegrationEditForm,
	HubspotIntegrationAddForm,
	HubspotIntegrationEditForm,
	JiraIntegrationAddForm,
	JiraIntegrationEditForm,
	LinearIntegrationAddForm,
	LinearIntegrationEditForm,
	SlackIntegrationAddForm,
	SlackIntegrationEditForm,
	TwilioIntegrationAddForm,
	TwilioIntegrationEditForm,
	TelegramIntegrationAddForm,
	TelegramIntegrationEditForm,
	ZoomIntegrationAddForm,
	ZoomIntegrationEditForm,
	SalesforceIntegrationAddForm,
	SalesforceIntegrationEditForm,
	KubernetesIntegrationAddForm,
	KubernetesIntegrationEditForm,
	RedditIntegrationAddForm,
	RedditIntegrationEditForm,
	PipedriveIntegrationAddForm,
	PipedriveIntegrationEditForm,
	NotionIntegrationAddForm,
	NotionIntegrationEditForm,
} from "@components/organisms/configuration/connections/integrations";
import {
	PatAirtableForm,
	OauthAirtableForm,
} from "@components/organisms/configuration/connections/integrations/airtable/authMethods";
import {
	PatAsanaForm,
	OauthAsanaForm,
} from "@components/organisms/configuration/connections/integrations/asana/authMethods";
import {
	ConfluenceApiTokenForm,
	ConfluencePatForm,
	ConfluenceOauthForm,
} from "@components/organisms/configuration/connections/integrations/confluence/authMethods";
import {
	OauthForm as GithubOauthForm,
	OauthPrivateForm as GithubOauthPrivateForm,
	PatForm as GithubPatForm,
} from "@components/organisms/configuration/connections/integrations/github/authMethods";
import {
	JsonGoogleForm,
	OauthGoogleForm,
} from "@components/organisms/configuration/connections/integrations/google/authMethods";
import {
	JsonGoogleCalendarForm,
	OauthGoogleCalendarForm,
} from "@components/organisms/configuration/connections/integrations/googlecalendar/authMethods";
import {
	JsonGoogleFormsForm,
	OauthGoogleFormsForm,
} from "@components/organisms/configuration/connections/integrations/googleforms/authMethods";
import {
	ApiTokenJiraForm,
	PatJiraForm,
	OauthJiraForm,
} from "@components/organisms/configuration/connections/integrations/jira/authMethods";
import {
	LinearOauthPrivateForm,
	LinearOauthForm,
	LinearApiKeyForm,
} from "@components/organisms/configuration/connections/integrations/linear/authMethods";
import {
	MicrosoftTeamsIntegrationAddForm,
	MicrosoftTeamsIntegrationEditForm,
} from "@components/organisms/configuration/connections/integrations/microsoft/teams";
import {
	MicrosoftTeamsOauthForm,
	MicrosoftTeamsOauthPrivateForm,
	MicrosoftTeamsDaemonForm,
} from "@components/organisms/configuration/connections/integrations/microsoft/teams/authMethods";
import {
	NotionOauthForm,
	NotionApiKeyForm,
} from "@components/organisms/configuration/connections/integrations/notion/authMethods";
import {
	SalesforceOauthPrivateForm,
	SalesforceOauthForm,
} from "@components/organisms/configuration/connections/integrations/salesforce/authMethods";
import {
	OauthForm as SlackOauthForm,
	SlackOauthPrivateForm,
} from "@components/organisms/configuration/connections/integrations/slack/authMethods";
import {
	ApiKeyTwilioForm,
	AuthTokenTwilioForm,
} from "@components/organisms/configuration/connections/integrations/twilio/authMethods";
import {
	ZoomOauthForm,
	ZoomOauthPrivateForm,
	ZoomServerToServerForm,
} from "@components/organisms/configuration/connections/integrations/zoom/authMethods";

import {
	AirtableIcon,
	AnthropicIcon,
	AsanaIcon,
	Auth0Icon,
	AwsIcon,
	ConfluenceIcon,
	DiscordIcon,
	GithubIcon,
	GoogleCalendarIcon,
	GoogleDriveIcon,
	GoogleFormsIcon,
	GoogleGeminiIcon,
	GoogleGmailIcon,
	GoogleSheetsIcon,
	GoogleYoutubeIcon,
	HubspotIcon,
	JiraIcon,
	KubernetesIcon,
	LinearIcon,
	MicrosoftTeamsIcon,
	NotionIcon,
	OpenAiIcon,
	PipedriveIcon,
	RedditIcon,
	SalesforceIcon,
	SlackIcon,
	TelegramIcon,
	TwilioIcon,
	ZoomIcon,
} from "@assets/image/icons/connections";

export type AuthMethodConfig = {
	authType: ConnectionAuthType;
	form?: React.ComponentType<any>;
	schema: ZodSchema;
	skipTest?: boolean;
};

export type IntegrationConfig = {
	addComponent: React.ComponentType<any>;
	authMethods?: AuthMethodConfig[];
	editComponent: React.ComponentType<any>;
	icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
	label: string;
	variables?: Record<string, string>;
};

export const integrationConfigs: Record<Integrations, IntegrationConfig> = {
	[Integrations.airtable]: {
		label: "Airtable",
		icon: AirtableIcon,
		addComponent: AirtableIntegrationAddForm,
		editComponent: AirtableIntegrationEditForm,
		variables: { pat: "pat" },
		authMethods: [
			{ authType: ConnectionAuthType.Pat, schema: airtablePatIntegrationSchema, form: PatAirtableForm },
			{
				authType: ConnectionAuthType.OauthDefault,
				schema: airtableOauthIntegrationSchema,
				form: OauthAirtableForm,
			},
		],
	},

	[Integrations.anthropic]: {
		label: "Anthropic",
		icon: AnthropicIcon,
		addComponent: AnthropicIntegrationAddForm,
		editComponent: AnthropicIntegrationEditForm,
		variables: { api_key: "api_key" },
	},

	[Integrations.asana]: {
		label: "Asana",
		icon: AsanaIcon,
		addComponent: AsanaIntegrationAddForm,
		editComponent: AsanaIntegrationEditForm,
		variables: { pat: "pat" },
		authMethods: [
			{ authType: ConnectionAuthType.Pat, schema: asanaPatIntegrationSchema, form: PatAsanaForm },
			{ authType: ConnectionAuthType.Oauth, schema: asanaOauthIntegrationSchema, form: OauthAsanaForm },
		],
	},

	[Integrations.auth0]: {
		label: "Auth0",
		icon: Auth0Icon,
		addComponent: Auth0IntegrationAddForm,
		editComponent: Auth0IntegrationEditForm,
		variables: {
			client_id: "client_id",
			client_secret: "client_secret",
			auth0_domain: "auth0_domain",
		},
	},

	[Integrations.aws]: {
		label: "AWS",
		icon: AwsIcon,
		addComponent: AwsIntegrationAddForm,
		editComponent: AwsIntegrationEditForm,
		variables: {
			region: "Region",
			access_key: "AccessKeyID",
			secret_key: "SecretKey",
			token: "Token",
		},
	},

	[Integrations.calendar]: {
		label: "Google Calendar",
		icon: GoogleCalendarIcon,
		addComponent: GoogleCalendarIntegrationAddForm,
		editComponent: GoogleCalendarIntegrationEditForm,
		variables: { cal_id: "CalendarID", json: "JSON" },
		authMethods: [
			{ authType: ConnectionAuthType.OauthUser, schema: googleOauthSchema, form: OauthGoogleCalendarForm },
			{ authType: ConnectionAuthType.Json, schema: googleJsonIntegrationSchema, form: JsonGoogleCalendarForm },
		],
	},

	[Integrations.chatgpt]: {
		label: "OpenAI ChatGPT",
		icon: OpenAiIcon,
		addComponent: ChatGPTIntegrationAddForm,
		editComponent: ChatGPTIntegrationEditForm,
		variables: { key: "apiKey" },
	},

	[Integrations.confluence]: {
		label: "Atlassian Confluence",
		icon: ConfluenceIcon,
		addComponent: ConfluenceIntegrationAddForm,
		editComponent: ConfluenceIntegrationEditForm,
		variables: {
			base_url: "BaseURL",
			token: "Token",
			email: "Email",
			pat: "pat",
		},
		authMethods: [
			{ authType: ConnectionAuthType.OauthApp, schema: legacyOauthSchema, form: ConfluenceOauthForm },
			{
				authType: ConnectionAuthType.ApiToken,
				schema: confluenceApiTokenIntegrationSchema,
				form: ConfluenceApiTokenForm,
			},
			{
				authType: ConnectionAuthType.PatDataCenter,
				schema: confluencePatIntegrationSchema,
				form: ConfluencePatForm,
			},
		],
	},

	[Integrations.discord]: {
		label: "Discord",
		icon: DiscordIcon,
		addComponent: DiscordIntegrationAddForm,
		editComponent: DiscordIntegrationEditForm,
		variables: { botToken: "BotToken" },
	},

	[Integrations.drive]: {
		label: "Google Drive",
		icon: GoogleDriveIcon,
		addComponent: GoogleIntegrationAddForm,
		editComponent: GoogleIntegrationEditForm,
		variables: { json: "JSON" },
		authMethods: [
			{ authType: ConnectionAuthType.OauthUser, schema: googleOauthSchema, form: OauthGoogleForm },
			{ authType: ConnectionAuthType.Json, schema: googleJsonIntegrationSchema, form: JsonGoogleForm },
		],
	},

	[Integrations.forms]: {
		label: "Google Forms",
		icon: GoogleFormsIcon,
		addComponent: GoogleFormsIntegrationAddForm,
		editComponent: GoogleFormsIntegrationEditForm,
		variables: { form_id: "FormID", json: "JSON" },
		authMethods: [
			{ authType: ConnectionAuthType.OauthUser, schema: googleOauthSchema, form: OauthGoogleFormsForm },
			{ authType: ConnectionAuthType.Json, schema: googleJsonIntegrationSchema, form: JsonGoogleFormsForm },
		],
	},

	[Integrations.github]: {
		label: "GitHub",
		icon: GithubIcon,
		addComponent: GithubIntegrationAddForm,
		editComponent: GithubIntegrationEditForm,
		variables: {
			pat: "pat",
			secret: "pat_secret",
			webhook_secret: "webhook_secret",
			client_id: "client_id",
			client_secret: "client_secret",
			app_id: "app_id",
			enterprise_url: "enterprise_url",
			private_key: "private_key",
			app_name: "app_name",
		},
		authMethods: [
			{ authType: ConnectionAuthType.Oauth, schema: legacyOauthSchema, form: GithubOauthForm, skipTest: true },
			{ authType: ConnectionAuthType.OauthDefault, schema: genericDefaultOauthSchema, form: GithubOauthForm },
			{
				authType: ConnectionAuthType.OauthPrivate,
				schema: githubPrivateAuthIntegrationSchema,
				form: GithubOauthPrivateForm,
			},
			{ authType: ConnectionAuthType.Pat, schema: githubIntegrationSchema, form: GithubPatForm },
		],
	},

	[Integrations.gmail]: {
		label: "Gmail",
		icon: GoogleGmailIcon,
		addComponent: GoogleIntegrationAddForm,
		editComponent: GoogleIntegrationEditForm,
		variables: { json: "json" },
		authMethods: [
			{ authType: ConnectionAuthType.OauthUser, schema: googleOauthSchema, form: OauthGoogleForm },
			{ authType: ConnectionAuthType.Json, schema: googleJsonIntegrationSchema, form: JsonGoogleForm },
		],
	},

	[Integrations.googlegemini]: {
		label: "Google Gemini",
		icon: GoogleGeminiIcon,
		addComponent: GoogleGeminiIntegrationAddForm,
		editComponent: GoogleGeminiIntegrationEditForm,
		variables: { key: "api_key" },
	},

	[Integrations.hubspot]: {
		label: "HubSpot",
		icon: HubspotIcon,
		addComponent: HubspotIntegrationAddForm,
		editComponent: HubspotIntegrationEditForm,
	},

	[Integrations.jira]: {
		label: "Atlassian Jira",
		icon: JiraIcon,
		addComponent: JiraIntegrationAddForm,
		editComponent: JiraIntegrationEditForm,
		variables: {
			base_url: "BaseURL",
			token: "Token",
			email: "Email",
			pat: "pat",
		},
		authMethods: [
			{ authType: ConnectionAuthType.OauthApp, schema: legacyOauthSchema, form: OauthJiraForm },
			{ authType: ConnectionAuthType.ApiToken, schema: jiraApiTokenIntegrationSchema, form: ApiTokenJiraForm },
			{ authType: ConnectionAuthType.PatDataCenter, schema: jiraPatIntegrationSchema, form: PatJiraForm },
		],
	},

	[Integrations.kubernetes]: {
		label: "Kubernetes",
		icon: KubernetesIcon,
		addComponent: KubernetesIntegrationAddForm,
		editComponent: KubernetesIntegrationEditForm,
		variables: { config_file: "config_file" },
	},

	[Integrations.linear]: {
		label: "Linear",
		icon: LinearIcon,
		addComponent: LinearIntegrationAddForm,
		editComponent: LinearIntegrationEditForm,
		variables: {
			client_id: "private_client_id",
			client_secret: "private_client_secret",
			webhook_url: "webhook_url",
			webhook_secret: "private_webhook_secret",
			api_key: "api_key",
			actor: "actor",
		},
		authMethods: [
			{ authType: ConnectionAuthType.OauthDefault, schema: linearOauthIntegrationSchema, form: LinearOauthForm },
			{
				authType: ConnectionAuthType.OauthPrivate,
				schema: linearPrivateAuthIntegrationSchema,
				form: LinearOauthPrivateForm,
			},
			{ authType: ConnectionAuthType.ApiKey, schema: linearApiKeyIntegrationSchema, form: LinearApiKeyForm },
		],
	},

	[Integrations.microsoft_teams]: {
		label: "Microsoft Teams",
		icon: MicrosoftTeamsIcon,
		addComponent: MicrosoftTeamsIntegrationAddForm,
		editComponent: MicrosoftTeamsIntegrationEditForm,
		variables: {
			client_id: "client_id",
			client_secret: "client_secret",
			tenant_id: "tenant_id",
		},
		authMethods: [
			{
				authType: ConnectionAuthType.MicrosoftOauthDefault,
				schema: microsoftOauthDefaultIntegrationSchema,
				form: MicrosoftTeamsOauthForm,
			},
			{
				authType: ConnectionAuthType.MicrosoftOauthPrivate,
				schema: microsoftOauthPrivateIntegrationSchema,
				form: MicrosoftTeamsOauthPrivateForm,
			},
			{
				authType: ConnectionAuthType.DaemonApp,
				schema: microsoftDaemonAppIntegrationSchema,
				form: MicrosoftTeamsDaemonForm,
			},
		],
	},

	[Integrations.notion]: {
		label: "Notion",
		icon: NotionIcon,
		addComponent: NotionIntegrationAddForm,
		editComponent: NotionIntegrationEditForm,
		variables: { apiKey: "api_key" },
		authMethods: [
			{
				authType: ConnectionAuthType.OauthDefault,
				schema: notionOauthDefaultIntegrationSchema,
				form: NotionOauthForm,
			},
			{ authType: ConnectionAuthType.ApiKey, schema: notionApiKeyIntegrationSchema, form: NotionApiKeyForm },
		],
	},

	[Integrations.pipedrive]: {
		label: "Pipedrive",
		icon: PipedriveIcon,
		addComponent: PipedriveIntegrationAddForm,
		editComponent: PipedriveIntegrationEditForm,
		variables: {
			api_key: "api_key",
			company_domain: "company_domain",
		},
	},

	[Integrations.reddit]: {
		label: "Reddit",
		icon: RedditIcon,
		addComponent: RedditIntegrationAddForm,
		editComponent: RedditIntegrationEditForm,
		variables: {
			client_id: "client_id",
			client_secret: "client_secret",
			user_agent: "user_agent",
			username: "username",
			password: "password",
		},
	},

	[Integrations.salesforce]: {
		label: "Salesforce",
		icon: SalesforceIcon,
		addComponent: SalesforceIntegrationAddForm,
		editComponent: SalesforceIntegrationEditForm,
		variables: {
			client_id: "client_id",
			client_secret: "client_secret",
			instance_url: "instance_url",
		},
		authMethods: [
			{
				authType: ConnectionAuthType.OauthDefault,
				schema: salesforceOauthDefaultIntegrationSchema,
				form: SalesforceOauthForm,
			},
			{
				authType: ConnectionAuthType.OauthPrivate,
				schema: salesforcePrivateAuthIntegrationSchema,
				form: SalesforceOauthPrivateForm,
			},
		],
	},

	[Integrations.sheets]: {
		label: "Google Sheets",
		icon: GoogleSheetsIcon,
		addComponent: GoogleIntegrationAddForm,
		editComponent: GoogleIntegrationEditForm,
		variables: { json: "JSON" },
		authMethods: [
			{ authType: ConnectionAuthType.OauthUser, schema: googleOauthSchema, form: OauthGoogleForm },
			{ authType: ConnectionAuthType.Json, schema: googleJsonIntegrationSchema, form: JsonGoogleForm },
		],
	},

	[Integrations.slack]: {
		label: "Slack",
		icon: SlackIcon,
		addComponent: SlackIntegrationAddForm,
		editComponent: SlackIntegrationEditForm,
		variables: {
			bot_token: "botToken",
			app_token: "appToken",
		},
		authMethods: [
			{
				authType: ConnectionAuthType.OauthDefault,
				schema: slackOauthDefaultIntegrationSchema,
				form: SlackOauthForm,
			},
			{
				authType: ConnectionAuthType.OauthPrivate,
				schema: slackPrivateAuthIntegrationSchema,
				form: SlackOauthPrivateForm,
			},
		],
	},

	[Integrations.telegram]: {
		label: "Telegram",
		icon: TelegramIcon,
		addComponent: TelegramIntegrationAddForm,
		editComponent: TelegramIntegrationEditForm,
		variables: { bot_token: "BotToken" },
	},

	[Integrations.twilio]: {
		label: "Twilio",
		icon: TwilioIcon,
		addComponent: TwilioIntegrationAddForm,
		editComponent: TwilioIntegrationEditForm,
		variables: {
			account_sid: "AccountSID",
			api_key: "Username",
			api_secret: "Password",
			auth_token: "Password",
		},
		authMethods: [
			{ authType: ConnectionAuthType.AuthToken, schema: twilioTokenIntegrationSchema, form: AuthTokenTwilioForm },
			{ authType: ConnectionAuthType.ApiKey, schema: twilioApiKeyIntegrationSchema, form: ApiKeyTwilioForm },
		],
	},

	[Integrations.youtube]: {
		label: "YouTube",
		icon: GoogleYoutubeIcon,
		addComponent: GoogleIntegrationAddForm,
		editComponent: GoogleIntegrationEditForm,
		variables: { json: "JSON" },
		authMethods: [
			{ authType: ConnectionAuthType.Oauth, schema: googleOauthSchema, form: OauthGoogleForm },
			{ authType: ConnectionAuthType.Json, schema: googleJsonIntegrationSchema, form: JsonGoogleForm },
		],
	},

	[Integrations.zoom]: {
		label: "Zoom",
		icon: ZoomIcon,
		addComponent: ZoomIntegrationAddForm,
		editComponent: ZoomIntegrationEditForm,
		variables: {
			account_id: "account_id",
			client_id: "client_id",
			client_secret: "client_secret",
			secret_token: "secret_token",
		},
		authMethods: [
			{
				authType: ConnectionAuthType.OauthDefault,
				schema: zoomOauthDefaultIntegrationSchema,
				form: ZoomOauthForm,
			},
			{
				authType: ConnectionAuthType.OauthPrivate,
				schema: zoomPrivateAuthIntegrationSchema,
				form: ZoomOauthPrivateForm,
			},
			{
				authType: ConnectionAuthType.serverToServer,
				schema: zoomServerToServerIntegrationSchema,
				form: ZoomServerToServerForm,
			},
		],
	},
};
