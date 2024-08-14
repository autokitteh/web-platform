import { FieldValues } from "react-hook-form";
import { ZodSchema, z } from "zod";

import { Integrations } from "@src/enums/components";

export const getZodKeys = <T extends z.ZodTypeAny>(schema: T): string[] => {
	if (schema === null || schema === undefined) return [];
	if (schema instanceof z.ZodNullable || schema instanceof z.ZodOptional) return getZodKeys(schema.unwrap());
	if (schema instanceof z.ZodArray) return getZodKeys(schema.element);
	if (schema instanceof z.ZodObject) {
		const entries = Object.entries(schema.shape);

		return entries.flatMap(([key, value]) => {
			const nested = value instanceof z.ZodType ? getZodKeys(value).map((subKey) => `${key}.${subKey}`) : [];

			return nested.length ? nested : key;
		});
	}

	return [];
};

export const filterConnectionValues = (
	connectionData: FieldValues,
	validationSchema: ZodSchema
): Partial<Record<keyof typeof Integrations, any>> => {
	const connectionKeys = getZodKeys(validationSchema);
	const filteredValues: Partial<Record<keyof typeof Integrations, any>> = {};

	connectionKeys.forEach((field) => {
		if (connectionData[field]) {
			filteredValues[field as keyof typeof Integrations] = connectionData[field];
		}
	});

	return filteredValues;
};
