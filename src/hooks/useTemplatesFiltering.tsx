import { useMemo, useCallback } from "react";

import { defaultSelectedMultipleSelect } from "@constants";
import { SelectOption } from "@interfaces/components";
import { TemplateCategory } from "@interfaces/store";

export const useTemplatesFiltering = (
	categories: TemplateCategory[] | undefined,
	selectedCategories: string[],
	selectedIntegrations: string[],
	integrationTypes: SelectOption[]
) => {
	const isDefaultSelected = useCallback((list: string[]) => {
		return list.length === 0 || list.includes(defaultSelectedMultipleSelect);
	}, []);

	const allTemplates = useMemo(() => {
		if (!categories) return [];
		return categories.flatMap((cat) => cat.templates);
	}, [categories]);

	const templatesByCategory = useMemo(() => {
		if (isDefaultSelected(selectedCategories)) {
			return allTemplates;
		}
		return allTemplates.filter((template) => selectedCategories.includes(template.category));
	}, [allTemplates, selectedCategories, isDefaultSelected]);

	const filteredTemplates = useMemo(() => {
		if (isDefaultSelected(selectedIntegrations)) {
			return templatesByCategory;
		}
		return templatesByCategory.filter((template) =>
			selectedIntegrations.every((integration) => template.integrations.includes(integration))
		);
	}, [templatesByCategory, selectedIntegrations, isDefaultSelected]);

	const filteredCategories = useMemo(() => {
		if (!categories) return [];

		const filteredCategoryNames = isDefaultSelected(selectedIntegrations)
			? null
			: new Set(filteredTemplates.map((template) => template.category));

		return categories.map((category) => {
			const isVisible = !filteredCategoryNames || filteredCategoryNames.has(category.name);
			const count = isDefaultSelected(selectedIntegrations)
				? category.templates.length
				: filteredTemplates.filter((template) => template.category === category.name).length;

			return { ...category, count, isVisible };
		});
	}, [categories, filteredTemplates, selectedIntegrations, isDefaultSelected]);

	const filteredIntegrations = useMemo(() => {
		if (!integrationTypes) return [];

		const filteredIntegrationNames = new Set(filteredTemplates.flatMap((template) => template.integrations));

		return integrationTypes.map((integration) => ({
			...integration,
			count: filteredTemplates.filter((template) => template.integrations.includes(integration.value)).length,
			isVisible: filteredIntegrationNames.has(integration.value),
		}));
	}, [filteredTemplates, integrationTypes]);

	const popoverItems = useMemo(() => {
		const categoryItems = filteredCategories
			.filter((category) => category.isVisible)
			.map(({ name, count }) => ({
				id: name,
				label: name,
				count,
			}));

		const integrationItems = filteredIntegrations
			.filter((integration) => integration.isVisible)
			.map(({ icon, label, value, count }) => ({
				id: value,
				label,
				icon,
				count,
			}));

		return { categoryItems, integrationItems };
	}, [filteredCategories, filteredIntegrations]);

	return {
		filteredTemplates,
		popoverItems,
	};
};
