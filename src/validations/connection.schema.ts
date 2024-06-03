import { z } from "zod";

export const integrationGithubSchema = z.object({
	pat: z.string().min(5, "Personal Access Token is required"),
	webhookSercet: z.string().min(2, "Webhook Secret is required"),
});
