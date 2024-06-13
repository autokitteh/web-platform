import { z } from "zod";

export const githubIntegrationSchema = z.object({
	name: z.string().min(5, "Name is required"),
	pat: z.string().min(5, "Personal Access Token is required"),
	webhookSercet: z.string().min(2, "Webhook Secret is required"),
});

export const googleIntegrationSchema = z.object({
	jsonKey: z.string().min(5, "Json Key is required"),
});

export const httpBasicIntegrationSchema = z.object({
	username: z.string().min(2, "Username is required"),
	password: z.string().min(2, "Password is required"),
});
export const httpBearerIntegrationSchema = z.object({
	token: z.string().min(2, "Personal Access Token is required"),
});
