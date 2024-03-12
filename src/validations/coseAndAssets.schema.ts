import { z } from "zod";

export const codeAssetsSchema = z.object({
	name: z.string().min(2, "Name is required"),
});
