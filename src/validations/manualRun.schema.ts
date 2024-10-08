import i18n from "i18next";
import { ZodObject, ZodTypeAny, z } from "zod";

const selectSchema = z.object({
	label: z.string(),
	value: z.string(),
});

const paramSchema = z.object({
	key: z.string(),
	value: z.string(),
});

let manualRunSchema: ZodObject<Record<string, ZodTypeAny>>;

i18n.on("initialized", () => {
	manualRunSchema = z.object({
		filePath: selectSchema.refine((value) => value.label, {
			message: i18n.t("fileNameIsRequired", { ns: "validations" }),
		}),
		entrypointFunction: z.string().min(1, i18n.t("functionNameIsRequired", { ns: "validations" })),
		params: z
			.array(paramSchema)
			.superRefine((items, ctx) => {
				items.forEach((item, index) => {
					if (item.key?.trim().length === 0) {
						ctx.addIssue({
							code: z.ZodIssueCode.custom,
							message: i18n.t("keyIsRequired", { ns: "validations" }),
							path: [`params.${index}.key`],
						});
					}
					if (item.value?.trim().length === 0) {
						ctx.addIssue({
							code: z.ZodIssueCode.custom,
							message: i18n.t("valueIsRequired", { ns: "validations" }),
							path: [`params.${index}.value`],
						});
					}
				});
			})
			.optional(),
	});
});

export { manualRunSchema };
