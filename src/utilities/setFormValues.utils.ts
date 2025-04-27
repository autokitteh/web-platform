import { Variable } from "@type/models";

type IntegrationValueToForm = { [key: string]: string };

const processValue = (formFieldName: string, variableValue: string) => {
	if (formFieldName === "region") {
		return { label: variableValue, value: variableValue };
	}

	return variableValue;
};

export const setFormValues = (
	variables: Variable[] | undefined,
	integrationValueToForm: IntegrationValueToForm,
	setValue: (fieldName: string, value: any) => void
): void => {
	if (!variables) return;

	Object.entries(integrationValueToForm).forEach(([formFieldName, variableName]) => {
		const variable = variables.find((v) => v.name === variableName);
		if (!variable?.value) {
			return;
		}
		setValue(formFieldName, processValue(formFieldName, variable.value));
	});
};
