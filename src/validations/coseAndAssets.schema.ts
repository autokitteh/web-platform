import i18n from "i18next";
import { z, ZodObject, ZodTypeAny } from "zod";

const selectExtensionSchema = z.object({
	label: z.string(),
	value: z.string(),
});

let codeAssetsSchema: ZodObject<Record<string, ZodTypeAny>>;

i18n.on("initialized", () => {
	codeAssetsSchema = z.object({
		name: z.string().min(2, i18n.t("nameIsRequired", { ns: "validations" })),
		extension: selectExtensionSchema.refine((value) => value.label, {
			message: i18n.t("extensionIsRequired", { ns: "validations" }),
		}),
	});
});

export { codeAssetsSchema };
