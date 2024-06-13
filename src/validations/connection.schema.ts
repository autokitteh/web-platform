import { z } from "zod";

export const githubIntegrationSchema = z.object({
	name: z.string().min(5, "Name is required"),
	pat: z.string().min(5, "Personal Access Token is required"),
	webhookSercet: z.string().min(2, "Webhook Secret is required"),
});

export const googleIntegrationSchema = z.object({
	jsonKey: z.string().min(5, "Json Key is required"),
});

export const selectRegionSchema = z.object({
	label: z.string(),
	value: z.string(),
});

export const awsIntegrationSchema = z.object({
	region: selectRegionSchema.refine((value) => value.label, {
		message: "Region is required",
	}),
	accessKey: z.string().min(3, "Access Key is required"),
	secretKey: z.string().min(3, "Secret Key is required"),
	token: z.string().min(3, "Token is required"),
});
