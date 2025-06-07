import i18n, { t } from "i18next";
import { ZodObject, ZodTypeAny, z } from "zod";

import { isNameInvalid } from "@src/utilities";

let newVariableShema: ZodObject<Record<string, ZodTypeAny>>;

i18n.on("initialized", () => {
	newVariableShema = z.object({
		name: z
			.string()
			.min(1, t("variables.nameIsRequired", { ns: "validations" }))
			.superRefine((value, ctx) => {
				if (value !== "" && isNameInvalid(value)) {
					ctx.addIssue({
						code: z.ZodIssueCode.custom,
						message: t("variables.invalidName", { ns: "validations" }),
					});
				}
			}),
		value: z.string().min(1, t("variables.valueIsRequired", { ns: "validations" })),
	});
});

export { newVariableShema };
