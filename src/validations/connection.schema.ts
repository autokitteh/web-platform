import { z } from "zod";

export const githubIntegrationSchema = z.object({
	pat: z.string().min(1, "Personal Access Token is required"),
	webhook: z.string(),
	secret: z.string(),
});

export const googleIntegrationSchema = z.object({
	json: z.string().min(1, "Json Key is required"),
});

export const connectionSchema = z.object({
	connectionName: z.string().min(1, "Name is required"),
});

export const slackIntegrationSchema = z.object({
	bot_token: z.string().min(1, "Bot Token is required"),
	app_token: z.string().min(1, "App-Level Token is required"),
});

export const selectRegionSchema = z.object({
	label: z.string(),
	value: z.string(),
});
export const awsIntegrationSchema = z.object({
	name: selectRegionSchema.refine((value) => value.label, {
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
	username: z.string().min(1, "Username is required"),
	password: z.string().min(1, "Password is required"),
});
export const httpBearerIntegrationSchema = z.object({
	token: z.string().min(1, "Personal Access Token is required"),
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
	baseUrl: z.string().min(1, "Base url is required"),
	token: z.string().min(1, "Token is required"),
	email: z.string(),
});

export const discordIntegrationSchema = z.object({
	botToken: z.string().min(1, "Bot token is required"),
});

export const oauthSchema = z.object({});
