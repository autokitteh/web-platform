import { z } from "zod";

const selectItemSchema = z.object({
	label: z.string(),
	value: z.string(),
	disabled: z.boolean().optional(),
});

export const connectionSchema = z.object({
	connectionApp: selectItemSchema.refine((value) => value.label, {
		message: "Connection is required",
	}),
});
export const integrationGithubSchema = z.object({
	pat: z.string().min(5, "Personal Access Token is required"),
	webhookSercet: z.string().min(2, "Webhook Secret is required"),
});
