import { Integrations } from "@src/enums/components";

export const connectionsFormFieldsFilters: Partial<Record<Integrations, string[]>> = {
	[Integrations.github]: ["pat", "webhook", "secret"],
	[Integrations.google]: ["jsonKey"],
};
