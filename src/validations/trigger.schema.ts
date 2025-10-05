import i18n, { t } from "i18next";
import { Resolver } from "react-hook-form";
import { z } from "zod";

import { TriggerTypes } from "@src/enums";
import { TriggerForm } from "@src/types/models";
import { optionalSelectSchema, selectSchema } from "@validations";

const fallbackTriggerSchema = z
	.object({
		name: z.string().min(1, "Name is required"),
		connection: selectSchema.refine((value) => value.label, {
			message: "Connection is required",
		}),
		filePath: optionalSelectSchema,
		entryFunction: z.string().optional(),
		eventType: z.string().optional(),
		eventTypeSelect: optionalSelectSchema,
		filter: z.string().optional(),
		cron: z.string().optional(),
		isDurable: z.boolean().optional(),
		isSync: z.boolean().optional(),
	})
	.superRefine((data, ctx) => {
		if (data.connection.value === TriggerTypes.schedule) {
			if (!data.filePath?.value) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: "File is required",
					path: ["filePath"],
				});
			}
			if (!data.entryFunction || data.entryFunction.length === 0) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: "Entry function is required",
					path: ["entryFunction"],
				});
			}
			if (!data.cron || data.cron.length === 0) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: "Cron expression is required",
					path: ["cron"],
				});
			}
		}
	});

export let triggerSchema = fallbackTriggerSchema;

const cronFormat =
	"^(@(?:yearly|annually|monthly|weekly|daily|midnight|hourly)" +
	"|@every\\ +(?:\\d+[dhms])+" +
	"|(?:(?:(?:\\d+,)*\\d+|\\d+[/-]\\d+|\\*(?:\\/\\d+)?|\\?)\\ +){4,5}" +
	"(?:(?:\\d+,)*\\d+|\\d+[/-]\\d+|\\*(?:\\/\\d+)?|\\?|(?:[a-zA-Z]{3}-)?[a-zA-Z]{3})" +
	"(?:[ \\d]+)?" +
	")$";

i18n.on("initialized", () => {
	triggerSchema = z
		.object({
			name: z.string().min(1, t("triggers.form.validations.nameRequired", { ns: "tabs" })),
			connection: selectSchema.refine((value) => value.label, {
				message: t("triggers.form.validations.connectionRequired", { ns: "tabs" }),
			}),
			filePath: optionalSelectSchema,
			entryFunction: z.string().optional(),
			eventType: z.string().optional(),
			eventTypeSelect: optionalSelectSchema,
			filter: z.string().optional(),
			cron: z.string().optional(),
			isDurable: z.boolean().optional(),
			isSync: z.boolean().optional(),
		})
		.superRefine((data, ctx) => {
			if (data.connection.value === TriggerTypes.schedule) {
				if (!data.filePath?.label) {
					ctx.addIssue({
						code: z.ZodIssueCode.custom,
						message: t("triggers.form.validations.fileRequired", { ns: "tabs" }),
						path: ["filePath"],
					});
				}
				if (!data.entryFunction || data.entryFunction.length === 0) {
					ctx.addIssue({
						code: z.ZodIssueCode.custom,
						message: t("triggers.form.validations.functionRequired", { ns: "tabs" }),
						path: ["entryFunction"],
					});
				}
				if (!data.cron || data.cron.length === 0) {
					ctx.addIssue({
						code: z.ZodIssueCode.custom,
						message: t("triggers.form.validations.cronRequired", { ns: "tabs" }),
						path: ["cron"],
					});
				}
			}
		});
});

export const triggerResolver: Resolver<TriggerForm> = async (values) => {
	const generateCronError = () => ({
		cron: {
			type: "manual",
			message: t("triggers.form.validations.invalidCron", { ns: "tabs" }),
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
	const validateCron = (data: TriggerForm) => {
		if (data.connection.value !== TriggerTypes.schedule) return null;
		if (!data.cron || !new RegExp(cronFormat).test(data.cron)) {
			return generateCronError();
		}

		return null;
	};
	try {
		const schemaToUse = triggerSchema || fallbackTriggerSchema;
		const validatedData = await schemaToUse.parseAsync(values);
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
