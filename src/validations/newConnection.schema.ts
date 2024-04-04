import { z } from "zod";

const selectItemSchema = z.object({
	label: z.string(),
	value: z.string(),
	disabled: z.boolean().optional(),
});

export const newConnectionSchema = z.object({
	connectionApp: selectItemSchema.refine((value) => value.label, {
		message: "Connection app is required",
	}),
	userName: z.string().min(1, "User Name is required"),
	password: z.string().min(1, "Password is required"),
	connectionName: z.string().min(1, "Connection name is required"),
});
