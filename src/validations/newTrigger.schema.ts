import { z } from "zod";

const selectSchema = z.object({
	label: z.string(),
	value: z.string(),
	disabled: z.boolean().optional(),
});

export const newTriggerSchema = z.object({
	connection: selectSchema.array().min(1, "Select connection").default([]),
	name: selectSchema.array().min(1, "Select name").default([]),
	path: z.string().min(1, "Entry Point is required"),
	eventType: z.string().min(1, "Event Type is required"),
});
