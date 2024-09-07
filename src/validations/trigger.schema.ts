import i18n from "i18next";
import { Resolver } from "react-hook-form";
import { ZodObject, ZodTypeAny, z } from "zod";

import { TriggerTypes } from "@src/enums";

const selectItemSchema = z.object({
	label: z.string(),
	value: z.string(),
});

export let triggerSchema: ZodObject<Record<string, ZodTypeAny>>;

const cronFormat =
	"^(@(?:yearly|annually|monthly|weekly|daily|midnight|hourly)" +
	"|@every\\ +(?:\\d+[dhms])+" +
	"|(?:(?:(?:\\d+,)*\\d+|\\d+[/-]\\d+|\\*(?:\\/\\d+)?|\\?)\\ +){4,5}" +
	"(?:(?:\\d+,)*\\d+|\\d+[/-]\\d+|\\*(?:\\/\\d+)?|\\?|(?:[a-zA-Z]{3}-)?[a-zA-Z]{3})" +
	"(?:[ \\d]+)?" +
	")$";

i18n.on("initialized", () => {
	triggerSchema = z.object({
		name: z.string().min(1, i18n.t("triggers.form.validations.nameRequired", { ns: "tabs" })),
		connection: selectItemSchema.refine((value) => value.label, {
			message: i18n.t("triggers.form.validations.connectionRequired", { ns: "tabs" }),
		}),
		filePath: selectItemSchema.refine((value) => value.label, {
			message: i18n.t("triggers.form.validations.fileRequired", { ns: "tabs" }),
		}),
		entryFunction: z.string().min(1, i18n.t("triggers.form.validations.functionRequired", { ns: "tabs" })),
		eventType: z.string().optional(),
		filter: z.string().optional(),
		cron: z.string().optional(),
	});
});

export type TriggerFormData = z.infer<typeof triggerSchema>;
export const triggerResolver: Resolver<TriggerFormData> = async (values) => {
	try {
		const validatedData = await triggerSchema.parseAsync(values);

		if (validatedData.connection.value === TriggerTypes.schedule) {
			if (!validatedData.cron || !new RegExp(cronFormat).test(validatedData.cron)) {
				return {
					values,
					errors: {
						cron: {
							type: "manual",
							message: i18n.t("triggers.form.validations.invalidCron", { ns: "tabs" }),
						},
					},
				};
			}
		}

		return {
			values: validatedData,
			errors: {},
		};
	} catch (error) {
		if (error instanceof z.ZodError) {
			const errors = error.errors.reduce(
				(acc, error) => {
					const path = error.path.join(".");
					acc[path] = { type: "manual", message: error.message };

					return acc;
				},
				{} as Record<string, { message: string; type: string }>
			);

			return {
				values,
				errors,
			};
		}

		throw error;
	}
};
