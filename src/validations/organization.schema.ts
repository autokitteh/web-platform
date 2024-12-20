import { z } from "zod";

const selectSchema = z.object({
	label: z.string(),
	value: z.string(),
});

export const newOrganizationSchema = z.object({
	orgName: z.string().min(1, "Organization name is required"),
	displayName: z.string().min(1, "Display name is required"),
});

export const newOrganizationUserSchema = z.object({
	name: z.string().min(1, "Name is required"),
	email: z.string().email("Invalid email").min(1, "Email is required"),
	role: selectSchema.optional(),
});
