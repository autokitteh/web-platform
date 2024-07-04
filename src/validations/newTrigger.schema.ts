import i18n from "i18next";
import { ZodObject, ZodTypeAny, z } from "zod";

const selectItemSchema = z.object({
	disabled: z.boolean().optional(),
	label: z.string(),
	value: z.string(),
});

let defaultTriggerSchema: ZodObject<Record<string, ZodTypeAny>>;
let schedulerTriggerSchema: ZodObject<Record<string, ZodTypeAny>>;

i18n.on("initialized", () => {
	defaultTriggerSchema = z.object({
		connection: selectItemSchema.refine((value) => value.label, {
			message: i18n.t("connectionIsRequired", { ns: "validations" }),
		}),
		entryFunction: z.string().min(1, i18n.t("functionNameIsRequired", { ns: "validations" })),
		eventType: z.string(),
		filePath: selectItemSchema.refine((value) => value.label, {
			message: i18n.t("fileNameIsRequired", { ns: "validations" }),
		}),
		filter: z.string(),
		name: z.string().min(1, i18n.t("nameIsRequired", { ns: "validations" })),
	});

	schedulerTriggerSchema = z.object({
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
		entryFunction: z.string().min(1, i18n.t("functionNameIsRequired", { ns: "validations" })),
		filePath: selectItemSchema.refine((value) => value.label, {
			message: i18n.t("fileNameIsRequired", { ns: "validations" }),
		}),
		name: z.string().min(1, i18n.t("nameIsRequired", { ns: "validations" })),
	});
});

export { defaultTriggerSchema, schedulerTriggerSchema };
