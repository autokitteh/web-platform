import { z } from "zod";

const selectItemSchema = z.object({
	label: z.string(),
	value: z.string(),
	disabled: z.boolean().optional(),
});

export const newTriggerSchema = z.object({
	connection: selectItemSchema.refine((value) => value.label, {
		message: "Connection is required",
	}),
	filePath: selectItemSchema.refine((value) => value.label, {
		message: "File name is required",
	}),
	entryPoint: z.string().min(1, "Entry point is required"),
	eventType: z.string().min(1, "Event type is required"),
});
