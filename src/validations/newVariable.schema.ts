import { z } from "zod";

export const newVariableShema = z.object({
	name: z.string().min(2, "Name is required"),
	value: z.string().min(2, "Value is required"),
});
