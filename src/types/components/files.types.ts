import { z } from "zod";

import { renameFileSchema, directorySchema } from "@validations/files.schema";

export type RenameFileFormData = z.infer<typeof renameFileSchema>;

export type DirectoryFormData = z.infer<typeof directorySchema>;
