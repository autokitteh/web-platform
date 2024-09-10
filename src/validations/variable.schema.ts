import i18n from "i18next";
import { ZodObject, ZodTypeAny, z } from "zod";

let newVariableShema: ZodObject<Record<string, ZodTypeAny>>;

i18n.on("initialized", () => {
	newVariableShema = z.object({
		name: z.string().min(2, i18n.t("nameIsRequired", { ns: "validations" })),
		value: z.string().min(2, i18n.t("valueIsRequired", { ns: "validations" })),
	});
});

export { newVariableShema };
