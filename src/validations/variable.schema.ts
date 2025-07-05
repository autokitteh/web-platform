import i18n, { t } from "i18next";
import { z } from "zod";

const fallbackSchema = z.object({
	name: z.string().min(1, "Name is required"),
	value: z.string().min(1, "Value is required"),
	isSecret: z.boolean().optional(),
});

export let newVariableShema: z.ZodSchema = fallbackSchema;

i18n.on("initialized", () => {
	newVariableShema = z.object({
		name: z.string().min(1, t("variables.nameIsRequired", { ns: "validations" })),
		value: z.string().min(1, t("variables.valueIsRequired", { ns: "validations" })),
		isSecret: z.boolean().optional(),
	});
});
