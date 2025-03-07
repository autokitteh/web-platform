import { t } from "i18next";
import { ZodObject, ZodTypeAny, z } from "zod";

let newVariableShema: ZodObject<Record<string, ZodTypeAny>>;

i18n.on("initialized", () => {
	newVariableShema = z.object({
		name: z.string().min(1, t("variables.nameIsRequired", { ns: "validations" })),
		value: z.string().min(1, t("variables.valueIsRequired", { ns: "validations" })),
	});
});

export { newVariableShema };
