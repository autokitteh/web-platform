import i18n from "i18next";
import { ZodObject, ZodTypeAny, z } from "zod";

import { selectSchema } from "@validations";

let manualRunSchema: ZodObject<Record<string, ZodTypeAny>>;

i18n.on("initialized", () => {
	manualRunSchema = z.object({
		isJson: z.boolean().optional(),
		filePath: selectSchema.refine((value) => value.label, {
			message: i18n.t("fileNameIsRequired", { ns: "validations" }),
		}),
		entrypointFunction: selectSchema.refine((value) => value.label, {
			message: i18n.t("functionNameIsRequired", { ns: "validations" }),
		}),
		params: z
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
					message: i18n.t("manualRun.invalidJsonFormat", { ns: "validations" }),
				}
			),
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
					message: i18n.t("manualRun.invalidJsonFormat", { ns: "validations" }),
				}
			),
	});
});

export { manualRunSchema };
