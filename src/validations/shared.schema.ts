import { z } from "zod";

export const selectSchema = z.object({
	label: z.string(),
	value: z.string(),
});

export const optionalSelectSchema = z
	.object({
		label: z.string().optional(),
		value: z.string().optional(),
	})
	.nullish();
