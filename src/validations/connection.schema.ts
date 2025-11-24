import { z } from "zod";

import { Integrations } from "@src/enums/components/integrations.enum";
import { ConnectionAuthType } from "@src/enums/connections/connectionTypes.enum";
import { getSingleAuthTypeIfForced } from "@src/utilities/forceAuthType.utils";
import { ValidateDomain } from "@src/utilities/validateDomain.utils";
import { selectSchema } from "@src/validations/shared.schema";

export const airtablePatIntegrationSchema = z.object({
	pat: z.string().min(1, "Personal Access Token is required"),
	auth_type: z.literal("pat").default("pat"),
});

export const airtableOauthIntegrationSchema = z.object({
	auth_type: z.literal("oauthDefault").default("oauthDefault"),
});

export const githubIntegrationSchema = z.object({
	pat: z.string().min(1, "Personal Access Token is required"),
	webhook: z.string(),
	secret: z.string(),
});

export const githubPrivateAuthIntegrationSchema = z.object({
	client_id: z.string().min(1, "Client ID is required"),
	client_secret: z.string().min(1, "Client Secret is required"),
	app_id: z.string().min(1, "App ID is required"),
	app_name: z.string().min(1, "App Name is required"),
	webhook_secret: z.string(),
	private_key: z.string().min(1, "Private Key is required"),
});

export const googleOauthSchema = z.object({
	auth_scopes: z
		.literal(Integrations.gmail)
		.or(z.literal(Integrations.calendar))
		.or(z.literal(Integrations.forms))
		.or(z.literal(Integrations.sheets))
		.or(z.literal(Integrations.drive))
		.or(z.literal(Integrations.youtube)),
	auth_type: z.literal("oauth").default("oauth"),
});

export const googleJsonIntegrationSchema = z.object({
	json: z.string().min(1, "Json Key is required").optional(),
	auth_scopes: z
		.literal(Integrations.gmail)
		.or(z.literal(Integrations.calendar))
		.or(z.literal(Integrations.forms))
		.or(z.literal(Integrations.sheets))
		.or(z.literal(Integrations.drive))
		.or(z.literal(Integrations.youtube)),
	auth_type: z.literal(ConnectionAuthType.Json).default(ConnectionAuthType.Json),
});

export const googleCalendarIntegrationSchema = z.object({
	jsonKey: z.string().min(1, "Json Key is required").optional(),
	cal_id: z.string().optional(),
	auth_scopes: z.literal(`google${Integrations.calendar}`).default(`google${Integrations.calendar}`),
	auth_type: z.literal("json").or(z.literal("oauth")).default("oauth"),
});

export const googleFormsIntegrationSchema = z.object({
	jsonKey: z.string().min(1, "Json Key is required").optional(),
	form_id: z.string().optional(),
	auth_scopes: z.literal(`google${Integrations.forms}`).default(`google${Integrations.forms}`),
	auth_type: z.literal("json").or(z.literal("oauth")).default("oauth"),
});

export const connectionSchema = z.object({
	connectionName: z.string().min(1, "Name is required"),
});

export const slackSocketModeIntegrationSchema = z.object({
	bot_token: z.string().min(1, "Bot Token is required"),
	app_token: z.string().min(1, "App-Level Token is required"),
	auth_type: z.literal("socketMode").default("socketMode"),
});

export const slackOauthDefaultIntegrationSchema = z.object({
	auth_type: z.literal("oauthDefault").default("oauthDefault"),
});

export const slackPrivateAuthIntegrationSchema = z.object({
	client_id: z.string().min(1, "Client ID is required"),
	client_secret: z.string().min(1, "Client Secret is required"),
	signing_secret: z.string().min(1, "Signing Secret is required"),
	auth_type: z.literal("oauthPrivate").default("oauthPrivate"),
});

export const slackIntegrationSchema = slackSocketModeIntegrationSchema;

export const awsIntegrationSchema = z.object({
	region: selectSchema.refine((value) => value.label, {
		message: "Region is required",
	}),
	access_key: z.string().min(1, "Access Key is required"),
	secret_key: z.string().min(1, "Secret Key is required"),
	token: z.string().optional(),
});

export const openAiIntegrationSchema = z.object({
	key: z.string().min(1, "Key is required"),
});

export const twilioTokenIntegrationSchema = z.object({
	account_sid: z.string().min(1, "Account SID is required"),
	auth_token: z.string().min(1, "Auth Token is required"),
});

export const twilioApiKeyIntegrationSchema = z.object({
	account_sid: z.string().min(1, "Account SID is required"),
	api_key: z.string().min(1, "API Key is required"),
	api_secret: z.string().min(1, "API Secret is required"),
});

export const telegramBotTokenIntegrationSchema = z.object({
	bot_token: z.string().min(1, "Bot Token is required"),
	auth_type: z.literal("botToken").default("botToken"),
});

export const jiraApiTokenIntegrationSchema = z.object({
	base_url: z.string().min(1, "Base url is required").url({ message: "Invalid url" }),
	token: z.string().min(1, "Token is required"),
	email: z.string().email("This is not a valid email.").optional().or(z.literal("")),
});

export const jiraPatIntegrationSchema = z.object({
	base_url: z.string().min(1, "Base url is required").url({ message: "Invalid url" }),
	pat: z.string().min(1, "Personal Access Token is required"),
});

export const confluenceApiTokenIntegrationSchema = z.object({
	base_url: z.string().min(1, "Base url is required").url({ message: "Invalid url" }),
	token: z.string().min(1, "Token is required"),
	email: z.string().email("This is not a valid email.").optional().or(z.literal("")),
});

export const confluencePatIntegrationSchema = z.object({
	base_url: z.string().min(1, "Base url is required").url({ message: "Invalid url" }),
	pat: z.string().min(1, "Personal Access Token is required"),
});

export const discordIntegrationSchema = z.object({
	botToken: z.string().min(1, "Bot token is required"),
});

export const chatgptIntegrationSchema = z.object({});

export const googleGeminiIntegrationSchema = z.object({
	key: z.string().min(1, "API Key is required"),
	auth_type: z.literal(ConnectionAuthType.ApiKey).default(ConnectionAuthType.ApiKey),
});

export const asanaPatIntegrationSchema = z.object({
	pat: z.string().min(1, "PAT is required"),
});

export const asanaOauthIntegrationSchema = z.object({});

export const anthropicIntegrationSchema = z.object({
	api_key: z.string().min(1, "API Key is required"),
	auth_type: z.literal("apiKey").default("apiKey"),
});

export const linearPrivateAuthIntegrationSchema = z.object({
	client_id: z.string().min(1, "Client ID is required"),
	client_secret: z.string().min(1, "Client secret is required"),
	webhook_secret: z.string().optional(),
	actor: selectSchema.refine((value) => value.label, {
		message: "Actor is required",
	}),
	auth_type: z.literal("oauthPrivate").default("oauthPrivate"),
});

export const linearOauthIntegrationSchema = z.object({
	actor: selectSchema.refine((value) => value.label, {
		message: "Actor is required",
	}),
	auth_type: z.literal("oauthDefault").default("oauthDefault"),
});

export const linearApiKeyIntegrationSchema = z.object({
	api_key: z.string().min(1, "Api Key is required"),
	auth_type: z.literal("apiKey").default("apiKey"),
});

export const zoomOauthDefaultIntegrationSchema = z.object({
	auth_type: z.literal("oauthDefault").default("oauthDefault"),
});

export const zoomPrivateAuthIntegrationSchema = z.object({
	client_id: z.string().min(1, "Client ID is required"),
	client_secret: z.string().min(1, "Client Secret is required"),
	secret_token: z.string().optional(),
	auth_type: z.literal("oauthPrivate").default("oauthPrivate"),
});

export const zoomServerToServerIntegrationSchema = z.object({
	account_id: z.string().min(1, "Account ID is required"),
	client_id: z.string().min(1, "Client ID is required"),
	client_secret: z.string().min(1, "Client Secret is required"),
	auth_type: z.literal("serverToServer").default("serverToServer"),
});

export const auth0IntegrationSchema = z.object({
	client_id: z.string().min(1, "Client ID is required"),
	client_secret: z.string().min(1, "Client Secret is required"),
	auth0_domain: z
		.string()
		.min(1, "Domain is required")
		.optional()
		.refine((value) => !value || ValidateDomain(value), {
			message: "Please provide a valid URL, it should be like example.com",
		}),
});

export const salesforceOauthDefaultIntegrationSchema = z.object({
	auth_type: z.literal("oauthDefault").default("oauthDefault"),
});

const salesforceForcedAuth = getSingleAuthTypeIfForced(Integrations.salesforce);
export const salesforcePrivateAuthIntegrationSchema = z.object({
	client_id: z.string().min(1, "Client ID is required"),
	client_secret: z.string().min(1, "Client secret is required"),
	instance_url: z.string().min(1, "Instance URL is required").url({ message: "Invalid url" }),
	...(salesforceForcedAuth === "oauthPrivate"
		? { auth_type: z.literal("oauthPrivate").default("oauthPrivate") }
		: {}),
});

export const microsoftOauthDefaultIntegrationSchema = z.object({
	auth_type: z.literal("oauthDefault").default("oauthDefault"),
});

export const microsoftOauthPrivateIntegrationSchema = z.object({
	client_id: z.string().min(1, "Client ID is required"),
	client_secret: z.string().min(1, "Client Secret is required"),
	auth_type: z.literal("oauthPrivate").default("oauthPrivate"),
});

export const microsoftDaemonAppIntegrationSchema = z.object({
	tenant_id: z.string().min(1, "Tenant ID is required"),
	client_id: z.string().min(1, "Client ID is required"),
	client_secret: z.string().min(1, "Client Secret is required"),
	auth_type: z.literal("daemonApp").default("daemonApp"),
});

export const microsoftTeamsIntegrationSchema = microsoftOauthDefaultIntegrationSchema;

const baseRedditSchema = z.object({
	client_id: z.string().min(1, "Client ID is required"),
	client_secret: z.string().min(1, "Client Secret is required"),
	user_agent: z.string().min(1, "User Agent is required"),
	username: z.string().optional(),
	password: z.string().optional(),
	auth_type: z.literal("oauthPrivate").default("oauthPrivate"),
});

export const redditPrivateAuthIntegrationSchema = baseRedditSchema.superRefine((data, ctx) => {
	const hasUsername = data.username && data.username.trim().length > 0;
	const hasPassword = data.password && data.password.trim().length > 0;
	const errorMessage = "Both username and password are required when using user authentication";
	if (hasUsername !== hasPassword) {
		if (!hasPassword) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: errorMessage,
				path: ["password"],
			});
		}

		if (!hasUsername) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: errorMessage,
				path: ["username"],
			});
		}
	}
});

export const pipedriveIntegrationSchema = z.object({
	api_key: z.string().min(1, "API Key is required"),
	company_domain: z.string().min(1, "Company domain is required").url({ message: "Invalid url" }),
	auth_type: z.literal("apiKey").default("apiKey"),
});
export const notionOauthDefaultIntegrationSchema = z.object({
	auth_type: z.literal("oauthDefault").default("oauthDefault"),
});

const notionForcedAuth = getSingleAuthTypeIfForced(Integrations.notion);
export const notionApiKeyIntegrationSchema = z.object({
	api_key: z.string().min(1, "Internal Integration Secret is required"),
	...(notionForcedAuth === "apiKey" ? { auth_type: z.literal("apiKey").default("apiKey") } : {}),
});

export const legacyOauthSchema = z.object({
	auth_type: z.literal(ConnectionAuthType.Oauth).default(ConnectionAuthType.Oauth),
});

export const genericDefaultOauthSchema = z.object({
	auth_type: z.literal(ConnectionAuthType.OauthDefault).default(ConnectionAuthType.OauthDefault),
});

export const kubernetesIntegrationSchema = z.object({
	config_file: z.string().min(1, "K8s Config File is required"),
});
