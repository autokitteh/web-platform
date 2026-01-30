import i18n, { t } from "i18next";
import { z } from "zod";

import { Integrations } from "@src/enums/components";
import { ConnectionAuthType } from "@src/enums/connections/connectionTypes.enum";
import { ValidateDomain } from "@src/utilities";
import { getSingleAuthTypeIfForced } from "@src/utilities/forceAuthType.utils";
import { selectSchema } from "@src/validations/shared.schema";

export const githubIntegrationSchema = z.object({
	pat: z.string().min(1, "Personal Access Token is required"),
	webhook: z.string(),
	secret: z.string(),
	auth_type: z.literal(ConnectionAuthType.Pat).default(ConnectionAuthType.Pat),
});

export const githubPrivateAuthIntegrationSchema = z.object({
	client_id: z.string().min(1, "Client ID is required"),
	client_secret: z.string().min(1, "Client Secret is required"),
	app_id: z.string().min(1, "App ID is required"),
	app_name: z.string().min(1, "App Name is required"),
	webhook_secret: z.string(),
	private_key: z.string().min(1, "Private Key is required"),
	auth_type: z.literal(ConnectionAuthType.OauthPrivate).default(ConnectionAuthType.OauthPrivate),
});

export const googleOauthSchema = z.object({
	auth_scopes: z.union([
		z.literal(Integrations.gmail),
		z.literal(Integrations.calendar),
		z.literal(Integrations.forms),
		z.literal(Integrations.sheets),
		z.literal(Integrations.drive),
		z.literal(Integrations.youtube),
	]),
	auth_type: z.literal(ConnectionAuthType.Oauth).default(ConnectionAuthType.Oauth),
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
	json: z.string().min(1, "Json Key is required").optional(),
	cal_id: z.string().optional(),
	auth_scopes: z.literal(Integrations.calendar).default(Integrations.calendar),
	auth_type: z
		.literal(ConnectionAuthType.Json)
		.or(z.literal(ConnectionAuthType.Oauth))
		.default(ConnectionAuthType.Oauth),
});

export const googleFormsIntegrationSchema = z.object({
	json: z.string().min(1, "Json Key is required").optional(),
	form_id: z.string().optional(),
	auth_scopes: z.literal(Integrations.forms).default(Integrations.forms),
	auth_type: z
		.literal(ConnectionAuthType.Json)
		.or(z.literal(ConnectionAuthType.Oauth))
		.default(ConnectionAuthType.Oauth),
});

export const connectionSchema = z.object({
	connectionName: z.string().min(1, "Name is required"),
});

export const slackIntegrationSchema = z.object({
	bot_token: z.string().min(1, "Bot Token is required"),
	app_token: z.string().min(1, "App-Level Token is required"),
	auth_type: z.literal(ConnectionAuthType.Socket).default(ConnectionAuthType.Socket),
});

export const slackPrivateAuthIntegrationSchema = z.object({
	client_id: z.string().min(1, "Client ID is required"),
	client_secret: z.string().min(1, "Client Secret is required"),
	signing_secret: z.string().min(1, "Signing Secret is required"),
	auth_type: z.literal(ConnectionAuthType.OauthPrivate).default(ConnectionAuthType.OauthPrivate),
});

export const awsIntegrationSchema = z.object({
	region: selectSchema.refine((value) => value.label, {
		message: "Region is required",
	}),
	access_key: z.string().min(1, "Access Key is required"),
	secret_key: z.string().min(1, "Secret Key is required"),
	token: z.string().min(1, "Token is required"),
	auth_type: z.literal(ConnectionAuthType.AWSConfig).default(ConnectionAuthType.AWSConfig),
});

export const openAiIntegrationSchema = z.object({
	key: z.string().min(1, "Key is required"),
	auth_type: z.literal(ConnectionAuthType.Key).default(ConnectionAuthType.Key),
});

export const twilioTokenIntegrationSchema = z.object({
	account_sid: z.string().min(1, "Account SID is required"),
	auth_token: z.string().min(1, "Auth Token is required"),
	auth_type: z.literal(ConnectionAuthType.AuthToken).default(ConnectionAuthType.AuthToken),
});
export const twilioApiKeyIntegrationSchema = z.object({
	account_sid: z.string().min(1, "Account SID is required"),
	api_key: z.string().min(1, "API Key is required"),
	api_secret: z.string().min(1, "API Secret is required"),
	auth_type: z.literal(ConnectionAuthType.ApiKey).default(ConnectionAuthType.ApiKey),
});

export const telegramBotTokenIntegrationSchema = z.object({
	bot_token: z.string().min(1, "Bot Token is required"),
	auth_type: z.literal(ConnectionAuthType.BotToken).default(ConnectionAuthType.BotToken),
});

export const jiraIntegrationSchema = z.object({
	base_url: z.string().min(1, "Base url is required").url({ message: "Invalid url" }),
	token: z.string().min(1, "Token is required"),
	email: z.string().email("This is not a valid email.").optional().or(z.literal("")),
	auth_type: z.literal(ConnectionAuthType.ApiToken).default(ConnectionAuthType.ApiToken),
});

export const confluenceIntegrationSchema = z.object({
	base_url: z.string().min(1, "Base url is required").url({ message: "Invalid url" }),
	token: z.string().min(1, "Token is required"),
	email: z.string().email("This is not a valid email.").optional().or(z.literal("")),
	auth_type: z.literal(ConnectionAuthType.ApiToken).default(ConnectionAuthType.ApiToken),
});

export const discordIntegrationSchema = z.object({
	botToken: z.string().min(1, "Bot token is required"),
	auth_type: z.literal(ConnectionAuthType.BotToken).default(ConnectionAuthType.BotToken),
});

export const googleGeminiIntegrationSchema = z.object({
	key: z.string().min(1, "API Key is required"),
	auth_type: z.literal(ConnectionAuthType.ApiKey).default(ConnectionAuthType.ApiKey),
});

export const asanaIntegrationSchema = z.object({
	pat: z.string().min(1, "PAT is required"),
	auth_type: z.literal(ConnectionAuthType.Pat).default(ConnectionAuthType.Pat),
});

export const anthropicIntegrationSchema = z.object({
	api_key: z.string().min(1, "API Key is required"),
	auth_type: z.literal(ConnectionAuthType.ApiKey).default(ConnectionAuthType.ApiKey),
});

export const pydanticgwIntegrationSchema = z.object({
	api_key: z.string().min(1, "API Key is required"),
	auth_type: z.literal(ConnectionAuthType.ApiKey).default(ConnectionAuthType.ApiKey),
});

export const linearPrivateAuthIntegrationSchema = z.object({
	client_id: z.string().min(1, "Client ID is required"),
	client_secret: z.string().min(1, "Client secret is required"),
	webhook_secret: z.string().optional(),
	actor: selectSchema.refine((value) => value.label, {
		message: "Actor is required",
	}),
	auth_type: z.literal(ConnectionAuthType.OauthPrivate).default(ConnectionAuthType.OauthPrivate),
});

export const linearOauthIntegrationSchema = z.object({
	actor: selectSchema.refine((value) => value.label, {
		message: "Actor is required",
	}),
	auth_type: z.literal(ConnectionAuthType.OauthDefault).default(ConnectionAuthType.OauthDefault),
});
export const linearApiKeyIntegrationSchema = z.object({
	api_key: z.string().min(1, "Api Key is required"),
	auth_type: z.literal(ConnectionAuthType.ApiKey).default(ConnectionAuthType.ApiKey),
});

export const zoomPrivateAuthIntegrationSchema = z.object({
	client_id: z.string().min(1, "Client ID is required"),
	client_secret: z.string().min(1, "Client Secret is required"),
	secret_token: z.string().optional(),
	auth_type: z.literal(ConnectionAuthType.OauthPrivate).default(ConnectionAuthType.OauthPrivate),
});
export const zoomServerToServerIntegrationSchema = z.object({
	account_id: z.string().min(1, "Account ID is required"),
	client_id: z.string().min(1, "Client ID is required"),
	client_secret: z.string().min(1, "Client Secret is required"),
	auth_type: z.literal(ConnectionAuthType.serverToServer).default(ConnectionAuthType.serverToServer),
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
	auth_type: z.literal(ConnectionAuthType.Oauth).default(ConnectionAuthType.Oauth),
});

const salesforceForcedAuth = getSingleAuthTypeIfForced(Integrations.salesforce);
export const salesforcePrivateAuthIntegrationSchema = z.object({
	client_id: z.string().min(1, "Client ID is required"),
	client_secret: z.string().min(1, "Client secret is required"),
	...(salesforceForcedAuth ? { auth_type: z.literal(salesforceForcedAuth).default(salesforceForcedAuth) } : {}),
});

export const microsoftTeamsIntegrationSchema = z.object({
	client_id: z.string().min(1, "Client ID is required"),
	client_secret: z.string().min(1, "Client Secret is required"),
	tenant_id: z.string().min(1, "Tenant ID is required"),
	auth_type: z.literal(ConnectionAuthType.OauthDefault).default(ConnectionAuthType.OauthDefault),
});

const baseRedditSchema = z.object({
	client_id: z.string().min(1, "Client ID is required"),
	client_secret: z.string().min(1, "Client Secret is required"),
	user_agent: z.string().min(1, "User Agent is required"),
	username: z.string().optional(),
	password: z.string().optional(),
	auth_type: z.literal(ConnectionAuthType.OauthPrivate).default(ConnectionAuthType.OauthPrivate),
});

const createRedditSchemaWithValidation = (errorMessage: string) =>
	baseRedditSchema.superRefine((data, ctx) => {
		const hasUsername = data.username && data.username.trim().length > 0;
		const hasPassword = data.password && data.password.trim().length > 0;

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

const fallbackRedditSchema = createRedditSchemaWithValidation(
	"Both username and password are required when using user authentication"
);

let redditPrivateAuthIntegrationSchema = fallbackRedditSchema;

i18n.on("initialized", () => {
	redditPrivateAuthIntegrationSchema = createRedditSchemaWithValidation(
		t("reddit.errors.usernamePasswordRequired", { ns: "integrations" })
	);
});

export { redditPrivateAuthIntegrationSchema };

export const pipedriveIntegrationSchema = z.object({
	api_key: z.string().min(1, "API Key is required"),
	company_domain: z.string().min(1, "Company domain is required").url({ message: "Invalid url" }),
	auth_type: z.literal(ConnectionAuthType.ApiKey).default(ConnectionAuthType.ApiKey),
});
const notionForcedAuth = getSingleAuthTypeIfForced(Integrations.notion);
export const notionApiKeyIntegrationSchema = z.object({
	api_key: z.string().min(1, "Internal Integration Secret is required"),
	...(notionForcedAuth ? { auth_type: z.literal(notionForcedAuth).default(notionForcedAuth) } : {}),
});

export const legacyOauthSchema = z.object({
	auth_type: z.literal(ConnectionAuthType.Oauth).default(ConnectionAuthType.Oauth),
});

export const genericDefaultOauthSchema = z.object({
	auth_type: z.literal(ConnectionAuthType.OauthDefault).default(ConnectionAuthType.OauthDefault),
});

export const kubernetesIntegrationSchema = z.object({
	config_file: z.string().min(1, "K8s Config File is required"),
	auth_type: z.literal(ConnectionAuthType.JsonKey).default(ConnectionAuthType.JsonKey),
});
