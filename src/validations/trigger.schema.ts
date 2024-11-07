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
		eventTypeSelect: selectItemSchema.optional(),
		filter: z.string().optional(),
		cron: z.string().optional(),
	});
});

export type TriggerFormData = z.infer<typeof triggerSchema>;
export const triggerResolver: Resolver<TriggerFormData> = async (values) => {
	const generateCronError = () => ({
		cron: {
			type: "manual",
			message: i18n.t("triggers.form.validations.invalidCron", { ns: "tabs" }),
		},
	});
	const processZodErrors = (error: z.ZodError) => {
		return error.errors.reduce(
			(acc, error) => {
				const path = error.path.join(".");
				acc[path] = { type: "manual", message: error.message };

				return acc;
			},
			{} as Record<string, { message: string; type: string }>
		);
	};
	const validateCron = (data: TriggerFormData) => {
		if (data.connection.value !== TriggerTypes.schedule) return null;
		if (!data.cron || !new RegExp(cronFormat).test(data.cron)) {
			return generateCronError();
		}

		return null;
	};
	try {
		const validatedData = await triggerSchema.parseAsync(values);
		const cronError = validateCron(validatedData);
		if (cronError) {
			return {
				values,
				errors: cronError,
			};
		}

		return {
			values: validatedData,
			errors: {},
		};
	} catch (error) {
		if (error instanceof z.ZodError) {
			return {
				values,
				errors: processZodErrors(error),
			};
		}
		throw error;
	}
};
