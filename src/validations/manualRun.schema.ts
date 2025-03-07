import { t } from "i18next";
import { SingleValue } from "react-select";
import { z } from "zod";

import { SelectOption } from "@src/interfaces/components";
import { selectSchema } from "@validations";

export const validateManualRun = (data: {
	entrypointFunction: SingleValue<SelectOption>;
	filePath: SingleValue<SelectOption>;
	params: string;
}) => {
	const schema = z.object({
		filePath: selectSchema.refine((value) => value.label, {
			message: t("fileNameIsRequired", { ns: "validations" }),
		}),
		entrypointFunction: selectSchema.refine((value) => value.label, {
			message: t("functionNameIsRequired", { ns: "validations" }),
		}),
		params: z.string(),
	});

	return schema.safeParse(data);
};
