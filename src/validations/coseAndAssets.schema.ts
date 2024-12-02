import i18n from "i18next";
import { ZodObject, ZodTypeAny, z } from "zod";

const selectExtensionSchema = z.object({
	label: z.string(),
	value: z.string(),
});

let codeAssetsSchema: ZodObject<Record<string, ZodTypeAny>>;

i18n.on("initialized", () => {
	codeAssetsSchema = z.object({
		extension: selectExtensionSchema.refine((value) => value.label, {
			message: i18n.t("code.extensionIsRequired", { ns: "validations" }),
		}),
		name: z.string().min(2, i18n.t("code.nameIsRequired", { ns: "validations" })),
	});
});

export { codeAssetsSchema };
