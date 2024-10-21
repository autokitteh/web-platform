import i18n from "i18next";
import { ZodObject, ZodTypeAny, z } from "zod";

const selectSchema = z.object({
	label: z.string(),
	value: z.string(),
});

const paramSchema = z.object({
	key: z.string().min(1, i18n.t("keyIsRequired", { ns: "validations" })),
	value: z.string().min(1, i18n.t("valueIsRequired", { ns: "validations" })),
});

let manualRunSchema: ZodObject<Record<string, ZodTypeAny>>;

i18n.on("initialized", () => {
	manualRunSchema = z.object({
		isJson: z.boolean().optional(),
		filePath: selectSchema.refine((value) => value.label, {
			message: i18n.t("fileNameIsRequired", { ns: "validations" }),
		}),
		entrypointFunction: z.string().min(1, i18n.t("functionNameIsRequired", { ns: "validations" })),
		params: z
			.array(paramSchema)
			.optional()
			.superRefine((items, ctx) => {
				if (items && !!items.length) {
					const keys = new Set<string>();
					items.forEach((item, index) => {
						if (!item.key?.trim()) {
							ctx.addIssue({
								code: z.ZodIssueCode.custom,
								message: i18n.t("keyIsRequired", { ns: "validations" }),
								path: [`${index}.key`],
							});

							return;
						}

						if (keys.has(item.key)) {
							ctx.addIssue({
								code: z.ZodIssueCode.custom,
								message: i18n.t("duplicateKeyError", { ns: "validations" }),
								path: [`${index}.key`],
							});

							return;
						}

						keys.add(item.key);

						if (!item.value?.trim()) {
							ctx.addIssue({
								code: z.ZodIssueCode.custom,
								message: i18n.t("valueIsRequired", { ns: "validations" }),
								path: [`${index}.value`],
							});
						}
					});
				}
			}),
		jsonParams: z
			.string()
			.optional()
			.refine(
				(value) => {
					if (!value) return true;
					try {
						JSON.parse(value);

						return true;
					} catch {
						return false;
					}
				},
				{
					message: i18n.t("invalidJsonFormat", { ns: "validations" }),
				}
			),
	});
});

export { manualRunSchema };
