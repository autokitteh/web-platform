import { FieldValues } from "react-hook-form";

import { connectionsFormFieldsFilters } from "@src/constants";
import { Integrations } from "@src/enums/components";

export const filterConnectionValues = (
	connectionData: FieldValues,
	integrationName?: keyof typeof Integrations
): Partial<Record<keyof typeof Integrations, any>> => {
	if (!integrationName) return {};

	const integration = Integrations[integrationName];
	const fieldsToFilter = connectionsFormFieldsFilters[integration];
	const filteredValues: Partial<Record<keyof typeof Integrations, any>> = {};

	fieldsToFilter?.forEach((field) => {
		if (connectionData[field]) {
			filteredValues[field as keyof typeof Integrations] = connectionData[field];
		}
	});

	return filteredValues;
};
