import i18n, { t } from "i18next";
import { SingleValue } from "react-select";
import { z } from "zod";

import { SelectOption } from "@src/interfaces/components";
import { selectSchema } from "@validations";

const fallbackManualRunSchema = z.object({
	filePath: selectSchema.refine((value) => value.label, {
		message: "File name is required",
	}),
	entrypointFunction: selectSchema.refine((value) => value.label, {
		message: "Function name is required",
	}),
	params: z.string(),
});

let manualRunSchema = fallbackManualRunSchema;

i18n.on("initialized", () => {
	manualRunSchema = z.object({
		filePath: selectSchema.refine((value) => value.label, {
			message: t("fileNameIsRequired", { ns: "validations" }),
		}),
		entrypointFunction: selectSchema.refine((value) => value.label, {
			message: t("functionNameIsRequired", { ns: "validations" }),
		}),
		params: z.string(),
	});
});

export const validateManualRun = (data: {
	entrypointFunction: SingleValue<SelectOption>;
	filePath: SingleValue<SelectOption>;
	params: string;
}) => {
	const schemaToUse = manualRunSchema || fallbackManualRunSchema;
	return schemaToUse.safeParse(data);
};
