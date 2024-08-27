import { z } from "zod";

import { secretString } from "@src/constants/forms";

const validateNotSecretString = (message = "This value is not allowed") =>
	z.string().refine((value) => value !== secretString, { message });

export const githubIntegrationSchema = z.object({
	pat: z.string().min(1, "Personal Access Token is required").and(validateNotSecretString()),
	webhook: z.string().and(validateNotSecretString()),
	secret: z.string().and(validateNotSecretString()),
});

export const googleIntegrationSchema = z.object({
	json: z.string().min(1, "Json Key is required"),
	auth_type: z.string(),
});

export const connectionSchema = z.object({
	connectionName: z.string().min(1, "Name is required"),
});

export const slackIntegrationSchema = z.object({
	bot_token: z.string().min(1, "Bot Token is required").and(validateNotSecretString()),
	app_token: z.string().min(1, "App-Level Token is required").and(validateNotSecretString()),
});

export const selectRegionSchema = z.object({
	label: z.string(),
	value: z.string(),
});
export const awsIntegrationSchema = z.object({
	region: selectRegionSchema.refine((value) => value.label, {
		message: "Region is required",
	}),
	access_key: z.string().min(1, "Access Key is required").and(validateNotSecretString()),
	secret_key: z.string().min(1, "Secret Key is required").and(validateNotSecretString()),
	token: z.string().min(1, "Token is required").and(validateNotSecretString()),
});

export const openAiIntegrationSchema = z.object({
	key: z.string().min(1, "Key is required").and(validateNotSecretString()),
});

export const httpBasicIntegrationSchema = z.object({
	basic_username: z.string().min(1, "Username is required").and(validateNotSecretString()),
	basic_password: z.string().min(1, "Password is required").and(validateNotSecretString()),
});
export const httpBearerIntegrationSchema = z.object({
	bearer_access_token: z.string().min(1, "Personal Access Token is required").and(validateNotSecretString()),
});

export const twilioTokenIntegrationSchema = z.object({
	account_sid: z.string().min(1, "Account SID is required").and(validateNotSecretString()),
	auth_token: z.string().min(1, "Auth Token is required").and(validateNotSecretString()),
});
export const twilioApiKeyIntegrationSchema = z.object({
	account_sid: z.string().min(1, "Account SID is required").and(validateNotSecretString()),
	api_key: z.string().min(1, "API Key is required").and(validateNotSecretString()),
	api_secret: z.string().min(1, "API Secret is required").and(validateNotSecretString()),
});

export const jiraIntegrationSchema = z.object({
	base_url: z.string().min(1, "Base url is required").url({ message: "Invalid url" }).and(validateNotSecretString()),
	token: z.string().min(1, "Token is required").and(validateNotSecretString()),
	email: z.string().email("This is not a valid email.").optional().or(z.literal("")),
});

export const discordIntegrationSchema = z.object({
	botToken: z.string().min(1, "Bot token is required").and(validateNotSecretString()),
});

export const googleGeminiIntegrationSchema = z.object({
	key: z.string().min(1, "Key is required").and(validateNotSecretString()),
});

export const oauthSchema = z.object({});
export const googleOauthSchema = z.object({
	auth_type: z.string(),
	auth_scopes: z.string(),
});
