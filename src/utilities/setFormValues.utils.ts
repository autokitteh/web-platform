import { Variable } from "@src/types/models";

type IntegrationValueToForm = { [key: string]: string };

export const setFormValues = (
	variables: Variable[],
	integrationValueToForm: IntegrationValueToForm,
	setValue: (fieldName: string, value: any) => void
): void => {
	const processValue = (formFieldName: string, variableValue: string) => {
		if (formFieldName === "region") {
			return { label: variableValue, value: variableValue };
		}

		return variableValue;
	};

	Object.entries(integrationValueToForm).forEach(([formFieldName, variableName]) => {
		const variable = variables.find((v) => v.name === variableName);
		if (variable && variable.value) {
			setValue(formFieldName, processValue(formFieldName, variable.value));
		}
	});
};
