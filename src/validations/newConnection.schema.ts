import { z } from "zod";

const selectSchema = z.object({
	label: z.string(),
	value: z.string(),
	disabled: z.boolean().optional(),
});

export const newConnectionSchema = z.object({
	connectionType: selectSchema.array().min(1, "Select application").default([]),
	userName: z.string().min(1, "User Name is required"),
	password: z.string().min(1, "Password is required"),
	connectionName: z.string().min(1, "Connection name is required"),
});
