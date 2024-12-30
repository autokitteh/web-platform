import { z } from "zod";

export const selectSchema = z.object({
	label: z.string(),
	value: z.string(),
});
