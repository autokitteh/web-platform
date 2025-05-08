import { selectIntegrationLinearActor } from "@src/constants/lists/connections";
import { Variable } from "@src/types/models";

type IntegrationValueToForm = { [key: string]: string };

const processValue = (formFieldName: string, variableValue: string) => {
	if (formFieldName === "region") {
		return { label: variableValue, value: variableValue };
	}
	if (formFieldName === "actor") {
		const actor = selectIntegrationLinearActor.find((actor) => actor.value === variableValue);
		return actor ? { label: actor.label, value: actor.value } : undefined;
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
