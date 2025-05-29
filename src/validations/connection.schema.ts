import { z } from "zod";

import { ValidateDomain } from "@src/utilities";
import { selectSchema } from "@src/validations/shared.schema";

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

export const googleIntegrationSchema = z.object({
	json: z.string().min(1, "Json Key is required"),
	auth_type: z.string(),
});

export const googleCalendarIntegrationSchema = z.object({
	json: z.string().min(1, "Json Key is required"),
	cal_id: z.string().optional(),
	auth_type: z.string(),
});

export const googleFormsIntegrationSchema = z.object({
	json: z.string().min(1, "Json Key is required"),
	form_id: z.string().optional(),
	auth_type: z.string(),
});

export const connectionSchema = z.object({
	connectionName: z.string().min(1, "Name is required"),
});

export const slackIntegrationSchema = z.object({
	bot_token: z.string().min(1, "Bot Token is required"),
	app_token: z.string().min(1, "App-Level Token is required"),
});

export const slackPrivateAuthIntegrationSchema = z.object({
	client_id: z.string().min(1, "Client ID is required"),
	client_secret: z.string().min(1, "Client Secret is required"),
	signing_secret: z.string().min(1, "Signing Secret is required"),
});

export const awsIntegrationSchema = z.object({
	region: selectSchema.refine((value) => value.label, {
		message: "Region is required",
	}),
	access_key: z.string().min(1, "Access Key is required"),
	secret_key: z.string().min(1, "Secret Key is required"),
	token: z.string().min(1, "Token is required"),
});

export const openAiIntegrationSchema = z.object({
	key: z.string().min(1, "Key is required"),
});

export const httpBasicIntegrationSchema = z.object({
	basic_username: z.string().min(1, "Username is required"),
	basic_password: z.string().min(1, "Password is required"),
});
export const httpBearerIntegrationSchema = z.object({
	bearer_access_token: z.string().min(1, "Personal Access Token is required"),
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

export const jiraIntegrationSchema = z.object({
	base_url: z.string().min(1, "Base url is required").url({ message: "Invalid url" }),
	token: z.string().min(1, "Token is required"),
	email: z.string().email("This is not a valid email.").optional().or(z.literal("")),
});

export const confluenceIntegrationSchema = z.object({
	base_url: z.string().min(1, "Base url is required").url({ message: "Invalid url" }),
	token: z.string().min(1, "Token is required"),
	email: z.string().email("This is not a valid email.").optional().or(z.literal("")),
});

export const discordIntegrationSchema = z.object({
	botToken: z.string().min(1, "Bot token is required"),
});

export const googleGeminiIntegrationSchema = z.object({
	key: z.string().min(1, "Key is required"),
});

export const asanaIntegrationSchema = z.object({
	pat: z.string().min(1, "PAT is required"),
});

export const heightPrivateAuthIntegrationSchema = z.object({
	client_id: z.string().min(1, "Cliend ID is required"),
	client_secret: z.string().min(1, "Cliend secret is required"),
});
export const heightApiKeyIntegrationSchema = z.object({
	api_key: z.string().min(1, "Api Key is required"),
});

export const linearPrivateAuthIntegrationSchema = z.object({
	client_id: z.string().min(1, "Cliend ID is required"),
	client_secret: z.string().min(1, "Cliend secret is required"),
	webhook_secret: z.string().optional(),
	actor: selectSchema.refine((value) => value.label, {
		message: "Actor is required",
	}),
});

export const linearOauthIntegrationSchema = z.object({
	actor: selectSchema.refine((value) => value.label, {
		message: "Actor is required",
	}),
});
export const linearApiKeyIntegrationSchema = z.object({
	api_key: z.string().min(1, "Api Key is required"),
});

export const zoomPrivateAuthIntegrationSchema = z.object({
	client_id: z.string().min(1, "Client ID is required"),
	client_secret: z.string().min(1, "Client ID is required"),
	secret_token: z.string().optional(),
});
export const zoomServerToServerIntegrationSchema = z.object({
	account_id: z.string().min(1, "Account ID is required"),
	client_id: z.string().min(1, "Client ID is required"),
	client_secret: z.string().min(1, "Client ID is required"),
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

export const salesforcePrivateAuthIntegrationSchema = z.object({
	client_id: z.string().min(1, "Cliend ID is required"),
	client_secret: z.string().min(1, "Cliend secret is required"),
});

export const microsoftTeamsIntegrationSchema = z.object({
	client_id: z.string().min(1, "Client ID is required"),
	client_secret: z.string().min(1, "Client Secret is required"),
	tenant_id: z.string().min(1, "Tenant ID is required"),
});

export const telegramIntegrationSchema = z.object({
	bot_token: z
		.string()
		.min(1, "Bot token is required")
		.regex(/^\d+:[a-zA-Z0-9_-]{30,}$/, {
			message: "Invalid Telegram bot token format",
		}),
});

export const oauthSchema = z.object({});
