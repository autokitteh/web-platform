import { z } from "zod";

import { selectSchema } from "@validations";

export const addOrganizationSchema = z.object({
	name: z.string().min(1, "Organization name is required"),
});

export const addOrganizationMemberSchema = z.object({
	email: z.string().email("Invalid email").min(1, "Email is required"),
});

export const organizationSchema = z.object({
	name: z.string().min(1, "Organization name is required"),
	noteEmail: z.string().email("Invalid email").or(z.literal("")),
	frequency: selectSchema.optional(),
});
