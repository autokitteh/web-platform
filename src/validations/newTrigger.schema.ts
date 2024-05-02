import i18n from "i18next";
import { z } from "zod";

const selectItemSchema = z.object({
	label: z.string(),
	value: z.string(),
	disabled: z.boolean().optional(),
});

export const newTriggerSchema = z.object({
	connection: selectItemSchema.refine((value) => value.label, {
		message: i18n.t("connectionIsRequired", { ns: "validations" }),
	}),
	filePath: selectItemSchema.refine((value) => value.label, {
		message: i18n.t("fileNameIsRequired", { ns: "validations" }),
	}),
	entryFunction: z.string().min(1, i18n.t("entryFunctionIsRequired", { ns: "validations" })),
	eventType: z.string().min(1, i18n.t("eventTypeIsRequired", { ns: "validations" })),
	filter: z.string(),
});
