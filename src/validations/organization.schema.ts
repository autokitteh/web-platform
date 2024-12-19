import { z } from "zod";

export const newOrganizationSchema = z.object({
	orgName: z.string().min(1, "Organization name is required"),
	displayName: z.string().min(1, "Display name is required"),
});
