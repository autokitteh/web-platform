import { z } from "zod";

export const githubIntegrationSchema = z.object({
	pat: z.string().min(5, "Personal Access Token is required"),
	name: z.string().min(5, "Personal Access Token is required"),
	webhookSercet: z.string().min(2, "Webhook Secret is required"),
});

export const googleIntegrationSchema = z.object({
	jsonKey: z.string().min(5, "Json Key is required"),
});
