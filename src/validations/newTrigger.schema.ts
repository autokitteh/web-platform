import i18n from "i18next";
import { z, ZodObject, ZodTypeAny } from "zod";

const selectItemSchema = z.object({
	label: z.string(),
	value: z.string(),
	disabled: z.boolean().optional(),
});

let triggerSchema: ZodObject<Record<string, ZodTypeAny>>;

i18n.on("initialized", () => {
	triggerSchema = z.object({
		name: z.string().min(1, i18n.t("triggerNameIsRequired", { ns: "validations" })),
		connection: selectItemSchema.refine((value) => value.label, {
			message: i18n.t("connectionIsRequired", { ns: "validations" }),
		}),
		filePath: selectItemSchema.refine((value) => value.label, {
			message: i18n.t("fileNameIsRequired", { ns: "validations" }),
		}),
		entryFunction: z.string().min(1, i18n.t("functionNameIsRequired", { ns: "validations" })),
		eventType: z.string(),
		filter: z.string(),
	});
});

export { triggerSchema };
