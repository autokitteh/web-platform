import i18n, { t } from "i18next";
import { z } from "zod";

const fallbackSchema = z.object({
	description: z.string().optional(),
	isSecret: z.boolean().optional(),
	name: z.string().min(1, "Name is required"),
	value: z.string().min(1, "Value is required"),
});

export let newVariableShema = fallbackSchema;

i18n.on("initialized", () => {
	newVariableShema = z.object({
		description: z.string().optional(),
		isSecret: z.boolean().optional(),
		name: z.string().min(1, t("variables.nameIsRequired", { ns: "validations" })),
		value: z.string().min(1, t("variables.valueIsRequired", { ns: "validations" })),
	});
});
