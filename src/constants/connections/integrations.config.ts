import { ConnectionAuthType } from "@enums/connections";
import { Integrations } from "@src/enums/components";
import { IntegrationConfigMap } from "@src/types/integrations";
import {
	githubIntegrationSchema,
	githubPrivateAuthIntegrationSchema,
	legacyOauthSchema,
	slackIntegrationSchema,
	slackPrivateAuthIntegrationSchema,
	genericDefaultOauthSchema,
	twilioTokenIntegrationSchema,
	twilioApiKeyIntegrationSchema,
	googleOauthSchema,
	googleJsonIntegrationSchema,
	googleCalendarIntegrationSchema,
	googleFormsIntegrationSchema,
	jiraIntegrationSchema,
	confluenceIntegrationSchema,
	linearOauthIntegrationSchema,
	linearPrivateAuthIntegrationSchema,
	linearApiKeyIntegrationSchema,
	zoomPrivateAuthIntegrationSchema,
	zoomServerToServerIntegrationSchema,
	microsoftTeamsIntegrationSchema,
	salesforcePrivateAuthIntegrationSchema,
	notionApiKeyIntegrationSchema,
	asanaIntegrationSchema,
	anthropicIntegrationSchema,
	auth0IntegrationSchema,
	awsIntegrationSchema,
	discordIntegrationSchema,
	googleGeminiIntegrationSchema,
	openAiIntegrationSchema,
	telegramBotTokenIntegrationSchema,
	kubernetesIntegrationSchema,
	redditPrivateAuthIntegrationSchema,
	pipedriveIntegrationSchema,
} from "@validations";

import {
	AsanaIntegrationAddForm,
	AnthropicIntegrationAddForm,
	Auth0IntegrationAddForm,
	AwsIntegrationAddForm,
	ConfluenceIntegrationAddForm,
	DiscordIntegrationAddForm,
	GithubIntegrationAddForm,
	GoogleCalendarIntegrationAddForm,
	GoogleFormsIntegrationAddForm,
	GoogleGeminiIntegrationAddForm,
	GoogleIntegrationAddForm,
	HubspotIntegrationAddForm,
	JiraIntegrationAddForm,
	LinearIntegrationAddForm,
	OpenAiIntegrationAddForm,
	SlackIntegrationAddForm,
	TwilioIntegrationAddForm,
	TelegramIntegrationAddForm,
	ZoomIntegrationAddForm,
	SalesforceIntegrationAddForm,
	KubernetesIntegrationAddForm,
	RedditIntegrationAddForm,
	PipedriveIntegrationAddForm,
	NotionIntegrationAddForm,
	AsanaIntegrationEditForm,
	AnthropicIntegrationEditForm,
	Auth0IntegrationEditForm,
	AwsIntegrationEditForm,
	ConfluenceIntegrationEditForm,
	DiscordIntegrationEditForm,
	GithubIntegrationEditForm,
	GoogleCalendarIntegrationEditForm,
	GoogleFormsIntegrationEditForm,
	GoogleGeminiIntegrationEditForm,
	GoogleIntegrationEditForm,
	HubspotIntegrationEditForm,
	JiraIntegrationEditForm,
	LinearIntegrationEditForm,
	OpenAiIntegrationEditForm,
	SlackIntegrationEditForm,
	TwilioIntegrationEditForm,
	TelegramIntegrationEditForm,
	ZoomIntegrationEditForm,
	SalesforceIntegrationEditForm,
	KubernetesIntegrationEditForm,
	RedditIntegrationEditForm,
	PipedriveIntegrationEditForm,
	NotionIntegrationEditForm,
} from "@components/organisms/configuration/connections/integrations";
import {
	ConfluenceApiTokenForm,
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
	OauthJiraForm,
} from "@components/organisms/configuration/connections/integrations/jira/authMethods";
import {
	LinearOauthForm,
	LinearOauthPrivateForm,
	LinearApiKeyForm,
} from "@components/organisms/configuration/connections/integrations/linear/authMethods";
import {
	MicrosoftTeamsOauthForm,
	MicrosoftTeamsOauthPrivateForm,
	MicrosoftTeamsDaemonForm,
	MicrosoftTeamsIntegrationAddForm,
	MicrosoftTeamsIntegrationEditForm,
} from "@components/organisms/configuration/connections/integrations/microsoft/teams";
import {
	NotionOauthForm,
	NotionApiKeyForm,
} from "@components/organisms/configuration/connections/integrations/notion/authMethods";
import {
	SalesforceOauthForm,
	SalesforceOauthPrivateForm,
} from "@components/organisms/configuration/connections/integrations/salesforce/authMethods";
import {
	OauthForm as SlackOauthForm,
	SocketForm as SlackSocketForm,
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
	AsanaIcon,
	AnthropicIcon,
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

export const integrationConfig: IntegrationConfigMap = {
	[Integrations.github]: {
		id: Integrations.github,
		label: "GitHub",
		icon: GithubIcon,
		category: "code",
		visibility: {
			hidden: false,
			featureFlag: null,
			isLegacy: true,
			hasLegacyConnectionType: true,
		},
		authMethods: {
			[ConnectionAuthType.Pat]: {
				label: "PAT + Webhook",
				schema: githubIntegrationSchema,
				form: GithubPatForm,
				variablesMapping: {
					pat: "pat",
					secret: "pat_secret",
					webhook_secret: "webhook_secret",
				},
				dataKeys: ["pat", "secret", "webhook_secret"],
			},
			[ConnectionAuthType.Oauth]: {
				label: "OAuth v2 - Default app",
				schema: legacyOauthSchema,
				form: GithubOauthForm,
				variablesMapping: {},
				dataKeys: [],
				hidden: true,
			},
			[ConnectionAuthType.OauthDefault]: {
				label: "OAuth v2 - Default app",
				schema: legacyOauthSchema,
				form: GithubOauthForm,
				variablesMapping: {},
				dataKeys: [],
				legacyAuthType: ConnectionAuthType.Oauth,
			},
			[ConnectionAuthType.OauthPrivate]: {
				label: "OAuth v2 - Private app",
				schema: githubPrivateAuthIntegrationSchema,
				form: GithubOauthPrivateForm,
				variablesMapping: {
					client_id: "client_id",
					client_secret: "client_secret",
					app_id: "app_id",
					webhook_secret: "webhook_secret",
					enterprise_url: "enterprise_url",
					private_key: "private_key",
					app_name: "app_name",
				},
				dataKeys: [
					"client_id",
					"client_secret",
					"app_id",
					"webhook_secret",
					"enterprise_url",
					"private_key",
					"app_name",
				],
			},
		},
		infoLinks: [
			{
				translationKey: "github.informationPat.initConnection",
				url: "https://docs.autokitteh.com/integrations/github/connection",
			},
			{
				translationKey: "github.informationPat.auth",
				url: "https://docs.github.com/en/rest/authentication/authenticating-to-the-rest-api?apiVersion=2022-11-28#authenticating-with-a-personal-access-token",
			},
			{
				translationKey: "github.informationPat.manage",
				url: "https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens",
			},
			{
				translationKey: "github.informationPat.setting",
				url: "https://docs.github.com/en/organizations/managing-programmatic-access-to-your-organization/setting-a-personal-access-token-policy-for-your-organization",
			},
			{
				translationKey: "github.informationPat.endpoints",
				url: "https://docs.github.com/en/rest/authentication/endpoints-available-for-fine-grained-personal-access-tokens",
			},
		],
		defaultAuthMethod: ConnectionAuthType.OauthDefault,
		customAddForm: GithubIntegrationAddForm,
		customEditForm: GithubIntegrationEditForm,
	},

	[Integrations.slack]: {
		id: Integrations.slack,
		label: "Slack",
		icon: SlackIcon,
		category: "communication",
		visibility: {
			hidden: false,
			featureFlag: null,
			isLegacy: false,
			hasLegacyConnectionType: true,
		},
		authMethods: {
			[ConnectionAuthType.Socket]: {
				label: "Socket Mode",
				schema: slackIntegrationSchema,
				form: SlackSocketForm,
				variablesMapping: {
					bot_token: "botToken",
					app_token: "appToken",
				},
				dataKeys: ["bot_token", "app_token"],
				featureFlag: "displaySlackSocketIntegration",
				infoLinks: [
					{
						translationKey: "slack.information.AKGuide",
						url: "https://docs.autokitteh.com/tutorials/new_connections/slack",
					},
					{
						translationKey: "slack.information.aboutMode",
						url: "https://api.slack.com/apis/connections/socket",
					},
				],
			},
			[ConnectionAuthType.OauthDefault]: {
				label: "OAuth v2 - Default app",
				schema: genericDefaultOauthSchema,
				form: SlackOauthForm,
				variablesMapping: {},
				dataKeys: [],
				infoLinks: [
					{
						translationKey: "slack.information.configSlack",
						url: "https://docs.autokitteh.com/integrations/slack/config",
					},
					{
						translationKey: "slack.information.aboutInitSlack",
						url: "https://api.slack.com/authentication/oauth-v2",
					},
				],
			},
			[ConnectionAuthType.OauthPrivate]: {
				label: "OAuth v2 - Private app",
				schema: slackPrivateAuthIntegrationSchema,
				form: SlackOauthPrivateForm,
				variablesMapping: {
					client_id: "client_id",
					client_secret: "client_secret",
					signing_secret: "signing_secret",
				},
				dataKeys: ["client_id", "client_secret", "signing_secret"],
				infoLinks: [
					{
						translationKey: "slack.information.configSlack",
						url: "https://docs.autokitteh.com/integrations/slack/config",
					},
					{
						translationKey: "slack.information.aboutInitSlack",
						url: "https://api.slack.com/authentication/oauth-v2",
					},
				],
			},
		},
		infoLinks: [
			{
				translationKey: "slack.information.configSlack",
				url: "https://docs.autokitteh.com/integrations/slack/config",
			},
			{
				translationKey: "slack.information.aboutInitSlack",
				url: "https://api.slack.com/authentication/oauth-v2",
			},
			{
				translationKey: "slack.information.AKGuide",
				url: "https://docs.autokitteh.com/tutorials/new_connections/slack",
			},
			{
				translationKey: "slack.information.aboutMode",
				url: "https://api.slack.com/apis/connections/socket",
			},
		],
		defaultAuthMethod: ConnectionAuthType.OauthDefault,
		customAddForm: SlackIntegrationAddForm,
		customEditForm: SlackIntegrationEditForm,
	},

	[Integrations.twilio]: {
		id: Integrations.twilio,
		label: "Twilio",
		icon: TwilioIcon,
		category: "communication",
		visibility: {
			hidden: false,
			featureFlag: null,
			isLegacy: false,
			hasLegacyConnectionType: false,
		},
		authMethods: {
			[ConnectionAuthType.AuthToken]: {
				label: "Auth Token",
				schema: twilioTokenIntegrationSchema,
				form: AuthTokenTwilioForm,
				variablesMapping: {
					account_sid: "AccountSID",
					auth_token: "Password",
				},
				dataKeys: ["account_sid", "auth_token"],
			},
			[ConnectionAuthType.ApiKey]: {
				label: "API Key",
				schema: twilioApiKeyIntegrationSchema,
				form: ApiKeyTwilioForm,
				variablesMapping: {
					account_sid: "AccountSID",
					api_key: "Username",
					api_secret: "Password",
				},
				dataKeys: ["account_sid", "api_key", "api_secret"],
			},
		},
		infoLinks: [
			{
				translationKey: "twilio.information.aboutAuth",
				url: "https://www.twilio.com/docs/glossary/what-is-an-api-key",
			},
			{
				translationKey: "twilio.information.apiOverview",
				url: "https://www.twilio.com/docs/iam/api-keys",
			},
		],
		defaultAuthMethod: ConnectionAuthType.AuthToken,
		customAddForm: TwilioIntegrationAddForm,
		customEditForm: TwilioIntegrationEditForm,
	},

	[Integrations.gmail]: {
		id: Integrations.gmail,
		label: "Gmail",
		icon: GoogleGmailIcon,
		category: "communication",
		visibility: {
			hidden: false,
			featureFlag: null,
			isLegacy: false,
			hasLegacyConnectionType: false,
		},
		authMethods: {
			[ConnectionAuthType.Oauth]: {
				label: "User (OAuth 2.0)",
				schema: googleOauthSchema,
				form: OauthGoogleForm,
				variablesMapping: {},
				dataKeys: ["auth_scopes"],
			},
			[ConnectionAuthType.Json]: {
				label: "Service Account (JSON Key)",
				schema: googleJsonIntegrationSchema,
				form: JsonGoogleForm,
				variablesMapping: {
					json: "JSON",
				},
				dataKeys: ["json", "auth_scopes"],
				infoLinks: [
					{
						translationKey: "google.information.gcp",
						url: "https://cloud.google.com/iam/docs/service-account-overview",
					},
					{
						translationKey: "google.information.credentials",
						url: "https://cloud.google.com/iam/docs/service-account-creds",
					},
					{
						translationKey: "google.information.serviceAccount",
						url: "https://cloud.google.com/iam/docs/keys-create-delete",
					},
					{
						translationKey: "google.information.managingAccount",
						url: "https://cloud.google.com/iam/docs/best-practices-for-managing-service-account-keys",
					},
				],
			},
		},
		infoLinks: [
			{
				translationKey: "google.information.aboutAuth",
				url: "https://developers.google.com/workspace/guides/auth-overview",
			},
			{
				translationKey: "google.information.uisingOAuth",
				url: "https://developers.google.com/identity/protocols/oauth2/web-server",
			},
		],
		defaultAuthMethod: ConnectionAuthType.Oauth,
		customAddForm: GoogleIntegrationAddForm,
		customEditForm: GoogleIntegrationEditForm,
	},

	[Integrations.sheets]: {
		id: Integrations.sheets,
		label: "Google Sheets",
		icon: GoogleSheetsIcon,
		category: "productivity",
		visibility: {
			hidden: false,
			featureFlag: null,
			isLegacy: false,
			hasLegacyConnectionType: false,
		},
		authMethods: {
			[ConnectionAuthType.Oauth]: {
				label: "User (OAuth 2.0)",
				schema: googleOauthSchema,
				form: OauthGoogleForm,
				variablesMapping: {},
				dataKeys: ["auth_scopes"],
			},
			[ConnectionAuthType.Json]: {
				label: "Service Account (JSON Key)",
				schema: googleJsonIntegrationSchema,
				form: JsonGoogleForm,
				variablesMapping: {
					json: "JSON",
				},
				dataKeys: ["json", "auth_scopes"],
				infoLinks: [
					{
						translationKey: "google.information.gcp",
						url: "https://cloud.google.com/iam/docs/service-account-overview",
					},
					{
						translationKey: "google.information.credentials",
						url: "https://cloud.google.com/iam/docs/service-account-creds",
					},
					{
						translationKey: "google.information.serviceAccount",
						url: "https://cloud.google.com/iam/docs/keys-create-delete",
					},
					{
						translationKey: "google.information.managingAccount",
						url: "https://cloud.google.com/iam/docs/best-practices-for-managing-service-account-keys",
					},
				],
			},
		},
		infoLinks: [
			{
				translationKey: "google.information.aboutAuth",
				url: "https://developers.google.com/workspace/guides/auth-overview",
			},
			{
				translationKey: "google.information.uisingOAuth",
				url: "https://developers.google.com/identity/protocols/oauth2/web-server",
			},
		],
		defaultAuthMethod: ConnectionAuthType.Oauth,
		customAddForm: GoogleIntegrationAddForm,
		customEditForm: GoogleIntegrationEditForm,
	},

	[Integrations.drive]: {
		id: Integrations.drive,
		label: "Google Drive",
		icon: GoogleDriveIcon,
		category: "productivity",
		visibility: {
			hidden: false,
			featureFlag: null,
			isLegacy: false,
			hasLegacyConnectionType: false,
		},
		authMethods: {
			[ConnectionAuthType.Oauth]: {
				label: "User (OAuth 2.0)",
				schema: googleOauthSchema,
				form: OauthGoogleForm,
				variablesMapping: {},
				dataKeys: ["auth_scopes"],
			},
			[ConnectionAuthType.Json]: {
				label: "Service Account (JSON Key)",
				schema: googleJsonIntegrationSchema,
				form: JsonGoogleForm,
				variablesMapping: {
					json: "JSON",
				},
				dataKeys: ["json", "auth_scopes"],
				infoLinks: [
					{
						translationKey: "google.information.gcp",
						url: "https://cloud.google.com/iam/docs/service-account-overview",
					},
					{
						translationKey: "google.information.credentials",
						url: "https://cloud.google.com/iam/docs/service-account-creds",
					},
					{
						translationKey: "google.information.serviceAccount",
						url: "https://cloud.google.com/iam/docs/keys-create-delete",
					},
					{
						translationKey: "google.information.managingAccount",
						url: "https://cloud.google.com/iam/docs/best-practices-for-managing-service-account-keys",
					},
				],
			},
		},
		infoLinks: [
			{
				translationKey: "google.information.aboutAuth",
				url: "https://developers.google.com/workspace/guides/auth-overview",
			},
			{
				translationKey: "google.information.uisingOAuth",
				url: "https://developers.google.com/identity/protocols/oauth2/web-server",
			},
		],
		defaultAuthMethod: ConnectionAuthType.Oauth,
		customAddForm: GoogleIntegrationAddForm,
		customEditForm: GoogleIntegrationEditForm,
	},

	[Integrations.calendar]: {
		id: Integrations.calendar,
		label: "Google Calendar",
		icon: GoogleCalendarIcon,
		category: "productivity",
		visibility: {
			hidden: false,
			featureFlag: null,
			isLegacy: false,
			hasLegacyConnectionType: false,
		},
		authMethods: {
			[ConnectionAuthType.Oauth]: {
				label: "User (OAuth 2.0)",
				schema: googleCalendarIntegrationSchema,
				form: OauthGoogleCalendarForm,
				variablesMapping: {
					cal_id: "CalendarID",
				},
				dataKeys: ["auth_scopes", "cal_id"],
			},
			[ConnectionAuthType.Json]: {
				label: "Service Account (JSON Key)",
				schema: googleCalendarIntegrationSchema,
				form: JsonGoogleCalendarForm,
				variablesMapping: {
					json: "JSON",
					cal_id: "CalendarID",
				},
				dataKeys: ["json", "auth_scopes", "cal_id"],
				infoLinks: [
					{
						translationKey: "google.information.gcp",
						url: "https://cloud.google.com/iam/docs/service-account-overview",
					},
					{
						translationKey: "google.information.credentials",
						url: "https://cloud.google.com/iam/docs/service-account-creds",
					},
					{
						translationKey: "google.information.serviceAccount",
						url: "https://cloud.google.com/iam/docs/keys-create-delete",
					},
					{
						translationKey: "google.information.managingAccount",
						url: "https://cloud.google.com/iam/docs/best-practices-for-managing-service-account-keys",
					},
				],
			},
		},
		infoLinks: [
			{
				translationKey: "google.information.aboutAuth",
				url: "https://developers.google.com/workspace/guides/auth-overview",
			},
			{
				translationKey: "google.information.uisingOAuth",
				url: "https://developers.google.com/identity/protocols/oauth2/web-server",
			},
		],
		defaultAuthMethod: ConnectionAuthType.Oauth,
		customAddForm: GoogleCalendarIntegrationAddForm,
		customEditForm: GoogleCalendarIntegrationEditForm,
	},

	[Integrations.forms]: {
		id: Integrations.forms,
		label: "Google Forms",
		icon: GoogleFormsIcon,
		category: "productivity",
		visibility: {
			hidden: false,
			featureFlag: null,
			isLegacy: false,
			hasLegacyConnectionType: false,
		},
		authMethods: {
			[ConnectionAuthType.Oauth]: {
				label: "User (OAuth 2.0)",
				schema: googleFormsIntegrationSchema,
				form: OauthGoogleFormsForm,
				variablesMapping: {
					form_id: "FormID",
				},
				dataKeys: ["auth_scopes", "form_id"],
			},
			[ConnectionAuthType.Json]: {
				label: "Service Account (JSON Key)",
				schema: googleFormsIntegrationSchema,
				form: JsonGoogleFormsForm,
				variablesMapping: {
					json: "JSON",
					form_id: "FormID",
				},
				dataKeys: ["json", "auth_scopes", "form_id"],
				infoLinks: [
					{
						translationKey: "google.information.gcp",
						url: "https://cloud.google.com/iam/docs/service-account-overview",
					},
					{
						translationKey: "google.information.credentials",
						url: "https://cloud.google.com/iam/docs/service-account-creds",
					},
					{
						translationKey: "google.information.serviceAccount",
						url: "https://cloud.google.com/iam/docs/keys-create-delete",
					},
					{
						translationKey: "google.information.managingAccount",
						url: "https://cloud.google.com/iam/docs/best-practices-for-managing-service-account-keys",
					},
				],
			},
		},
		infoLinks: [
			{
				translationKey: "google.information.aboutAuth",
				url: "https://developers.google.com/workspace/guides/auth-overview",
			},
			{
				translationKey: "google.information.uisingOAuth",
				url: "https://developers.google.com/identity/protocols/oauth2/web-server",
			},
		],
		defaultAuthMethod: ConnectionAuthType.Oauth,
		customAddForm: GoogleFormsIntegrationAddForm,
		customEditForm: GoogleFormsIntegrationEditForm,
	},

	[Integrations.youtube]: {
		id: Integrations.youtube,
		label: "YouTube",
		icon: GoogleYoutubeIcon,
		category: "communication",
		visibility: {
			hidden: false,
			featureFlag: null,
			isLegacy: false,
			hasLegacyConnectionType: false,
		},
		authMethods: {
			[ConnectionAuthType.Oauth]: {
				label: "User (OAuth 2.0)",
				schema: googleOauthSchema,
				form: OauthGoogleForm,
				variablesMapping: {},
				dataKeys: ["auth_scopes"],
			},
			[ConnectionAuthType.Json]: {
				label: "Service Account (JSON Key)",
				schema: googleJsonIntegrationSchema,
				form: JsonGoogleForm,
				variablesMapping: {
					json: "JSON",
				},
				dataKeys: ["json", "auth_scopes"],
				infoLinks: [
					{
						translationKey: "google.information.gcp",
						url: "https://cloud.google.com/iam/docs/service-account-overview",
					},
					{
						translationKey: "google.information.credentials",
						url: "https://cloud.google.com/iam/docs/service-account-creds",
					},
					{
						translationKey: "google.information.serviceAccount",
						url: "https://cloud.google.com/iam/docs/keys-create-delete",
					},
					{
						translationKey: "google.information.managingAccount",
						url: "https://cloud.google.com/iam/docs/best-practices-for-managing-service-account-keys",
					},
				],
			},
		},
		infoLinks: [
			{
				translationKey: "google.information.aboutAuth",
				url: "https://developers.google.com/workspace/guides/auth-overview",
			},
			{
				translationKey: "google.information.uisingOAuth",
				url: "https://developers.google.com/identity/protocols/oauth2/web-server",
			},
		],
		defaultAuthMethod: ConnectionAuthType.Oauth,
		customAddForm: GoogleIntegrationAddForm,
		customEditForm: GoogleIntegrationEditForm,
	},

	[Integrations.googlegemini]: {
		id: Integrations.googlegemini,
		label: "Google Gemini",
		icon: GoogleGeminiIcon,
		category: "ai",
		visibility: {
			hidden: false,
			featureFlag: null,
			isLegacy: false,
			hasLegacyConnectionType: false,
		},
		authMethods: {
			[ConnectionAuthType.ApiKey]: {
				label: "API Key",
				schema: googleGeminiIntegrationSchema,
				form: GoogleGeminiIntegrationAddForm as any,
				variablesMapping: {
					key: "api_key",
				},
				dataKeys: ["key"],
			},
		},
		infoLinks: [],
		defaultAuthMethod: ConnectionAuthType.ApiKey,
		customAddForm: GoogleGeminiIntegrationAddForm,
		customEditForm: GoogleGeminiIntegrationEditForm,
	},

	[Integrations.jira]: {
		id: Integrations.jira,
		label: "Atlassian Jira",
		icon: JiraIcon,
		category: "productivity",
		visibility: {
			hidden: false,
			featureFlag: null,
			isLegacy: true,
			hasLegacyConnectionType: false,
		},
		authMethods: {
			[ConnectionAuthType.Oauth]: {
				label: "OAuth 2.0 App",
				schema: legacyOauthSchema,
				form: OauthJiraForm,
				variablesMapping: {},
				dataKeys: [],
			},
			[ConnectionAuthType.ApiToken]: {
				label: "User API Token / PAT",
				schema: jiraIntegrationSchema,
				form: ApiTokenJiraForm,
				variablesMapping: {
					base_url: "BaseURL",
					token: "Token",
					email: "Email",
				},
				dataKeys: ["base_url", "token", "email"],
			},
		},
		infoLinks: [
			{
				translationKey: "jira.information.apiTokens",
				url: "https://id.atlassian.com/manage-profile/security/api-tokens",
			},
			{
				translationKey: "jira.information.accessTokens",
				url: "https://confluence.atlassian.com/enterprise/using-personal-access-tokens-1026032365.html",
			},
		],
		defaultAuthMethod: ConnectionAuthType.Oauth,
		customAddForm: JiraIntegrationAddForm,
		customEditForm: JiraIntegrationEditForm,
	},

	[Integrations.confluence]: {
		id: Integrations.confluence,
		label: "Atlassian Confluence",
		icon: ConfluenceIcon,
		category: "productivity",
		visibility: {
			hidden: false,
			featureFlag: null,
			isLegacy: true,
			hasLegacyConnectionType: false,
		},
		authMethods: {
			[ConnectionAuthType.Oauth]: {
				label: "OAuth 2.0 App",
				schema: legacyOauthSchema,
				form: ConfluenceOauthForm,
				variablesMapping: {},
				dataKeys: [],
			},
			[ConnectionAuthType.ApiToken]: {
				label: "User API Token / PAT",
				schema: confluenceIntegrationSchema,
				form: ConfluenceApiTokenForm,
				variablesMapping: {
					base_url: "BaseURL",
					token: "Token",
					email: "Email",
				},
				dataKeys: ["base_url", "token", "email"],
			},
		},
		infoLinks: [
			{
				translationKey: "confluence.information.apiTokens",
				url: "https://id.atlassian.com/manage-profile/security/api-tokens",
			},
			{
				translationKey: "confluence.information.accessTokens",
				url: "https://confluence.atlassian.com/enterprise/using-personal-access-tokens-1026032365.html",
			},
		],
		defaultAuthMethod: ConnectionAuthType.Oauth,
		customAddForm: ConfluenceIntegrationAddForm,
		customEditForm: ConfluenceIntegrationEditForm,
	},

	[Integrations.linear]: {
		id: Integrations.linear,
		label: "Linear",
		icon: LinearIcon,
		category: "productivity",
		visibility: {
			hidden: false,
			featureFlag: null,
			isLegacy: false,
			hasLegacyConnectionType: false,
		},
		authMethods: {
			[ConnectionAuthType.OauthDefault]: {
				label: "OAuth v2 - Default app",
				schema: linearOauthIntegrationSchema,
				form: LinearOauthForm,
				variablesMapping: {},
				dataKeys: [],
				featureFlag: "linearHideDefaultOAuth",
				hidden: false,
			},
			[ConnectionAuthType.OauthPrivate]: {
				label: "OAuth v2 - Private app",
				schema: linearPrivateAuthIntegrationSchema,
				form: LinearOauthPrivateForm,
				variablesMapping: {
					client_id: "private_client_id",
					client_secret: "private_client_secret",
					webhook_url: "webhook_url",
					webhook_secret: "private_webhook_secret",
				},
				dataKeys: ["client_id", "client_secret", "webhook_secret", "actor"],
			},
			[ConnectionAuthType.ApiKey]: {
				label: "API Key",
				schema: linearApiKeyIntegrationSchema,
				form: LinearApiKeyForm,
				variablesMapping: {
					api_key: "api_key",
				},
				dataKeys: ["api_key"],
			},
		},
		formOptions: {
			actor: [
				{ label: "User", value: "user" },
				{ label: "Application", value: "application" },
			],
		},
		infoLinks: [],
		defaultAuthMethod: ConnectionAuthType.OauthPrivate,
		customAddForm: LinearIntegrationAddForm,
		customEditForm: LinearIntegrationEditForm,
	},

	[Integrations.zoom]: {
		id: Integrations.zoom,
		label: "Zoom",
		icon: ZoomIcon,
		category: "communication",
		visibility: {
			hidden: false,
			featureFlag: null,
			isLegacy: false,
			hasLegacyConnectionType: false,
		},
		authMethods: {
			[ConnectionAuthType.OauthDefault]: {
				label: "OAuth v2 - Default app",
				schema: genericDefaultOauthSchema,
				form: ZoomOauthForm,
				variablesMapping: {},
				dataKeys: [],
				featureFlag: "zoomHideDefaultOAuth",
			},
			[ConnectionAuthType.OauthPrivate]: {
				label: "OAuth v2 - Private app",
				schema: zoomPrivateAuthIntegrationSchema,
				form: ZoomOauthPrivateForm,
				variablesMapping: {
					client_id: "client_id",
					client_secret: "client_secret",
					secret_token: "secret_token",
				},
				dataKeys: ["client_id", "client_secret", "secret_token"],
			},
			[ConnectionAuthType.serverToServer]: {
				label: "Private Server-to-Server",
				schema: zoomServerToServerIntegrationSchema,
				form: ZoomServerToServerForm,
				variablesMapping: {
					account_id: "account_id",
					client_id: "client_id",
					client_secret: "client_secret",
				},
				dataKeys: ["account_id", "client_id", "client_secret"],
			},
		},
		infoLinks: [],
		defaultAuthMethod: ConnectionAuthType.OauthPrivate,
		customAddForm: ZoomIntegrationAddForm,
		customEditForm: ZoomIntegrationEditForm,
	},

	[Integrations.salesforce]: {
		id: Integrations.salesforce,
		label: "Salesforce",
		icon: SalesforceIcon,
		category: "crm",
		visibility: {
			hidden: false,
			featureFlag: null,
			isLegacy: false,
			hasLegacyConnectionType: false,
		},
		authMethods: {
			[ConnectionAuthType.OauthDefault]: {
				label: "OAuth v2 - Default app",
				schema: genericDefaultOauthSchema,
				form: SalesforceOauthForm,
				variablesMapping: {},
				dataKeys: [],
				featureFlag: "salesforceHideDefaultOAuth",
			},
			[ConnectionAuthType.OauthPrivate]: {
				label: "OAuth v2 - Private app",
				schema: salesforcePrivateAuthIntegrationSchema,
				form: SalesforceOauthPrivateForm,
				variablesMapping: {
					client_id: "client_id",
					client_secret: "client_secret",
				},
				dataKeys: ["client_id", "client_secret"],
			},
		},
		infoLinks: [],
		defaultAuthMethod: ConnectionAuthType.OauthPrivate,
		customAddForm: SalesforceIntegrationAddForm,
		customEditForm: SalesforceIntegrationEditForm,
	},

	[Integrations.microsoft_teams]: {
		id: Integrations.microsoft_teams,
		label: "Microsoft Teams",
		icon: MicrosoftTeamsIcon,
		category: "communication",
		visibility: {
			hidden: false,
			featureFlag: null,
			isLegacy: false,
			hasLegacyConnectionType: false,
		},
		authMethods: {
			[ConnectionAuthType.OauthDefault]: {
				label: "Default user-delegated app",
				schema: microsoftTeamsIntegrationSchema,
				form: MicrosoftTeamsOauthForm,
				variablesMapping: {},
				dataKeys: [],
				featureFlag: "microsoftHideDefaultOAuth",
			},
			[ConnectionAuthType.OauthPrivate]: {
				label: "Private user-delegated app",
				schema: microsoftTeamsIntegrationSchema,
				form: MicrosoftTeamsOauthPrivateForm,
				variablesMapping: {
					client_id: "client_id",
					client_secret: "client_secret",
					tenant_id: "tenant_id",
				},
				dataKeys: ["client_id", "client_secret", "tenant_id", "auth_scopes"],
			},
			[ConnectionAuthType.DaemonApp]: {
				label: "Private daemon application",
				schema: microsoftTeamsIntegrationSchema,
				form: MicrosoftTeamsDaemonForm,
				variablesMapping: {
					client_id: "client_id",
					client_secret: "client_secret",
					tenant_id: "tenant_id",
				},
				dataKeys: ["client_id", "client_secret", "tenant_id", "auth_scopes"],
			},
		},
		infoLinks: [],
		defaultAuthMethod: ConnectionAuthType.OauthPrivate,
		customAddForm: MicrosoftTeamsIntegrationAddForm,
		customEditForm: MicrosoftTeamsIntegrationEditForm,
	},

	[Integrations.notion]: {
		id: Integrations.notion,
		label: "Notion",
		icon: NotionIcon,
		category: "productivity",
		visibility: {
			hidden: false,
			featureFlag: null,
			isLegacy: false,
			hasLegacyConnectionType: false,
		},
		authMethods: {
			[ConnectionAuthType.OauthDefault]: {
				label: "OAuth v2 - Default app",
				schema: genericDefaultOauthSchema,
				form: NotionOauthForm,
				variablesMapping: {},
				dataKeys: [],
				featureFlag: "notionHideDefaultOAuth",
			},
			[ConnectionAuthType.ApiKey]: {
				label: "API Key",
				schema: notionApiKeyIntegrationSchema,
				form: NotionApiKeyForm,
				variablesMapping: {
					apiKey: "api_key",
				},
				dataKeys: ["apiKey"],
			},
		},
		infoLinks: [],
		defaultAuthMethod: ConnectionAuthType.ApiKey,
		customAddForm: NotionIntegrationAddForm,
		customEditForm: NotionIntegrationEditForm,
	},

	[Integrations.asana]: {
		id: Integrations.asana,
		label: "Asana",
		icon: AsanaIcon,
		category: "productivity",
		visibility: {
			hidden: false,
			featureFlag: null,
			isLegacy: false,
			hasLegacyConnectionType: false,
		},
		authMethods: {
			[ConnectionAuthType.Pat]: {
				label: "Personal Access Token",
				schema: asanaIntegrationSchema,
				form: AsanaIntegrationAddForm as any,
				variablesMapping: {
					pat: "pat",
				},
				dataKeys: ["pat"],
			},
		},
		infoLinks: [],
		defaultAuthMethod: ConnectionAuthType.Pat,
		customAddForm: AsanaIntegrationAddForm,
		customEditForm: AsanaIntegrationEditForm,
	},

	[Integrations.anthropic]: {
		id: Integrations.anthropic,
		label: "Anthropic",
		icon: AnthropicIcon,
		category: "ai",
		visibility: {
			hidden: false,
			featureFlag: null,
			isLegacy: false,
			hasLegacyConnectionType: false,
		},
		authMethods: {
			[ConnectionAuthType.ApiKey]: {
				label: "API Key",
				schema: anthropicIntegrationSchema,
				form: AnthropicIntegrationAddForm as any,
				variablesMapping: {
					api_key: "api_key",
				},
				dataKeys: ["api_key"],
			},
		},
		infoLinks: [],
		defaultAuthMethod: ConnectionAuthType.ApiKey,
		customAddForm: AnthropicIntegrationAddForm,
		customEditForm: AnthropicIntegrationEditForm,
	},

	[Integrations.auth0]: {
		id: Integrations.auth0,
		label: "Auth0",
		icon: Auth0Icon,
		category: "other",
		visibility: {
			hidden: false,
			featureFlag: null,
			isLegacy: false,
			hasLegacyConnectionType: false,
		},
		authMethods: {
			[ConnectionAuthType.Oauth]: {
				label: "OAuth",
				schema: auth0IntegrationSchema,
				form: Auth0IntegrationAddForm as any,
				variablesMapping: {
					client_id: "client_id",
					client_secret: "client_secret",
					auth0_domain: "auth0_domain",
				},
				dataKeys: ["client_id", "client_secret", "auth0_domain"],
			},
		},
		infoLinks: [],
		defaultAuthMethod: ConnectionAuthType.Oauth,
		customAddForm: Auth0IntegrationAddForm,
		customEditForm: Auth0IntegrationEditForm,
	},

	[Integrations.aws]: {
		id: Integrations.aws,
		label: "AWS",
		icon: AwsIcon,
		category: "cloud",
		visibility: {
			hidden: false,
			featureFlag: null,
			isLegacy: false,
			hasLegacyConnectionType: false,
		},
		authMethods: {
			[ConnectionAuthType.AWSConfig]: {
				label: "AWS Config",
				schema: awsIntegrationSchema,
				form: AwsIntegrationAddForm as any,
				variablesMapping: {
					region: "Region",
					access_key: "AccessKeyID",
					secret_key: "SecretKey",
					token: "Token",
				},
				dataKeys: ["region", "access_key", "secret_key", "token"],
			},
		},
		formOptions: {
			region: [
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
			],
		},
		infoLinks: [],
		defaultAuthMethod: ConnectionAuthType.AWSConfig,
		customAddForm: AwsIntegrationAddForm,
		customEditForm: AwsIntegrationEditForm,
	},

	[Integrations.discord]: {
		id: Integrations.discord,
		label: "Discord",
		icon: DiscordIcon,
		category: "communication",
		visibility: {
			hidden: false,
			featureFlag: null,
			isLegacy: false,
			hasLegacyConnectionType: false,
		},
		authMethods: {
			[ConnectionAuthType.BotToken]: {
				label: "Bot Token",
				schema: discordIntegrationSchema,
				form: DiscordIntegrationAddForm as any,
				variablesMapping: {
					botToken: "BotToken",
				},
				dataKeys: ["botToken"],
			},
		},
		infoLinks: [],
		defaultAuthMethod: ConnectionAuthType.BotToken,
		customAddForm: DiscordIntegrationAddForm,
		customEditForm: DiscordIntegrationEditForm,
	},

	[Integrations.telegram]: {
		id: Integrations.telegram,
		label: "Telegram",
		icon: TelegramIcon,
		category: "communication",
		visibility: {
			hidden: false,
			featureFlag: "telegramHideIntegration",
			isLegacy: false,
			hasLegacyConnectionType: false,
		},
		authMethods: {
			[ConnectionAuthType.BotToken]: {
				label: "Bot Token",
				schema: telegramBotTokenIntegrationSchema,
				form: TelegramIntegrationAddForm as any,
				variablesMapping: {
					bot_token: "BotToken",
				},
				dataKeys: ["bot_token"],
			},
		},
		infoLinks: [
			{
				translationKey: "telegram.information.botApi",
				url: "https://core.telegram.org/bots/api",
			},
			{
				translationKey: "telegram.information.createBot",
				url: "https://core.telegram.org/bots/tutorial#obtain-your-bot-token",
			},
		],
		defaultAuthMethod: ConnectionAuthType.BotToken,
		customAddForm: TelegramIntegrationAddForm,
		customEditForm: TelegramIntegrationEditForm,
	},

	[Integrations.chatgpt]: {
		id: Integrations.chatgpt,
		label: "OpenAI ChatGPT",
		icon: OpenAiIcon,
		category: "ai",
		visibility: {
			hidden: false,
			featureFlag: null,
			isLegacy: false,
			hasLegacyConnectionType: false,
		},
		authMethods: {
			[ConnectionAuthType.Key]: {
				label: "API Key",
				schema: openAiIntegrationSchema,
				form: OpenAiIntegrationAddForm as any,
				variablesMapping: {
					key: "apiKey",
				},
				dataKeys: ["key"],
			},
		},
		infoLinks: [
			{
				translationKey: "openAi.information.openAI",
				url: "https://platform.openai.com/",
			},
			{
				translationKey: "openAi.information.apiKeys",
				url: "https://platform.openai.com/api-keys",
			},
		],
		defaultAuthMethod: ConnectionAuthType.Key,
		customAddForm: OpenAiIntegrationAddForm,
		customEditForm: OpenAiIntegrationEditForm,
	},

	[Integrations.hubspot]: {
		id: Integrations.hubspot,
		label: "HubSpot",
		icon: HubspotIcon,
		category: "crm",
		visibility: {
			hidden: false,
			featureFlag: null,
			isLegacy: true,
			hasLegacyConnectionType: false,
		},
		authMethods: {
			[ConnectionAuthType.Oauth]: {
				label: "OAuth",
				schema: legacyOauthSchema,
				form: HubspotIntegrationAddForm as any,
				variablesMapping: {},
				dataKeys: [],
			},
		},
		infoLinks: [],
		defaultAuthMethod: ConnectionAuthType.Oauth,
		customAddForm: HubspotIntegrationAddForm,
		customEditForm: HubspotIntegrationEditForm,
	},

	[Integrations.kubernetes]: {
		id: Integrations.kubernetes,
		label: "Kubernetes",
		icon: KubernetesIcon,
		category: "cloud",
		visibility: {
			hidden: false,
			featureFlag: null,
			isLegacy: false,
			hasLegacyConnectionType: false,
		},
		authMethods: {
			[ConnectionAuthType.JsonKey]: {
				label: "Config File",
				schema: kubernetesIntegrationSchema,
				form: KubernetesIntegrationAddForm as any,
				variablesMapping: {
					config_file: "config_file",
				},
				dataKeys: ["config_file"],
			},
		},
		infoLinks: [],
		defaultAuthMethod: ConnectionAuthType.JsonKey,
		customAddForm: KubernetesIntegrationAddForm,
		customEditForm: KubernetesIntegrationEditForm,
	},

	[Integrations.reddit]: {
		id: Integrations.reddit,
		label: "Reddit",
		icon: RedditIcon,
		category: "communication",
		visibility: {
			hidden: false,
			featureFlag: null,
			isLegacy: false,
			hasLegacyConnectionType: false,
		},
		authMethods: {
			[ConnectionAuthType.OauthPrivate]: {
				label: "OAuth Private",
				schema: redditPrivateAuthIntegrationSchema,
				form: RedditIntegrationAddForm as any,
				variablesMapping: {
					client_id: "client_id",
					client_secret: "client_secret",
					user_agent: "user_agent",
					username: "username",
					password: "password",
				},
				dataKeys: ["client_id", "client_secret", "user_agent", "username", "password"],
			},
		},
		infoLinks: [
			{
				translationKey: "reddit.information.apiDocumentation",
				url: "https://www.reddit.com/r/reddit.com/wiki/api/",
			},
		],
		defaultAuthMethod: ConnectionAuthType.OauthPrivate,
		customAddForm: RedditIntegrationAddForm,
		customEditForm: RedditIntegrationEditForm,
	},

	[Integrations.pipedrive]: {
		id: Integrations.pipedrive,
		label: "Pipedrive",
		icon: PipedriveIcon,
		category: "crm",
		visibility: {
			hidden: false,
			featureFlag: "pipedriveHideIntegration",
			isLegacy: false,
			hasLegacyConnectionType: false,
		},
		authMethods: {
			[ConnectionAuthType.ApiKey]: {
				label: "API Key",
				schema: pipedriveIntegrationSchema,
				form: PipedriveIntegrationAddForm as any,
				variablesMapping: {
					api_key: "api_key",
					company_domain: "company_domain",
				},
				dataKeys: ["api_key", "company_domain"],
			},
		},
		infoLinks: [
			{
				translationKey: "pipedrive.information.authentication",
				url: "https://pipedrive.readme.io/docs/core-api-concepts-authentication",
			},
			{
				translationKey: "pipedrive.information.apiKey",
				url: "https://support.pipedrive.com/en/article/how-can-i-find-my-personal-api-key",
			},
		],
		defaultAuthMethod: ConnectionAuthType.ApiKey,
		customAddForm: PipedriveIntegrationAddForm,
		customEditForm: PipedriveIntegrationEditForm,
	},
};
