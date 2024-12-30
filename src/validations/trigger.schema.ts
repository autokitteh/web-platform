import i18n from "i18next";
import { Resolver } from "react-hook-form";
import { z } from "zod";

import { TriggerTypes } from "@src/enums";
import { selectSchema } from "@validations";

export let triggerSchema: z.ZodSchema;

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
			name: z.string().min(1, i18n.t("triggers.form.validations.nameRequired", { ns: "tabs" })),
			connection: selectSchema.refine((value) => value.label, {
				message: i18n.t("triggers.form.validations.connectionRequired", { ns: "tabs" }),
			}),
			filePath: z
				.union([selectSchema, z.object({ label: z.string().optional(), value: z.string().optional() })])
				.optional(),
			entryFunction: z.string().optional(),
			eventType: z.string().optional(),
			eventTypeSelect: selectSchema.optional(),
			filter: z.string().optional(),
			cron: z.string().optional(),
		})
		.superRefine((data, ctx) => {
			if (data.entryFunction?.trim() && !data.filePath?.value) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: i18n.t("triggers.form.validations.fileRequired", { ns: "tabs" }),
					path: ["filePath"],
				});
			}

			if (!data.filePath?.value) {
				return;
			}
			if (!data.entryFunction || data.entryFunction.trim() === "") {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: i18n.t("triggers.form.validations.functionRequired", { ns: "tabs" }),
					path: ["entryFunction"],
				});
			}
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
