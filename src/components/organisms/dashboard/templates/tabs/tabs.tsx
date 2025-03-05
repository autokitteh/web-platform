import React, { useCallback, useEffect, useMemo, useState } from "react";

import { useAutoAnimate } from "@formkit/auto-animate/react";
import { useTranslation } from "react-i18next";

import { defaultTemplateProjectCategory, defaultSelectedIntegrations } from "@constants";
import { integrationTypes } from "@constants/lists";
import { ModalName } from "@src/enums/components";
import { TemplateMetadata } from "@src/interfaces/store";
import { useModalStore, useTemplatesStore } from "@src/store";

import { Loader } from "@components/atoms";
import {
	ProjectTemplateCard,
	ProjectTemplateCreateModal,
	CategoriesMenuPopoverItem,
	IntegrationsMenuPopoverItem,
	MultiplePopoverSelect,
} from "@components/organisms/dashboard/templates/tabs";

export const ProjectTemplatesTabs = () => {
	const { t } = useTranslation("dashboard", { keyPrefix: "templates" });
	const { openModal } = useModalStore();
	const { error, fetchTemplates, isLoading, sortedCategories: categories } = useTemplatesStore();
	const [parent] = useAutoAnimate();
	const [selectedTemplate, setSelectedTemplate] = useState<TemplateMetadata>();
	const [selectedCategories, setSelectedCategories] = useState<string[]>([defaultTemplateProjectCategory]);
	const [selectedIntegrations, setSelectedIntegrations] = useState<string[]>(defaultSelectedIntegrations);

	useEffect(() => {
		fetchTemplates();
	}, [fetchTemplates]);

	const handleCardCreateClick = useCallback(
		(template: TemplateMetadata) => {
			setSelectedTemplate(template);
			openModal(ModalName.templateCreateProject);
		},
		[openModal]
	);

	const totalTemplatesCount = useMemo(
		() => categories?.reduce((count, category) => count + category.templates.length, 0) || 0,
		[categories]
	);

	const popoverCategoriesItems = useMemo(
		() => [
			{
				id: "All",
				label: (
					<CategoriesMenuPopoverItem
						count={totalTemplatesCount}
						isCurrentCategory={selectedCategories.includes("All")}
						name={t("all")}
					/>
				),
			},
			...(categories?.map(({ name, templates }) => ({
				id: name,
				label: (
					<CategoriesMenuPopoverItem
						count={templates.length}
						isCurrentCategory={selectedCategories.includes(name)}
						name={name}
					/>
				),
			})) || []),
		],
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[totalTemplatesCount, selectedCategories, categories]
	);

	const popoverIntegrationsItems = useMemo(
		() => [
			...(integrationTypes?.map(({ icon, label, value }) => ({
				id: value,
				label: (
					<IntegrationsMenuPopoverItem
						icon={icon}
						isCurrentIntegration={selectedIntegrations.includes(value)}
						name={label}
					/>
				),
			})) || []),
		],
		[selectedIntegrations]
	);

	const activeCategories = useMemo(
		() =>
			categories?.filter(
				(category) => selectedCategories.includes("All") || selectedCategories.includes(category.name)
			),
		[selectedCategories, categories]
	);

	const filteredTemplates = useMemo(
		() =>
			activeCategories?.flatMap((category) =>
				category.templates.filter(
					(template) =>
						selectedIntegrations.length === 0 ||
						selectedIntegrations.some((integration) => template.integrations.includes(integration))
				)
			),
		[activeCategories, selectedIntegrations]
	);

	return (
		<div className="flex h-full flex-1 flex-col">
			{error ? <div className="mb-8 text-center text-xl text-error">{error}</div> : null}
			{isLoading ? (
				<Loader isCenter />
			) : (
				<>
					<div className="flex gap-3">
						<MultiplePopoverSelect
							defaultSelectedItems={selectedCategories}
							emptyListMessage={t("noCategories")}
							items={popoverCategoriesItems}
							label={t("categories")}
							onItemsSelected={setSelectedCategories}
						/>
						<MultiplePopoverSelect
							defaultSelectedItems={selectedIntegrations}
							emptyListMessage={t("noIntegrations")}
							items={popoverIntegrationsItems}
							label={t("integrations")}
							onItemsSelected={setSelectedIntegrations}
						/>
					</div>

					<div className="mt-4 grid grid-cols-auto-fit-248 gap-x-4 gap-y-5 pb-5 text-black" ref={parent}>
						{filteredTemplates?.map((template) => (
							<ProjectTemplateCard
								category={template.category}
								key={template.title}
								onCreateClick={() => handleCardCreateClick(template)}
								template={template}
							/>
						))}
					</div>
				</>
			)}
			{selectedTemplate ? (
				<ProjectTemplateCreateModal
					cardTemplate={selectedTemplate}
					category={categories?.map((cat) => cat.name).join(", ")}
				/>
			) : null}
		</div>
	);
};
