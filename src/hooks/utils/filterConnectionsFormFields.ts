import { FieldValues } from "react-hook-form";
import type { ZodSchema, z } from "zod";

import { Integrations } from "@src/enums/components";

export function getZodSchemaFieldsShallow(schema: ZodSchema) {
	const fields: string[] = [];
	const proxy = new Proxy(fields, {
		get(_, key) {
			if (key === "then" || typeof key !== "string") {
				return;
			}
			fields.push(key);
		},
	});
	schema.safeParse(proxy);

	return fields;
}

export const filterConnectionValues = (
	connectionData: FieldValues,
	validationSchema: z.ZodTypeAny
): Partial<Record<keyof typeof Integrations, any>> => {
	const connectionKeys = getZodSchemaFieldsShallow(validationSchema);
	const filteredValues: Partial<Record<keyof typeof Integrations, any>> = {};

	connectionKeys?.forEach((field) => {
		if (connectionData[field]) {
			filteredValues[field as keyof typeof Integrations] = connectionData[field];
		}
	});

	return filteredValues;
};
