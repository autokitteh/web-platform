import i18n from "i18next";
import { Resolver } from "react-hook-form";
import { ZodObject, ZodTypeAny, z } from "zod";

import { TriggerTypes } from "@src/enums";

const selectItemSchema = z.object({
	disabled: z.boolean().optional(),
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
		name: z.string().min(1, "Name is required"),
		connection: z.object({
			label: z.string(),
			value: z.string().min(1, "Connection is required"),
		}),
		filePath: selectItemSchema.refine((value) => value.label, {
			message: "File name is required",
		}),
		entryFunction: z.string().min(1, "Function name is required"),
		eventType: z.string().optional(),
		filter: z.string().optional(),
		cron: z
			.string()
			.regex(new RegExp(cronFormat), {
				message: "Invalid cron expression format",
			})
			.optional(),
	});
});

export type TriggerFormData = z.infer<typeof triggerSchema>;
export const triggerResolver: Resolver<TriggerFormData> = async (values) => {
	try {
		// First, validate with the base schema
		const validatedData = await triggerSchema.parseAsync(values);

		// Then, apply custom validation
		if (validatedData.connection.value === TriggerTypes.schedule) {
			if (!validatedData.cron || !new RegExp(cronFormat).test(validatedData.cron)) {
				return {
					values,
					errors: {
						cron: {
							type: "manual",
							message: "Cron expression is required and must be valid for schedule triggers",
						},
					},
				};
			}
		}

		// If all validations pass, return the validated data
		return {
			values: validatedData,
			errors: {},
		};
	} catch (error) {
		// If Zod validation fails, format the errors
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

		// If it's not a Zod error, re-throw
		throw error;
	}
};
