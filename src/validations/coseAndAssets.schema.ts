import i18n, { t } from "i18next";
import { z } from "zod";

import { selectSchema } from "@validations";

const fallbackCodeAssetsSchema = z.object({
	extension: selectSchema.refine((value) => value.label, {
		message: "Extension is required",
	}),
	name: z.string().min(2, "Name is required"),
});

export let codeAssetsSchema = fallbackCodeAssetsSchema;

i18n.on("initialized", () => {
	codeAssetsSchema = z.object({
		extension: selectSchema.refine((value) => value.label, {
			message: t("code.extensionIsRequired", { ns: "validations" }),
		}),
		name: z.string().min(2, t("code.nameIsRequired", { ns: "validations" })),
	});
});
