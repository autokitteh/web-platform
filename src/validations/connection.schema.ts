import { z } from "zod";

export const githubIntegrationSchema = z.object({
	name: z.string().min(5, "Name is required"),
	pat: z.string().min(5, "Personal Access Token is required"),
	webhookSercet: z.string().min(2, "Webhook Secret is required"),
});

export const googleIntegrationSchema = z.object({
	jsonKey: z.string().min(5, "Json Key is required"),
});

export const chatGPTIntegrationSchema = z.object({
	key: z.string().min(5, "Key is required"),
});
