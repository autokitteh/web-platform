import i18n from "i18next";
import { ZodObject, ZodTypeAny, z } from "zod";

import { selectSchema } from "@validations";

const createManualRunSchema = () =>
	z.object({
		filePath: selectSchema.refine((value) => value.label, {
			message: i18n.t("fileNameIsRequired", { ns: "validations" }),
		}),
		entrypointFunction: selectSchema.refine((value) => value.label, {
			message: i18n.t("functionNameIsRequired", { ns: "validations" }),
		}),
		params: z.string().default("{}"),
	});

let manualRunSchema: ZodObject<Record<string, ZodTypeAny>>;

i18n.on("initialized", () => {
	manualRunSchema = createManualRunSchema();
});

export { manualRunSchema };
