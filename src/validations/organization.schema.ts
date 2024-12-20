import { z } from "zod";

const selectSchema = z.object({
	label: z.string(),
	value: z.string(),
});

export const newOrganizationSchema = z.object({
	orgName: z.string().min(1, "Organization name is required"),
	displayName: z.string().min(1, "Display name is required"),
});

export const organizationSchema = z.object({
	orgName: z.string().min(1, "Organization name is required"),
	displayName: z.string(),
	noteEmail: z.string().email("Invalid email").or(z.literal("")),
	frequency: selectSchema.optional(),
});
