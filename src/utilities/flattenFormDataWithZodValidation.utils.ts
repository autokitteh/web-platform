import { ZodEffects, ZodObject, ZodTypeAny } from "zod";

const getInnerSchema = (schema: ZodTypeAny): ZodTypeAny => {
	if (schema instanceof ZodEffects) {
		return schema._def.schema;
	}

	return schema;
};

export const flattenFormData = <T extends ZodObject<any> | ZodEffects<any>>(
	formData: any,
	schema: T
): Record<string, any> => {
	const result: Record<string, any> = {};
	const innerSchema = getInnerSchema(schema as ZodTypeAny) as ZodObject<any>;

	for (const key in formData) {
		if (Object.prototype.hasOwnProperty.call(formData, key)) {
			const value = formData[key];
			const schemaField = getInnerSchema(innerSchema.shape[key]);

			if (schemaField instanceof ZodObject && "label" in schemaField.shape && "value" in schemaField.shape) {
				result[key] = value.value;
			} else {
				result[key] = value;
			}
		}
	}

	return result;
};
