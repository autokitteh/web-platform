import { ZodEffects, ZodObject, ZodTypeAny } from "zod";

const getInnerSchema = (schema: ZodTypeAny): ZodTypeAny => {
	if (schema instanceof ZodEffects) {
		return schema._def.schema;
	}

	return schema;
};

export const flattenFormData = <T extends ZodObject<any>>(formData: any, schema: T): Record<string, any> => {
	const result: Record<string, any> = {};

	for (const key in formData) {
		if (Object.prototype.hasOwnProperty.call(formData, key)) {
			const value = formData[key];
			const schemaField = getInnerSchema(schema.shape[key]);

			if (schemaField instanceof ZodObject && "label" in schemaField.shape && "value" in schemaField.shape) {
				result[key] = value.value;
			} else {
				result[key] = value;
			}
		}
	}

	return result;
};
