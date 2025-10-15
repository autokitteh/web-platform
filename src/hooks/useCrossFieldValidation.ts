import { UseFormTrigger, FieldValues, Path } from "react-hook-form";

/**
 * Creates onChange handlers for cross-field validation.
 * When one field changes, it automatically triggers validation on the related field(s).
 *
 * @param trigger - The trigger function from react-hook-form
 * @param fieldName - The name of the current field
 * @param relatedFields - Array of field names that should be re-validated when this field changes
 * @returns An onChange handler that triggers validation on related fields
 *
 * @example
 * ```tsx
 * const { register, trigger } = useForm();
 * const handleUsernameChange = useCrossFieldValidation(trigger, 'username', ['password']);
 *
 * <Input {...register('username', { onChange: handleUsernameChange })} />
 * ```
 */
export const useCrossFieldValidation = <TFieldValues extends FieldValues = FieldValues>(
	trigger: UseFormTrigger<TFieldValues>,
	relatedFields: Path<TFieldValues>[]
) => {
	return () => {
		relatedFields.forEach((field) => {
			trigger(field);
		});
	};
};
