import { ZodObject } from "zod";

export const flattenFormData = <T extends ZodObject<any>>(formData: any, schema: T): Record<string, any> => {
	const result: Record<string, any> = {};

	for (const key in formData) {
		if (Object.prototype.hasOwnProperty.call(formData, key)) {
			const value = formData[key];
			const schemaField = schema.shape[key];

			if (schemaField instanceof ZodObject && "label" in schemaField.shape && "value" in schemaField.shape) {
				// Flatten the object if it matches the selectFieldSchema pattern
				result[key] = value.value;
			} else {
				// Otherwise, keep the value as is
				result[key] = value;
			}
		}
	}

	return result;
};
