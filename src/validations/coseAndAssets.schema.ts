import i18n from "i18next";
import { z } from "zod";

const selectExtensionSchema = z.object({
	label: z.string(),
	value: z.string(),
});

export const codeAssetsSchema = z.object({
	name: z.string().min(2, "Name is required"),
	extension: selectExtensionSchema.refine((value) => value.label, {
		message: i18n.t("extensionIsRequired", { ns: "validations" }),
	}),
});
