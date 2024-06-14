import { z } from "zod";

export const githubIntegrationSchema = z.object({
	name: z.string().min(5, "Name is required"),
	pat: z.string().min(5, "Personal Access Token is required"),
	webhookSercet: z.string().min(2, "Webhook Secret is required"),
});

export const googleIntegrationSchema = z.object({
	jsonKey: z.string().min(5, "Json Key is required"),
});

export const twilioTokenIntegrationSchema = z.object({
	sid: z.string().min(5, "Account SID is required"),
	token: z.string().min(5, "Auth Token is required"),
});

export const twilioApiKeyIntegrationSchema = z.object({
	sid: z.string().min(5, "Account SID is required"),
	key: z.string().min(5, "API Key is required"),
	secret: z.string().min(5, "API Secret is required"),
});
