import { z } from "zod";

const selectSchema = z.object({
	label: z.string(),
	value: z.string(),
	disabled: z.boolean().optional(),
});

export const newTriggerSchema = z.object({
	connectionApp: selectSchema.array().min(1, "Select application").default([]),
	fileName: z.string().min(1, "File Name is required"),
	entrypoint: z.string().min(1, "Entry Point is required"),
	eventType: z.string().min(1, "Event Type is required"),
});
