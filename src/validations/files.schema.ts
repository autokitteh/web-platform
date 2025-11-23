import { z } from "zod";

import { hasInvalidCharacters } from "@utilities/files.utils";

export const renameFileSchema = z.object({
	name: z.string().min(1, "File name is required"),
});

export const directorySchema = z.object({
	name: z
		.string()
		.min(1, "Directory name is required")
		.refine((name) => !hasInvalidCharacters(name), "Directory name contains invalid characters")
		.refine((name) => !name.startsWith("."), "Directory name cannot start with a dot")
		.refine((name) => name.trim() === name, "Directory name cannot have leading or trailing spaces"),
});
