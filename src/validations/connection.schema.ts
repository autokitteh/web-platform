import { z } from "zod";

export const githubIntegrationSchema = z.object({
	pat: z.string().min(5, "Personal Access Token is required"),
	webhookSercet: z.string().min(2, "Webhook Secret is required"),
});

export const googleIntegrationSchema = z.object({
	jsonKey: z.string().min(5, "Json Key is required"),
});

export const connectionSchema = z.object({
	connectionName: z.string().min(5, "Name is required"),
});

export const slackIntegrationSchema = z.object({
	botToken: z.string().min(5, "Bot Token is required"),
	appToken: z.string().min(5, "App-Level Token is required"),
});

export const selectRegionSchema = z.object({
	label: z.string(),
	value: z.string(),
});
export const awsIntegrationSchema = z.object({
	region: selectRegionSchema.refine((value) => value.label, {
		message: "Region is required",
	}),
	accessKey: z.string().min(1, "Access Key is required"),
	secretKey: z.string().min(1, "Secret Key is required"),
	token: z.string().min(1, "Token is required"),
});

export const openAiIntegrationSchema = z.object({
	key: z.string().min(5, "Key is required"),
});

export const httpBasicIntegrationSchema = z.object({
	username: z.string().min(1, "Username is required"),
	password: z.string().min(1, "Password is required"),
});
export const httpBearerIntegrationSchema = z.object({
	token: z.string().min(1, "Personal Access Token is required"),
});

export const twilioTokenIntegrationSchema = z.object({
	sid: z.string().min(1, "Account SID is required"),
	token: z.string().min(1, "Auth Token is required"),
});
export const twilioApiKeyIntegrationSchema = z.object({
	sid: z.string().min(1, "Account SID is required"),
	key: z.string().min(1, "API Key is required"),
	secret: z.string().min(1, "API Secret is required"),
});

export const jiraIntegrationSchema = z.object({
	baseUrl: z.string().min(1, "Base url is required"),
	token: z.string().min(1, "Token is required"),
	email: z.string(),
});

export const discordIntegrationSchema = z.object({
	botToken: z.string().min(1, "Bot token is required"),
});
