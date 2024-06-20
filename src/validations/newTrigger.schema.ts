import i18n from "i18next";
import { z, ZodObject, ZodTypeAny } from "zod";

const selectItemSchema = z.object({
	label: z.string(),
	value: z.string(),
	disabled: z.boolean().optional(),
});

let defaultTriggerSchema: ZodObject<Record<string, ZodTypeAny>>;
let schedulerTriggerSchema: ZodObject<Record<string, ZodTypeAny>>;

i18n.on("initialized", () => {
	defaultTriggerSchema = z.object({
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

	schedulerTriggerSchema = z.object({
		name: z.string().min(1, i18n.t("triggerNameIsRequired", { ns: "validations" })),
		cron: z
			.string()
			.regex(
				new RegExp(
					"^(@(?:yearly|annually|monthly|weekly|daily|midnight|hourly)" +
						"|@every\\ +(?:\\d+[dhms])+" +
						"|(?:(?:(?:\\d+,)*\\d+|\\d+[/-]\\d+|\\*(?:\\/\\d+)?|\\?)\\ +){4,5}" +
						"(?:(?:\\d+,)*\\d+|\\d+[/-]\\d+|\\*(?:\\/\\d+)?|\\?|(?:[a-zA-Z]{3}-)?[a-zA-Z]{3})" +
						"(?:[ \\d]+)?" +
						")$"
				),
				{ message: i18n.t("cronExpressionsFormat", { ns: "validations" }) }
			),
		filePath: selectItemSchema.refine((value) => value.label, {
			message: i18n.t("fileNameIsRequired", { ns: "validations" }),
		}),
		entryFunction: z.string().min(1, i18n.t("functionNameIsRequired", { ns: "validations" })),
	});
});

export { defaultTriggerSchema, schedulerTriggerSchema };
