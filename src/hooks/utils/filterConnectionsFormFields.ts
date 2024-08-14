import { FieldValues } from "react-hook-form";
import { ZodSchema, z } from "zod";

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

const setNestedValue = (object: Record<string, any>, keys: string[], value: any) => {
	let current = object;
	keys.forEach((key, index) => {
		if (index === keys.length - 1) {
			current[key] = value;
		} else {
			if (current[key] === undefined) {
				current[key] = {}; // Initialize an empty object if undefined
			}
			current = current[key];
		}
	});
};

export const filterConnectionValues = (
	connectionData: FieldValues,
	validationSchema: ZodSchema
): Partial<FieldValues> => {
	const connectionKeys = getZodKeys(validationSchema);
	const filteredValues: Partial<FieldValues> = {};

	connectionKeys.forEach((field) => {
		const keys = field.split(".");
		let value: any = connectionData;

		for (const key of keys) {
			if (value && key in value) {
				value = value[key];
			} else {
				value = undefined;
				break;
			}
		}

		if (value !== undefined) {
			if (keys.length > 1 && keys[keys.length - 1] === "value") {
				setNestedValue(filteredValues, [keys[0]], value);
			} else {
				setNestedValue(filteredValues, keys, value);
			}
		}
	});

	return filteredValues;
};
